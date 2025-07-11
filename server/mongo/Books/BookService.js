import { Book } from '../Books/mongoModel.js';
import { User } from '../Users/mongoModel.js';

export class BookService {
  static async getAllBooks(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        genre,
        author,
        status,
        minRating,
        maxRating,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options;

      const filter = {};

      if (genre) filter.genre = new RegExp(genre, 'i');
      if (author) filter.author = new RegExp(author, 'i');
      if (status) filter.status = status;

      if (minRating !== undefined || maxRating !== undefined) {
        filter.rating = {};
        if (minRating !== undefined) filter.rating.$gte = Number(minRating);
        if (maxRating !== undefined) filter.rating.$lte = Number(maxRating);
      }

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (page - 1) * limit;
      const [books, total] = await Promise.all([
        Book.find(filter)
          .populate('checkedOutBy', 'name email')
          .populate('reviews.user', 'name')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .exec(),
        Book.countDocuments(filter),
      ]);

      return {
        books,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      throw new Error(`Failed to fetch books: ${error.message}`);
    }
  }

  static async getBookById(bookId) {
    try {
      const book = await Book.findById(bookId)
        .populate('checkedOutBy', 'name email')
        .populate('reviews.user', 'name')
        .exec();

      if (!book) {
        throw new Error('Book not found');
      }

      return book;
    } catch (error) {
      if (error.kind === 'ObjectId') {
        throw new Error('Invalid book ID format');
      }
      throw error;
    }
  }

  static async createBook(bookData) {
    try {
      const book = new Book(bookData);
      await book.save();
      return book;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('A book with this ISBN already exists');
      }
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }
      throw error;
    }
  }

  static async updateBook(bookId, updateData) {
    try {
      const restrictedFields = ['_id', '__v', 'createdAt'];
      restrictedFields.forEach(field => delete updateData[field]);

      const book = await Book.findByIdAndUpdate(
        bookId,
        { ...updateData, updatedAt: new Date() },
        {
          new: true,
          runValidators: true,
        },
      )
        .populate('checkedOutBy', 'name email')
        .populate('reviews.user', 'name')
        .exec();

      if (!book) {
        throw new Error('Book not found');
      }

      return book;
    } catch (error) {
      if (error.kind === 'ObjectId') {
        throw new Error('Invalid book ID format');
      }
      if (error.code === 11000) {
        throw new Error('A book with this ISBN already exists');
      }
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }
      throw error;
    }
  }

  static async deleteBook(bookId) {
    try {
      const book = await Book.findByIdAndDelete(bookId);

      if (!book) {
        throw new Error('Book not found');
      }

      return book;
    } catch (error) {
      if (error.kind === 'ObjectId') {
        throw new Error('Invalid book ID format');
      }
      throw error;
    }
  }

  static async searchBooks(searchQuery, options = {}) {
    try {
      const { limit = 20, ...filters } = options;

      const filter = {
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { author: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
        ],
      };

      if (filters.genre) filter.genre = new RegExp(filters.genre, 'i');
      if (filters.author) filter.author = new RegExp(filters.author, 'i');
      if (filters.status) filter.status = filters.status;

      const books = await Book.find(filter)
        .populate('checkedOutBy', 'name email')
        .populate('reviews.user', 'name')
        .sort({ rating: -1, title: 1 })
        .limit(limit)
        .exec();

      return books;
    } catch (error) {
      throw new Error(`Failed to search books: ${error.message}`);
    }
  }

  static async checkOutBook(bookId, userId, dueDate) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const book = await Book.findById(bookId);
    if (!book) {
      throw new Error('Book not found');
    }

    await book.checkOut(userId, dueDate);
    return book;
  }

  static async returnBook(bookId, userId) {
    const book = await Book.findById(bookId);
    if (!book) {
      throw new Error('Book not found');
    }

    if (book.checkedOutBy?.toString() !== userId) {
      throw new Error('This book was not checked out by the specified user');
    }

    await book.returnBook();
    return book;
  }

  static async getUserCheckedOutBooks(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const books = await Book.find({
        checkedOutBy: userId,
        status: 'checked_out',
      })
        .populate('checkedOutBy', 'name email')
        .populate('reviews.user', 'name')
        .sort({ checkedOutAt: -1 })
        .exec();

      return books;
    } catch (error) {
      throw new Error(`Failed to fetch user's checked out books: ${error.message}`);
    }
  }

  static async addReview(bookId, userId, rating, comment) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const book = await Book.findById(bookId);
    if (!book) {
      throw new Error('Book not found');
    }

    await book.addReview(userId, rating, comment);

    return await Book.findById(bookId)
      .populate('checkedOutBy', 'name email')
      .populate('reviews.user', 'name')
      .exec();
  }
}

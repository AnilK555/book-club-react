import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters'],
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    trim: true,
    maxlength: [50, 'Genre cannot exceed 50 characters'],
  },
  publicationYear: {
    type: Number,
    required: [true, 'Publication year is required'],
    min: [1000, 'Publication year must be at least 1000'],
    max: [new Date().getFullYear() + 5, 'Publication year cannot be more than 5 years in the future'],
  },
  description: {
    type: String,
    required: [true, 'Book description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  status: {
    type: String,
    required: [true, 'Book status is required'],
    enum: {
      values: ['available', 'checked_out', 'reserved', 'maintenance'],
      message: 'Status must be one of: available, checked_out, reserved, maintenance',
    },
    default: 'available',
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0,
  },
  totalPages: {
    type: Number,
    required: [true, 'Total pages is required'],
    min: [1, 'Total pages must be at least 1'],
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function (v) {

        const isbn = v.replace(/[-\s]/g, '');
        return /^(97[89])?\d{9}[\dX]$/i.test(isbn);
      },
      message: 'Please provide a valid ISBN-10 or ISBN-13',
    },
  },
  coverImage: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        if (!v) return true;
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Cover image must be a valid URL pointing to an image file',
    },
  },
  language: {
    type: String,
    trim: true,
    default: 'English',
    maxlength: [30, 'Language cannot exceed 30 characters'],
  },
  publisher: {
    type: String,
    trim: true,
    maxlength: [100, 'Publisher name cannot exceed 100 characters'],
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters'],
  }],

  checkedOutBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  checkedOutDate: {
    type: Date,
    default: null,
  },
  dueDate: {
    type: Date,
    default: null,
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Review comment cannot exceed 500 characters'],
    },
    reviewDate: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

bookSchema.index({ title: 1 });
bookSchema.index({ author: 1 });
bookSchema.index({ genre: 1 });
bookSchema.index({ status: 1 });
bookSchema.index({ isbn: 1 }, { unique: true });
bookSchema.index({ rating: -1 });
bookSchema.index({ publicationYear: 1 });

bookSchema.virtual('averageRating').get(function () {
  if (this.reviews && this.reviews.length > 0) {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
  }
  return this.rating || 0;
});

bookSchema.virtual('reviewCount').get(function () {
  return this.reviews ? this.reviews.length : 0;
});

bookSchema.virtual('isAvailable').get(function () {
  return this.status === 'available';
});

bookSchema.statics.findByGenre = function (genre) {
  return this.find({ genre: new RegExp(genre, 'i') });
};

bookSchema.statics.findByAuthor = function (author) {
  return this.find({ author: new RegExp(author, 'i') });
};

bookSchema.statics.findAvailable = function () {
  return this.find({ status: 'available' });
};

bookSchema.statics.searchBooks = function (searchTerm) {
  return this.find({
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { author: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
    ],
  });
};

bookSchema.methods.checkOut = function (userId, dueDate) {
  if (this.status !== 'available') {
    throw new Error('Book is not available for checkout');
  }

  this.status = 'checked_out';
  this.checkedOutBy = userId;
  this.checkedOutDate = new Date();
  this.dueDate = dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  return this.save();
};

bookSchema.methods.returnBook = function () {
  if (this.status !== 'checked_out') {
    throw new Error('Book is not currently checked out');
  }

  this.status = 'available';
  this.checkedOutBy = null;
  this.checkedOutDate = null;
  this.dueDate = null;

  return this.save();
};

bookSchema.methods.addReview = function (userId, rating, comment) {

  this.reviews = this.reviews.filter(review =>
    review.user.toString() !== userId.toString(),
  );

  this.reviews.push({
    user: userId,
    rating,
    comment,
    reviewDate: new Date(),
  });

  return this.save();
};

export const Book = mongoose.model('Book', bookSchema);

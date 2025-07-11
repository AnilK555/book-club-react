import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';
import process from 'process';
import mongoose from 'mongoose';

import { BookService } from './mongo/Books/BookService.js';
import { UserService } from './mongo/Users/UserService.js';

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const validateSignup = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: '24h' },
  );
};

app.get('/api/health', async (req, res) => {
  try {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({
      status: 'Server is running',
      timestamp: new Date().toISOString(),
      database: {
        mongodb: mongoStatus,
        connection: mongoose.connection.name || 'unknown',
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error checking health',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

app.post('/api/auth/signup', validateSignup, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password, name } = req.body;

    const newUser = await UserService.createUser({ name, email, password });

    const token = generateToken(newUser.id.toString(), newUser.email);

    res.status(201).json({
      message: 'User created successfully',
      user: newUser,
      token,
    });

  } catch (error) {
    console.error('Signup error:', error);

    if (error.message === 'User already exists with this email' || error.code === 11000) {
      return res.status(409).json({
        message: 'User already exists with this email',
      });
    }

    res.status(500).json({
      message: 'Internal server error during signup',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

app.post('/api/auth/check-user', async (req, res) => {
  const { email } = req.body;
  try {
    const userExists = await UserService.userExists(email);
    res.json({ exists: userExists });
  } catch (error) {
    console.error('Check user error:', error);
    res.status(500).json({
      message: 'Internal server error while checking user',
    });
  }
});

app.post('/api/auth/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const user = await UserService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await UserService.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id.toString(), user.email);

    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.json({
      message: 'Login successful',
      user: userResponse,
      token,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Internal server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({
    message: 'Logout successful. Please remove the token from client storage.',
  });
});

app.get('/api/books', async (req, res) => {
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
    } = req.query;

    const options = {
      page: Number(page),
      limit: Number(limit),
      genre,
      author,
      status,
      minRating: minRating ? Number(minRating) : undefined,
      maxRating: maxRating ? Number(maxRating) : undefined,
      search,
      sortBy,
      sortOrder,
    };

    const result = await BookService.getAllBooks(options);

    res.json({
      message: 'Books retrieved successfully',
      books: result.books,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      message: 'Failed to retrieve books',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

app.get('/api/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const book = await BookService.getBookById(id);

    res.json({
      message: 'Book retrieved successfully',
      book,
    });
  } catch (error) {
    console.error('Get book error:', error);
    const statusCode = error.message.includes('not found') ? 404 :
      error.message.includes('Invalid') ? 400 : 500;
    res.status(statusCode).json({
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

app.post('/api/books', [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author is required')
    .isLength({ max: 100 })
    .withMessage('Author name cannot exceed 100 characters'),
  body('genre')
    .trim()
    .notEmpty()
    .withMessage('Genre is required')
    .isLength({ max: 50 })
    .withMessage('Genre cannot exceed 50 characters'),
  body('publicationYear')
    .isInt({ min: 1000, max: new Date().getFullYear() + 5 })
    .withMessage('Publication year must be a valid year'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('totalPages')
    .isInt({ min: 1 })
    .withMessage('Total pages must be a positive number'),
  body('isbn')
    .trim()
    .notEmpty()
    .withMessage('ISBN is required'),
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  body('coverImage')
    .optional()
    .isURL()
    .withMessage('Cover image must be a valid URL'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const book = await BookService.createBook(req.body);

    res.status(201).json({
      message: 'Book created successfully',
      book,
    });
  } catch (error) {
    console.error('Create book error:', error);
    const statusCode = error.message.includes('already exists') ? 409 :
      error.message.includes('Validation') ? 400 : 500;
    res.status(statusCode).json({
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

app.patch('/api/books/:id', [
  body('field')
    .notEmpty()
    .withMessage('Field name is required'),
  body('value')
    .notEmpty()
    .withMessage('Field value is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { field, value } = req.body;

    const allowedFields = [
      'title', 'author', 'genre', 'description', 'status',
      'rating', 'coverImage', 'publicationYear', 'totalPages', 'isbn',
    ];

    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        message: 'Invalid field name',
        allowedFields,
      });
    }

    const updateData = { [field]: value };
    const book = await BookService.updateBook(id, updateData);

    res.json({
      message: 'Book updated successfully',
      book,
      updatedField: field,
    });

  } catch (error) {
    console.error('Update book error:', error);
    const statusCode = error.message.includes('not found') ? 404 :
      error.message.includes('Invalid') || error.message.includes('Validation') ? 400 : 500;
    res.status(statusCode).json({
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

app.put('/api/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = [
      'title', 'author', 'genre', 'description', 'status',
      'rating', 'coverImage', 'publicationYear', 'totalPages', 'isbn',
    ];

    const invalidFields = Object.keys(updates).filter(field => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: 'Invalid field names provided',
        invalidFields,
        allowedFields,
      });
    }

    const book = await BookService.updateBook(id, updates);

    res.json({
      message: 'Book updated successfully',
      book,
      updatedFields: Object.keys(updates),
    });

  } catch (error) {
    console.error('Update book error:', error);
    const statusCode = error.message.includes('not found') ? 404 :
      error.message.includes('Invalid') || error.message.includes('Validation') ? 400 : 500;
    res.status(statusCode).json({
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

app.delete('/api/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await BookService.deleteBook(id);

    res.json({
      message: 'Book deleted successfully',
    });
  } catch (error) {
    console.error('Delete book error:', error);
    const statusCode = error.message.includes('not found') ? 404 :
      error.message.includes('Invalid') ? 400 : 500;
    res.status(statusCode).json({
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

app.get('/api/books/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = 'relevance',
      sortOrder = 'desc',
    } = req.query;

    const options = {
      page: Number(page),
      limit: Number(limit),
      search: query,
      sortBy,
      sortOrder,
    };

    const result = await BookService.searchBooks(query, options);

    res.json({
      message: 'Books search completed successfully',
      books: result.books,
      pagination: result.pagination,
      searchQuery: query,
    });
  } catch (error) {
    console.error('Search books error:', error);
    res.status(500).json({
      message: 'Failed to search books',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

app.post('/api/books/:id/checkout', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const book = await BookService.checkOutBook(id, userId);

    res.json({
      message: 'Book checked out successfully',
      book: book,
    });
  } catch (error) {
    console.error('Checkout book error:', error);
    const statusCode = error.message.includes('not found') ? 404 :
      error.message.includes('not available') || error.message.includes('already') ? 409 :
        error.message.includes('Invalid') ? 400 : 500;
    res.status(statusCode).json({
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

app.post('/api/books/:id/return', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const book = await BookService.returnBook(id, userId);

    res.json({
      message: 'Book returned successfully',
      book: book,
    });
  } catch (error) {
    console.error('Return book error:', error);
    const statusCode = error.message.includes('not found') ? 404 :
      error.message.includes('not checked out') ? 409 :
        error.message.includes('Invalid') ? 400 : 500;
    res.status(statusCode).json({
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

app.post('/api/books/:id/reviews', authenticateToken, [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const userId = req.user.userId;
    const { rating, comment } = req.body;

    const result = await BookService.addReview(id, userId, rating, comment);

    res.status(201).json({
      message: 'Review added successfully',
      book: result,
      review: result.reviews[result.reviews.length - 1],
    });
  } catch (error) {
    console.error('Add review error:', error);
    const statusCode = error.message.includes('not found') ? 404 :
      error.message.includes('already reviewed') ? 409 :
        error.message.includes('Invalid') || error.message.includes('Validation') ? 400 : 500;
    res.status(statusCode).json({
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userProfile = await UserService.getUserProfile(userId);

    res.json({
      message: 'Profile retrieved successfully',
      user: userProfile,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      message: error.message || 'Failed to retrieve profile',
    });
  }
});

app.put('/api/user/profile', [
  authenticateToken,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const userId = req.user.userId;
    const updateData = req.body;

    if (updateData.email) {
      const emailExists = await UserService.userExists(updateData.email);
      const currentUser = await UserService.findUserById(userId);

      if (emailExists && updateData.email !== currentUser.email) {
        return res.status(409).json({
          message: 'Email already exists',
        });
      }
    }

    const updatedUser = await UserService.updateUser(userId, updateData);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      message: error.message || 'Failed to update profile',
    });
  }
});

app.put('/api/user/change-password', [
  authenticateToken,
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    await UserService.changePassword(userId, currentPassword, newPassword);

    res.json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    const statusCode = error.message.includes('not found') ? 404 :
      error.message.includes('incorrect') ? 400 : 500;
    res.status(statusCode).json({
      message: error.message || 'Failed to change password',
    });
  }
});

app.delete('/api/user/account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const success = await UserService.deleteUser(userId);

    if (!success) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.json({
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      message: 'Failed to delete account',
    });
  }
});

app.get('/api/user/reading-list', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const books = await BookService.getUserCheckedOutBooks(userId);

    res.json({
      message: 'Reading list retrieved successfully',
      books: books,
      count: books.length,
    });
  } catch (error) {
    console.error('Get reading list error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      message: error.message || 'Failed to retrieve reading list',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Book Club API endpoints:');
});

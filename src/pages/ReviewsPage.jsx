import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import './ReviewsPage.css';

export const ReviewsPage = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBooksWithReviews();
  }, []);

  const fetchBooksWithReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/books', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }

      const data = await response.json();
      const booksWithReviews = data.books.filter(book => book.reviews && book.reviews.length > 0);
      setBooks(booksWithReviews);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredReviews = () => {
    let allReviews = [];

    books.forEach(book => {
      if (book.reviews && book.reviews.length > 0) {
        book.reviews.forEach(review => {
          allReviews.push({
            ...review,
            bookTitle: book.title,
            bookAuthor: book.author,
            bookId: book._id,
            bookCoverImage: book.coverImage,
            bookGenre: book.genre,
          });
        });
      }
    });

    if (filterBy === 'my-reviews' && user) {
      allReviews = allReviews.filter(review => review.user._id === user.id);
    } else if (filterBy === 'high-rated') {
      allReviews = allReviews.filter(review => review.rating >= 4);
    }

    if (searchTerm) {
      allReviews = allReviews.filter(review =>
        review.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.bookAuthor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (review.comment && review.comment.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

    allReviews.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.reviewDate) - new Date(a.reviewDate);
        case 'oldest':
          return new Date(a.reviewDate) - new Date(b.reviewDate);
        case 'rating-high':
          return b.rating - a.rating;
        case 'rating-low':
          return a.rating - b.rating;
        default:
          return new Date(b.reviewDate) - new Date(a.reviewDate);
      }
    });

    return allReviews;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        className={`star ${index < rating ? 'filled' : 'empty'}`}
      >
        ★
      </span>
    ));
  };

  const getReviewStats = () => {
    const allReviews = getFilteredReviews();
    const totalReviews = allReviews.length;
    const averageRating = totalReviews > 0
      ? (allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
      : 0;
    const uniqueBooks = new Set(allReviews.map(review => review.bookId)).size;
    const uniqueReviewers = new Set(allReviews.map(review => review.user._id)).size;

    return { totalReviews, averageRating, uniqueBooks, uniqueReviewers };
  };

  if (loading) {
    return (
      <div className="reviews-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reviews-page">
        <div className="error-container">
          <p className="error-message">Error: {error}</p>
          <button onClick={fetchBooksWithReviews} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredReviews = getFilteredReviews();
  const stats = getReviewStats();

  return (
    <div className="reviews-page">
      <div className="reviews-header">
        <h1>Book Reviews</h1>
        <p className="subtitle">See what our community thinks about the books</p>

        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-number">{stats.totalReviews}</span>
            <span className="stat-label">Total Reviews</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.averageRating}</span>
            <span className="stat-label">Average Rating</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.uniqueBooks}</span>
            <span className="stat-label">Books Reviewed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.uniqueReviewers}</span>
            <span className="stat-label">Active Reviewers</span>
          </div>
        </div>
      </div>

      <div className="reviews-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search reviews by book, author, reviewer, or comment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <label>Filter by:</label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Reviews</option>
              <option value="my-reviews">My Reviews</option>
              <option value="high-rated">High Rated (4+ stars)</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating-high">Highest Rating</option>
              <option value="rating-low">Lowest Rating</option>
            </select>
          </div>
        </div>
      </div>

      <div className="reviews-container">
        {filteredReviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews found matching your criteria.</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="clear-search-button"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="reviews-list">
            {filteredReviews.map((review, index) => (
              <div key={`${review.bookId}-${review.user._id}-${index}`} className="review-card">
                <div className="review-header">
                  <div className="book-info">
                    {review.bookCoverImage && (
                      <img
                        src={review.bookCoverImage}
                        alt={review.bookTitle}
                        className="book-cover-small"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="book-details">
                      <h3 className="book-title">{review.bookTitle}</h3>
                      <p className="book-author">by {review.bookAuthor}</p>
                      <span className="book-genre">{review.bookGenre}</span>
                    </div>
                  </div>
                  <div className="review-meta">
                    <div className="rating">
                      {renderStars(review.rating)}
                      <span className="rating-number">({review.rating}/5)</span>
                    </div>
                    <div className="reviewer-info">
                      <span className="reviewer-name">{review.user.name}</span>
                      <span className="review-date">{formatDate(review.reviewDate)}</span>
                    </div>
                  </div>
                </div>

                {review.comment && (
                  <div className="review-content">
                    <p className="review-comment">{review.comment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

const ReviewForm = ({ book, onReviewSubmitted, onClose }) => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    rating: '',
    comment: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [touched, setTouched] = useState({
    rating: false,
    comment: false,
  });

  const validateField = (name, value) => {
    switch (name) {
      case 'rating': {
        if (!value || value === '') {
          return 'Rating is required';
        }
        const ratingNum = parseInt(value);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
          return 'Rating must be between 1 and 5 stars';
        }
        return '';
      }

      case 'comment':
        if (value && value.length > 500) {
          return 'Comment cannot exceed 500 characters';
        }
        return '';

      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, formData[name]);
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleStarClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating: rating.toString(),
    }));

    setTouched(prev => ({
      ...prev,
      rating: true,
    }));

    const error = validateField('rating', rating.toString());
    setErrors(prev => ({
      ...prev,
      rating: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      rating: true,
      comment: true,
    });

    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).some(key => formErrors[key])) {
      return;
    }

    if (!isAuthenticated) {
      setErrors({ submit: 'Please log in to submit a review' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setErrors({ submit: 'Authentication token not found. Please log in again.' });
        return;
      }

      const response = await fetch(`http://localhost:3001/api/books/${book._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: parseInt(formData.rating),
          comment: formData.comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setErrors({ submit: 'Your session has expired. Please log in again.' });
        } else if (response.status === 409) {
          setErrors({ submit: 'You have already reviewed this book. Each user can only submit one review per book.' });
        } else if (data.errors && Array.isArray(data.errors)) {

          const serverErrors = {};
          data.errors.forEach(error => {
            if (error.path) {
              serverErrors[error.path] = error.msg;
            }
          });
          setErrors(serverErrors);
        } else {
          setErrors({ submit: data.message || 'Failed to submit review. Please try again.' });
        }
        return;
      }

      setSubmitSuccess(true);

      if (onReviewSubmitted) {
        onReviewSubmitted(data.book, data.review);
      }

      setFormData({ rating: '', comment: '' });
      setTouched({ rating: false, comment: false });

      setTimeout(() => {
        setSubmitSuccess(false);
        if (onClose) {
          onClose();
        }
      }, 2000);

    } catch (error) {
      console.error('Review submission error:', error);
      setErrors({ submit: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setFormData({ rating: '', comment: '' });
    setTouched({ rating: false, comment: false });
    setErrors({});
    setSubmitSuccess(false);
  }, [book._id]);

  const isFormValid = () => {
    const formErrors = validateForm();
    return Object.keys(formErrors).every(key => !formErrors[key]);
  };

  const renderStarRating = () => {
    const stars = [];
    const currentRating = parseInt(formData.rating) || 0;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => {
            setFormData(prev => ({ ...prev, rating: i.toString() }));
          }}
          className={`text-2xl sm:text-3xl transition-colors duration-200 hover:scale-110 transform ${
            i <= currentRating
              ? 'text-yellow-400 hover:text-yellow-500'
              : 'text-gray-300 hover:text-yellow-300'
          }`}
          aria-label={`Rate ${i} star${i !== 1 ? 's' : ''}`}
        >
          ★
        </button>,
      );
    }

    return (
      <div className="flex items-center space-x-1">
        {stars}
        {currentRating > 0 && (
          <span className="ml-2 text-sm text-gray-600">
            {currentRating} star{currentRating !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    );
  };

  if (!book) {
    return null;
  }

  if (submitSuccess) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Submitted!</h3>
          <p className="text-gray-600">Thank you for sharing your thoughts about "{book.title}".</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 max-w-lg mx-auto">
      <div className="mb-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Write a Review</h3>
        <div className="flex items-center space-x-3 mb-3">
          <img
            src={book.coverImage || '/api/placeholder/60/80'}
            alt={book.title}
            className="w-12 h-16 object-cover rounded"
            onError={(e) => {
              e.target.src = '/api/placeholder/60/80';
            }}
          />
          <div>
            <h4 className="font-medium text-gray-900 text-sm sm:text-base">{book.title}</h4>
            <p className="text-gray-600 text-xs sm:text-sm">by {book.author}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating <span className="text-red-500">*</span>
          </label>
          {renderStarRating()}
          {touched.rating && errors.rating && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.rating}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Comment (Optional)
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Share your thoughts about this book..."
            rows={4}
            maxLength={500}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm ${
              touched.comment && errors.comment
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300'
            }`}
          />
          <div className="mt-1 flex justify-between items-center">
            <div>
              {touched.comment && errors.comment && (
                <p className="text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.comment}
                </p>
              )}
            </div>
            <span className={`text-xs ${
              formData.comment.length > 450 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {formData.comment.length}/500
            </span>
          </div>
        </div>
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.submit}
            </p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !isAuthenticated || !isFormValid()}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${
              isSubmitting || !isAuthenticated || !isFormValid()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Review'
            )}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium text-sm transition-colors duration-200"
            >
              Cancel
            </button>
          )}
        </div>

        {!isAuthenticated && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              Please log in to submit a review.
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default ReviewForm;

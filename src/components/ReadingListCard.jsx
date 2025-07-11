import { useState } from 'react';

export const ReadingListCard = ({ book, onReturn, onAddReview }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userReview = book.reviews?.find(review =>
    review.user?._id === localStorage.getItem('userId'),
  );

  const handleReturn = async () => {
    const result = await onReturn(book);
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await onAddReview(book._id, rating, comment);
    if (result.success) {
      setShowReviewForm(false);
      setComment('');
      setRating(5);
      alert(result.message);
    } else {
      alert(result.message);
    }

    setIsSubmitting(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysCheckedOut = () => {
    if (!book.checkedOutDate) return 0;
    const checkoutDate = new Date(book.checkedOutDate);
    const today = new Date();
    const diffTime = Math.abs(today - checkoutDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">

        <div className="flex-shrink-0">
          {book.imageUrl ? (
            <img
              src={book.imageUrl}
              alt={`${book.title} cover`}
              className="w-24 h-32 object-cover rounded"
            />
          ) : (
            <div className="w-24 h-32 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-500 text-xs text-center">No Cover</span>
            </div>
          )}
        </div>

        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{book.title}</h3>
          <p className="text-gray-600 mb-2">by {book.author}</p>

          {book.genre && (
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
              {book.genre}
            </span>
          )}

          <div className="text-sm text-gray-500 space-y-1">
            <p>Checked out: {book.checkedOutDate ? formatDate(book.checkedOutDate) : 'Unknown'}</p>
            <p>Days read: {getDaysCheckedOut()}</p>
            {book.dueDate && (
              <p className={`${new Date(book.dueDate) < new Date() ? 'text-red-600' : 'text-gray-500'}`}>
                Due: {formatDate(book.dueDate)}
              </p>
            )}
          </div>

          {book.rating && (
            <div className="mt-2">
              <span className="text-yellow-500">
                {'★'.repeat(Math.floor(book.rating))}
                {'☆'.repeat(5 - Math.floor(book.rating))}
              </span>
              <span className="text-sm text-gray-600 ml-1">
                ({book.rating.toFixed(1)})
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={handleReturn}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Return Book
        </button>

        {!userReview && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            {showReviewForm ? 'Cancel Review' : 'Add Review'}
          </button>
        )}

        {userReview && (
          <div className="text-sm text-gray-600">
            You rated this book {userReview.rating}★
          </div>
        )}
      </div>

      {showReviewForm && (
        <form onSubmit={handleReviewSubmit} className="mt-4 p-4 bg-gray-50 rounded">
          <h4 className="font-semibold mb-3">Add Your Review</h4>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating:
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
              required
            >
              <option value={5}>5 Stars - Excellent</option>
              <option value={4}>4 Stars - Very Good</option>
              <option value={3}>3 Stars - Good</option>
              <option value={2}>2 Stars - Fair</option>
              <option value={1}>1 Star - Poor</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment (optional):
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this book..."
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows={3}
              maxLength={500}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ReadingListCard;

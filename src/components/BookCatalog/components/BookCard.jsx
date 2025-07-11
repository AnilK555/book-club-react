import React from 'react';

const BookCard = ({
  book,
  isAuthenticated,
  onBorrowBook,
  onReturnBook,
  onReviewBook,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={book.coverImage || '/api/placeholder/300/400'}
          alt={book.title}
          className="w-full h-48 sm:h-64 object-cover"
          onError={(e) => {
            e.target.src = '/api/placeholder/300/400';
          }}
        />
        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
          book.status === 'available' ? 'bg-green-100 text-green-800' :
            book.status === 'checked_out' ? 'bg-red-100 text-red-800' :
              book.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
        }`}>
          {book.status?.replace('_', ' ').toUpperCase()}
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="font-bold text-base sm:text-lg mb-1 truncate" title={book.title}>
          {book.title}
        </h3>
        <p className="text-gray-600 mb-1 truncate text-sm sm:text-base" title={book.author}>
          by {book.author}
        </p>
        <p className="text-xs sm:text-sm text-gray-500 mb-2">
          {book.genre} • {book.publicationYear}
        </p>

        {book.rating && (
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400 text-sm">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.floor(book.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              ))}
            </div>
            <span className="ml-1 text-xs sm:text-sm text-gray-600">
              {book.rating.toFixed(1)}
            </span>
          </div>
        )}

        <p className="text-xs sm:text-sm text-gray-700 line-clamp-2 sm:line-clamp-3 mb-3">
          {book.description}
        </p>

        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-gray-500">
            {book.totalPages} pages
          </span>
        </div>

        {isAuthenticated && (
          <div className="flex gap-2 mt-3">
            {book.status === 'available' && (
              <button
                onClick={() => onBorrowBook(book)}
                className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium bg-blue-500 text-white hover:bg-blue-600"
              >
                Borrow
              </button>
            )}
            {book.status === 'checked_out' && (
              <button
                onClick={() => onReturnBook(book)}
                className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium bg-orange-500 text-white hover:bg-orange-600"
              >
                Return
              </button>
            )}
            {book.status !== 'available' && book.status !== 'checked_out' && (
              <button
                className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
                disabled
              >
                Unavailable
              </button>
            )}
            <button
              onClick={() => onReviewBook(book)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-500"
            >
              Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCard;

import React from 'react';
import BookCard from './BookCard';

const BookGrid = ({
  books,
  isAuthenticated,
  onBorrowBook,
  onReturnBook,
  onReviewBook,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {books.map(book => (
        <BookCard
          key={book._id}
          book={book}
          isAuthenticated={isAuthenticated}
          onBorrowBook={onBorrowBook}
          onReturnBook={onReturnBook}
          onReviewBook={onReviewBook}
        />
      ))}
    </div>
  );
};

export default BookGrid;

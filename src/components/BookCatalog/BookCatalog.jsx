import React, { useState } from 'react';
import { useAuth } from '../AuthProvider';
import ReviewForm from '../ReviewForm';
import SearchFilters from './components/SearchFilters';
import BookGrid from './components/BookGrid';
import Pagination from './components/Pagination';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import EmptyState from './components/EmptyState';
import ResultsInfo from './components/ResultsInfo';
import useBookCatalog from './hooks/useBookCatalog';

const BookCatalog = () => {
  const { isAuthenticated } = useAuth();

  const {
    books,
    loading,
    error,
    currentPage,
    totalPages,
    totalBooks,
    hasNext,
    hasPrev,
    searchTerm,
    selectedGenre,
    selectedAuthor,
    selectedStatus,
    minRating,
    maxRating,
    sortBy,
    sortOrder,
    limit,
    genres,
    authors,
    statusOptions,
    sortOptions,
    setSearchTerm,
    setSelectedGenre,
    setSelectedAuthor,
    setSelectedStatus,
    setMinRating,
    setMaxRating,
    setSortBy,
    setSortOrder,
    setLimit,
    fetchBooks,
    clearFilters,
    goToPage,
    handleBorrowBook,
    handleReturnBook,
    updateBookAfterReview,
  } = useBookCatalog();

  const [selectedBookForReview, setSelectedBookForReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  const handleReviewBook = (book) => {
    setSelectedBookForReview(book);
    setShowReviewForm(true);
  };
  const handleBorrowBookWithFeedback = async (book) => {
    if (!isAuthenticated) {
      alert('Please log in to borrow books');
      return;
    }

    if (book.status !== 'available') {
      alert('This book is not available for borrowing');
      return;
    }

    const result = await handleBorrowBook(book);
    alert(result.message);
  };

  const handleReturnBookWithFeedback = async (book) => {
    if (!isAuthenticated) {
      alert('Please log in to return books');
      return;
    }

    const result = await handleReturnBook(book);
    alert(result.message);
  };

  const handleReviewSubmitted = (updatedBook, review) => {
    console.log('Review submitted for book:', updatedBook);
    console.log('Review data:', review);

    updateBookAfterReview(updatedBook);

    setShowReviewForm(false);
    setSelectedBookForReview(null);
  };

  const handleCloseReviewForm = () => {
    setShowReviewForm(false);
    setSelectedBookForReview(null);
  };

  if (error) {
    return <ErrorMessage error={error} onRetry={fetchBooks} />;
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">

      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Book Catalog</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Discover your next great read from our collection of {totalBooks} books
        </p>
      </div>

      <SearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
        selectedAuthor={selectedAuthor}
        setSelectedAuthor={setSelectedAuthor}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        minRating={minRating}
        setMinRating={setMinRating}
        maxRating={maxRating}
        setMaxRating={setMaxRating}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        limit={limit}
        setLimit={setLimit}
        genres={genres}
        authors={authors}
        statusOptions={statusOptions}
        sortOptions={sortOptions}
        onSearch={handleSearch}
        onClearFilters={clearFilters}
      />

      <ResultsInfo
        totalBooks={totalBooks}
        booksCount={books.length}
        currentPage={currentPage}
        totalPages={totalPages}
      />

      {loading && <LoadingSpinner />}

      {!loading && books.length > 0 && (
        <BookGrid
          books={books}
          isAuthenticated={isAuthenticated}
          onBorrowBook={handleBorrowBookWithFeedback}
          onReturnBook={handleReturnBookWithFeedback}
          onReviewBook={handleReviewBook}
        />
      )}

      {!loading && books.length === 0 && (
        <EmptyState onClearFilters={clearFilters} />
      )}
      {!loading && books.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          hasNext={hasNext}
          hasPrev={hasPrev}
          onGoToPage={goToPage}
        />
      )}

      {showReviewForm && selectedBookForReview && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-30 bg-amber-700 p-4">
          <div className="relative max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <ReviewForm
              book={selectedBookForReview}
              onReviewSubmitted={handleReviewSubmitted}
              onClose={handleCloseReviewForm}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookCatalog;

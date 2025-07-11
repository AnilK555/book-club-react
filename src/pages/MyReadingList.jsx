
import React from 'react';
import { useReadingList } from '../hooks/useReadingList';
import { ReadingListCard } from '../components/ReadingListCard';

export const MyReadingList = () => {
  const { books, loading, error, handleReturnBook, handleAddReview } = useReadingList();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">My Reading List</h1>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading your reading list...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">My Reading List</h1>
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">My Reading List</h1>

      {books.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No books in your reading list</h3>
          <p className="text-gray-600 mb-6">
            You haven't checked out any books yet. Browse our catalog to find something interesting!
          </p>
          <a
            href="/home"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Browse Books
          </a>
        </div>
      ) : (
        <div>
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              You have <span className="font-semibold text-blue-600">{books.length}</span>
              {books.length === 1 ? ' book' : ' books'} checked out
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 max-w-4xl mx-auto">
            {books.map((book) => (
              <ReadingListCard
                key={book._id}
                book={book}
                onReturn={handleReturnBook}
                onAddReview={handleAddReview}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

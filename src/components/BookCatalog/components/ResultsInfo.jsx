import React from 'react';

const ResultsInfo = ({ totalBooks, booksCount, currentPage, totalPages }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
      <p className="text-sm sm:text-base text-gray-600">
        Showing {booksCount} of {totalBooks} books
      </p>
      <p className="text-sm text-gray-500">
        Page {currentPage} of {totalPages}
      </p>
    </div>
  );
};

export default ResultsInfo;

import React from 'react';

const Pagination = ({
  currentPage,
  totalPages,
  hasNext,
  hasPrev,
  onGoToPage,
}) => {
  const pages = [];
  const maxVisiblePages = window.innerWidth < 640 ? 3 : 5; // Show fewer pages on mobile
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => onGoToPage(i)}
        className={`px-2 sm:px-3 py-2 mx-0.5 sm:mx-1 rounded text-sm ${
          currentPage === i
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {i}
      </button>,
    );
  }

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center mt-6 sm:mt-8 space-y-3 sm:space-y-0">
      {/* Mobile: Simple prev/next with page info */}
      <div className="flex sm:hidden items-center space-x-4">
        <button
          onClick={() => onGoToPage(currentPage - 1)}
          disabled={!hasPrev}
          className="px-3 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 text-sm"
        >
          ← Prev
        </button>

        <span className="text-sm text-gray-600">
          {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onGoToPage(currentPage + 1)}
          disabled={!hasNext}
          className="px-3 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 text-sm"
        >
          Next →
        </button>
      </div>

      {/* Desktop: Full pagination */}
      <div className="hidden sm:flex items-center space-x-2">
        <button
          onClick={() => onGoToPage(currentPage - 1)}
          disabled={!hasPrev}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
        >
          Previous
        </button>

        {startPage > 1 && (
          <>
            <button onClick={() => onGoToPage(1)} className="px-3 py-2 mx-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
              1
            </button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}

        {pages}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <button onClick={() => onGoToPage(totalPages)} className="px-3 py-2 mx-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onGoToPage(currentPage + 1)}
          disabled={!hasNext}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;

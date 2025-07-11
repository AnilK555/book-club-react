import React from 'react';

const EmptyState = ({ onClearFilters }) => {
  return (
    <div className="text-center py-8 sm:py-12">
      <p className="text-gray-600 mb-4 text-sm sm:text-base">No books found matching your criteria.</p>
      <button
        onClick={onClearFilters}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default EmptyState;

import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="text-center py-8 sm:py-12">
      <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
      <p className="mt-2 text-gray-600 text-sm sm:text-base">Loading books...</p>
    </div>
  );
};

export default LoadingSpinner;

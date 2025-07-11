import React from 'react';

const ErrorMessage = ({ error, onRetry }) => {
  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded">
        <p className="text-sm sm:text-base mb-2 sm:mb-0 sm:inline">{error}</p>
        <button
          onClick={onRetry}
          className="w-full sm:w-auto sm:ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default ErrorMessage;

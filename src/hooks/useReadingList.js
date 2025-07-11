import { useState, useEffect, useCallback } from 'react';

export const useReadingList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReadingList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch('http://localhost:3001/api/user/reading-list', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setBooks(data.books || []);

    } catch (err) {
      console.error('Error fetching reading list:', err);
      setError('Failed to load reading list. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReturnBook = async (book) => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`http://localhost:3001/api/books/${book._id}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to return book');
      }

      await response.json();

      setBooks(prev => prev.filter(b => b._id !== book._id));

      return { success: true, message: `Successfully returned "${book.title}"` };
    } catch (error) {
      console.error('Error returning book:', error);
      return { success: false, message: `Failed to return book: ${error.message}` };
    }
  };

  const handleAddReview = async (bookId, rating, comment) => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`http://localhost:3001/api/books/${bookId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add review');
      }

      const data = await response.json();

      setBooks(prev => prev.map(book =>
        book._id === bookId ? data.book : book,
      ));

      return { success: true, message: 'Review added successfully' };
    } catch (error) {
      console.error('Error adding review:', error);
      return { success: false, message: `Failed to add review: ${error.message}` };
    }
  };

  useEffect(() => {
    fetchReadingList();
  }, [fetchReadingList]);

  return {
    books,
    loading,
    error,
    fetchReadingList,
    handleReturnBook,
    handleAddReview,
  };
};

export default useReadingList;

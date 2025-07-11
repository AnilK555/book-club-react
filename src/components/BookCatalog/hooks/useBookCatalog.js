import { useState, useEffect, useCallback } from 'react';

export const useBookCatalog = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxRating, setMaxRating] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [limit, setLimit] = useState(12);
  const [genres, setGenres] = useState([]);
  const [authors, setAuthors] = useState([]);

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'available', label: 'Available' },
    { value: 'checked_out', label: 'Checked Out' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'maintenance', label: 'Maintenance' },
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Added' },
    { value: 'title', label: 'Title' },
    { value: 'author', label: 'Author' },
    { value: 'rating', label: 'Rating' },
    { value: 'publicationYear', label: 'Publication Year' },
  ];

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedGenre) params.append('genre', selectedGenre);
      if (selectedAuthor) params.append('author', selectedAuthor);
      if (selectedStatus) params.append('status', selectedStatus);
      if (minRating) params.append('minRating', minRating);
      if (maxRating) params.append('maxRating', maxRating);

      const response = await fetch(`http://localhost:3001/api/books?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setBooks(data.books || []);
      if (data.pagination) {
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
        setTotalBooks(data.pagination.totalBooks);
        setHasNext(data.pagination.hasNext);
        setHasPrev(data.pagination.hasPrev);
      }

      const uniqueGenres = [...new Set(data.books?.map(book => book.genre).filter(Boolean))];
      const uniqueAuthors = [...new Set(data.books?.map(book => book.author).filter(Boolean))];

      setGenres(prev => {
        const combined = [...new Set([...prev, ...uniqueGenres])];
        return combined;
      });

      setAuthors(prev => {
        const combined = [...new Set([...prev, ...uniqueAuthors])];
        return combined;
      });

    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm, selectedGenre, selectedAuthor, selectedStatus, minRating, maxRating, sortBy, sortOrder]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, selectedGenre, selectedAuthor, selectedStatus, minRating, maxRating, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGenre('');
    setSelectedAuthor('');
    setSelectedStatus('');
    setMinRating('');
    setMaxRating('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleBorrowBook = async (book) => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`http://localhost:3001/api/books/${book._id}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to borrow book');
      }

      await response.json();

      setBooks(prev => prev.map(b =>
        b._id === book._id ? { ...b, status: 'checked_out' } : b,
      ));

      return { success: true, message: `Successfully borrowed "${book.title}"` };
    } catch (error) {
      console.error('Error borrowing book:', error);
      return { success: false, message: `Failed to borrow book: ${error.message}` };
    }
  };

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

      setBooks(prev => prev.map(b =>
        b._id === book._id ? { ...b, status: 'available' } : b,
      ));

      return { success: true, message: `Successfully returned "${book.title}"` };
    } catch (error) {
      console.error('Error returning book:', error);
      return { success: false, message: `Failed to return book: ${error.message}` };
    }
  };

  const updateBookAfterReview = (updatedBook) => {
    setBooks(prev => prev.map(book =>
      book._id === updatedBook._id ? updatedBook : book,
    ));
    fetchBooks();
  };

  return {
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
    setCurrentPage,
    fetchBooks,
    clearFilters,
    goToPage,
    handleBorrowBook,
    handleReturnBook,
    updateBookAfterReview,
  };
};

export default useBookCatalog;

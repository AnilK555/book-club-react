import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchFilters from './SearchFilters';

describe('SearchFilters', () => {
  const mockSetSearchTerm = vi.fn();
  const mockSetSelectedGenre = vi.fn();
  const mockSetSelectedAuthor = vi.fn();
  const mockSetSelectedStatus = vi.fn();
  const mockSetMinRating = vi.fn();
  const mockSetMaxRating = vi.fn();
  const mockSetSortBy = vi.fn();
  const mockSetSortOrder = vi.fn();
  const mockSetLimit = vi.fn();
  const mockOnSearch = vi.fn();
  const mockOnClearFilters = vi.fn();

  const defaultProps = {
    searchTerm: '',
    setSearchTerm: mockSetSearchTerm,
    selectedGenre: '',
    setSelectedGenre: mockSetSelectedGenre,
    selectedAuthor: '',
    setSelectedAuthor: mockSetSelectedAuthor,
    selectedStatus: '',
    setSelectedStatus: mockSetSelectedStatus,
    minRating: '',
    setMinRating: mockSetMinRating,
    maxRating: '',
    setMaxRating: mockSetMaxRating,
    sortBy: 'title',
    setSortBy: mockSetSortBy,
    sortOrder: 'desc',
    setSortOrder: mockSetSortOrder,
    limit: 12,
    setLimit: mockSetLimit,
    genres: ['Fiction', 'Non-fiction', 'Mystery', 'Romance'],
    authors: ['J.K. Rowling', 'Stephen King', 'Agatha Christie'],
    statusOptions: [
      { value: '', label: 'All Status' },
      { value: 'available', label: 'Available' },
      { value: 'checked-out', label: 'Checked Out' },
    ],
    sortOptions: [
      { value: 'title', label: 'Title' },
      { value: 'author', label: 'Author' },
      { value: 'year', label: 'Year' },
      { value: 'rating', label: 'Rating' },
    ],
    onSearch: mockOnSearch,
    onClearFilters: mockOnClearFilters,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all filter components', () => {
    render(<SearchFilters {...defaultProps} />);
    expect(screen.getByPlaceholderText('Search books by title, author, or description...')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Genres')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Authors')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Min Rating')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Max Rating')).toBeInTheDocument();

    expect(screen.getByText('Clear All Filters')).toBeInTheDocument();

    expect(screen.getByText('Show:')).toBeInTheDocument();
    expect(screen.getByText('per page')).toBeInTheDocument();
  });

  it('calls setSearchTerm when search input changes', () => {
    render(<SearchFilters {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search books by title, author, or description...');
    fireEvent.change(searchInput, { target: { value: 'Harry Potter' } });

    expect(mockSetSearchTerm).toHaveBeenCalledWith('Harry Potter');
  });

  it('calls onSearch when search form is submitted', () => {
    render(<SearchFilters {...defaultProps} />);

    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    expect(mockOnSearch).toHaveBeenCalled();
  });

  it('calls onSearch when Enter is pressed in search input', () => {
    render(<SearchFilters {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search books by title, author, or description...');
    fireEvent.submit(searchInput.closest('form'));

    expect(mockOnSearch).toHaveBeenCalled();
  });

  it('renders genre options correctly', () => {
    render(<SearchFilters {...defaultProps} />);

    const genreSelect = screen.getByDisplayValue('All Genres');

    expect(genreSelect.children).toHaveLength(5);
    expect(screen.getByRole('option', { name: 'Fiction' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Mystery' })).toBeInTheDocument();
  });

  it('calls setSelectedGenre when genre is changed', () => {
    render(<SearchFilters {...defaultProps} />);

    const genreSelect = screen.getByDisplayValue('All Genres');
    fireEvent.change(genreSelect, { target: { value: 'Fiction' } });

    expect(mockSetSelectedGenre).toHaveBeenCalledWith('Fiction');
  });

  it('renders author options correctly', () => {
    render(<SearchFilters {...defaultProps} />);

    const authorSelect = screen.getByDisplayValue('All Authors');

    expect(authorSelect.children).toHaveLength(4);
    expect(screen.getByRole('option', { name: 'J.K. Rowling' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Stephen King' })).toBeInTheDocument();
  });

  it('calls setSelectedAuthor when author is changed', () => {
    render(<SearchFilters {...defaultProps} />);

    const authorSelect = screen.getByDisplayValue('All Authors');
    fireEvent.change(authorSelect, { target: { value: 'J.K. Rowling' } });

    expect(mockSetSelectedAuthor).toHaveBeenCalledWith('J.K. Rowling');
  });

  it('renders status options correctly', () => {
    render(<SearchFilters {...defaultProps} />);

    expect(screen.getByRole('option', { name: 'All Status' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Available' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Checked Out' })).toBeInTheDocument();
  });

  it('handles rating input changes', () => {
    render(<SearchFilters {...defaultProps} />);

    const minRatingInput = screen.getByPlaceholderText('Min Rating');
    const maxRatingInput = screen.getByPlaceholderText('Max Rating');

    fireEvent.change(minRatingInput, { target: { value: '3.5' } });
    fireEvent.change(maxRatingInput, { target: { value: '4.8' } });

    expect(mockSetMinRating).toHaveBeenCalledWith('3.5');
    expect(mockSetMaxRating).toHaveBeenCalledWith('4.8');
  });

  it('validates rating input constraints', () => {
    render(<SearchFilters {...defaultProps} />);

    const minRatingInput = screen.getByPlaceholderText('Min Rating');
    const maxRatingInput = screen.getByPlaceholderText('Max Rating');

    expect(minRatingInput).toHaveAttribute('min', '0');
    expect(minRatingInput).toHaveAttribute('max', '5');
    expect(minRatingInput).toHaveAttribute('step', '0.1');
    expect(maxRatingInput).toHaveAttribute('min', '0');
    expect(maxRatingInput).toHaveAttribute('max', '5');
    expect(maxRatingInput).toHaveAttribute('step', '0.1');
  });

  it('renders sort options correctly', () => {
    render(<SearchFilters {...defaultProps} />);

    expect(screen.getByRole('option', { name: 'Sort by Title' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Sort by Author' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Sort by Year' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Sort by Rating' })).toBeInTheDocument();
  });

  it('handles sort changes correctly', () => {
    render(<SearchFilters {...defaultProps} />);

    const sortSelects = screen.getAllByRole('combobox');
    const sortBySelect = sortSelects.find(select =>
      select.querySelector('option[value="title"]'),
    );
    const sortOrderSelect = sortSelects.find(select =>
      select.querySelector('option[value="desc"]'),
    );

    if (sortBySelect) {
      fireEvent.change(sortBySelect, { target: { value: 'author' } });
      expect(mockSetSortBy).toHaveBeenCalledWith('author');
    }

    if (sortOrderSelect) {
      fireEvent.change(sortOrderSelect, { target: { value: 'asc' } });
      expect(mockSetSortOrder).toHaveBeenCalledWith('asc');
    }
  });

  it('renders limit options correctly', () => {
    render(<SearchFilters {...defaultProps} />);

    const limitSelect = screen.getByLabelText('Show:');
    expect(limitSelect).toBeInTheDocument();
    expect(limitSelect).toHaveValue('12');

    expect(screen.getByRole('option', { name: '6' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '12' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '24' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '48' })).toBeInTheDocument();
  });

  it('calls setLimit when limit is changed', () => {
    render(<SearchFilters {...defaultProps} />);

    const limitSelect = screen.getByLabelText('Show:');
    fireEvent.change(limitSelect, { target: { value: '24' } });

    expect(mockSetLimit).toHaveBeenCalledWith(24);
  });

  it('calls onClearFilters when clear button is clicked', () => {
    render(<SearchFilters {...defaultProps} />);

    const clearButton = screen.getByText('Clear All Filters');
    fireEvent.click(clearButton);

    expect(mockOnClearFilters).toHaveBeenCalled();
  });

  it('displays current values in form fields', () => {
    const propsWithValues = {
      ...defaultProps,
      searchTerm: 'Harry Potter',
      selectedGenre: 'Fiction',
      selectedAuthor: 'J.K. Rowling',
      minRating: '4.0',
      maxRating: '5.0',
      sortBy: 'rating',
      sortOrder: 'asc',
      limit: 24,
    };

    render(<SearchFilters {...propsWithValues} />);

    expect(screen.getByDisplayValue('Harry Potter')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Fiction')).toBeInTheDocument();
    expect(screen.getByDisplayValue('J.K. Rowling')).toBeInTheDocument();
    expect(screen.getByDisplayValue('4.0')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5.0')).toBeInTheDocument();
    expect(screen.getByDisplayValue('24')).toBeInTheDocument();
  });

  it('has proper form structure and accessibility', () => {
    render(<SearchFilters {...defaultProps} />);

    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();

    const limitLabel = screen.getByText('Show:');
    expect(limitLabel).toHaveAttribute('for', 'limit');

    const limitSelect = screen.getByLabelText('Show:');
    expect(limitSelect).toHaveAttribute('id', 'limit');
  });

  it('handles empty arrays for options gracefully', () => {
    const propsWithEmptyArrays = {
      ...defaultProps,
      genres: [],
      authors: [],
      statusOptions: [],
      sortOptions: [],
    };
    expect(() => render(<SearchFilters {...propsWithEmptyArrays} />)).not.toThrow();
  });
});

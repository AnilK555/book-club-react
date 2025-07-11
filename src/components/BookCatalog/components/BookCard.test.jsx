import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BookCard from './BookCard';

describe('BookCard', () => {
  const mockBook = {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Fiction',
    publicationYear: 1925,
    description: 'A classic American novel about the Jazz Age.',
    rating: 4.5,
    status: 'available',
    coverImage: 'https://example.com/cover.jpg',
    totalPages: 180,
  };

  it('renders book information correctly', () => {
    render(<BookCard book={mockBook} />);

    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('by F. Scott Fitzgerald')).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Fiction • 1925';
    })).toBeInTheDocument();
    expect(screen.getByText('A classic American novel about the Jazz Age.')).toBeInTheDocument();
  });

  it('renders rating when provided', () => {
    render(<BookCard book={mockBook} />);

    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getAllByText('★')).toHaveLength(5);
  });

  it('renders without rating when not provided', () => {
    const bookWithoutRating = { ...mockBook, rating: undefined };
    render(<BookCard book={bookWithoutRating} />);

    expect(screen.queryByText('★')).not.toBeInTheDocument();
    expect(screen.queryByText('4.5')).not.toBeInTheDocument();
  });

  it('renders book cover when provided', () => {
    render(<BookCard book={mockBook} />);

    const coverImage = screen.getByAltText('The Great Gatsby');
    expect(coverImage).toBeInTheDocument();
    expect(coverImage).toHaveAttribute('src', 'https://example.com/cover.jpg');
  });

  it('renders placeholder when cover is not provided', () => {
    const bookWithoutCover = { ...mockBook, coverImage: undefined };
    render(<BookCard book={bookWithoutCover} />);

    const image = screen.getByAltText('The Great Gatsby');
    expect(image).toHaveAttribute('src', '/api/placeholder/300/400');
    expect(screen.queryByAltText('The Great Gatsby cover')).not.toBeInTheDocument();
  });

  it('handles missing book properties gracefully', () => {
    const incompleteBook = {
      id: '2',
      title: 'Incomplete Book',
    };

    render(<BookCard book={incompleteBook} />);

    expect(screen.getByText('Incomplete Book')).toBeInTheDocument();
    expect(screen.getByText(/by\s*$/)).toBeInTheDocument();
    expect(screen.getByText(/^\s*•\s*$/)).toBeInTheDocument();
  });

  it('has correct card styling classes', () => {
    render(<BookCard book={mockBook} />);

    const card = screen.getByText('The Great Gatsby').closest('.bg-white');
    expect(card).toHaveClass(
      'bg-white',
      'rounded-lg',
      'shadow-md',
      'overflow-hidden',
      'hover:shadow-lg',
      'transition-shadow',
      'duration-300',
    );
  });

  it('displays status badge correctly', () => {
    render(<BookCard book={mockBook} />);

    expect(screen.getByText('AVAILABLE')).toBeInTheDocument();
  });

  it('handles different status values', () => {
    const unavailableBook = { ...mockBook, status: 'checked-out' };
    render(<BookCard book={unavailableBook} />);

    expect(screen.getByText('CHECKED-OUT')).toBeInTheDocument();
  });

  it('displays book year correctly', () => {
    render(<BookCard book={mockBook} />);

    expect(screen.getByText(/Fiction\s*•\s*1925/)).toBeInTheDocument();
  });

  it('handles missing year gracefully', () => {
    const bookWithoutYear = { ...mockBook, publicationYear: undefined };
    render(<BookCard book={bookWithoutYear} />);

    expect(screen.getByText(/Fiction\s*•\s*$/)).toBeInTheDocument();
  });

  it('truncates long descriptions appropriately', () => {
    const longDescription = 'This is a very long description that should be truncated '.repeat(10);
    const bookWithLongDesc = { ...mockBook, description: longDescription };

    render(<BookCard book={bookWithLongDesc} />);

    const description = screen.getByText(longDescription.trim());
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('line-clamp-2', 'sm:line-clamp-3');
  });

  it('handles zero rating correctly', () => {
    const bookWithZeroRating = { ...mockBook, rating: 0 };
    render(<BookCard book={bookWithZeroRating} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.queryByText('★')).not.toBeInTheDocument();
  });

  it('handles null/undefined values in all fields', () => {
    const nullBook = {
      id: '3',
      title: null,
      author: null,
      genre: null,
      year: null,
      description: null,
      rating: null,
      status: null,
      cover: null,
    };

    expect(() => render(<BookCard book={nullBook} />)).not.toThrow();
  });

  it('displays genre and year information correctly', () => {
    render(<BookCard book={mockBook} />);

    const genreYearText = screen.getByText(/Fiction\s*•\s*1925/);
    expect(genreYearText).toBeInTheDocument();
    expect(genreYearText).toHaveClass('text-xs', 'sm:text-sm', 'text-gray-500', 'mb-2');
  });

  it('has accessible image alt text', () => {
    render(<BookCard book={mockBook} />);

    const image = screen.getByAltText('The Great Gatsby');
    expect(image).toBeInTheDocument();
  });
});

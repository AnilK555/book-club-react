import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ResultsInfo from './ResultsInfo';

describe('ResultsInfo', () => {
  const defaultProps = {
    totalBooks: 150,
    booksCount: 12,
    currentPage: 1,
    totalPages: 13,
  };

  it('renders with correct book count information', () => {
    render(<ResultsInfo {...defaultProps} />);

    expect(screen.getByText('Showing 12 of 150 books')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 13')).toBeInTheDocument();
  });

  it('renders with different values', () => {
    const props = {
      totalBooks: 50,
      booksCount: 6,
      currentPage: 5,
      totalPages: 9,
    };

    render(<ResultsInfo {...props} />);

    expect(screen.getByText('Showing 6 of 50 books')).toBeInTheDocument();
    expect(screen.getByText('Page 5 of 9')).toBeInTheDocument();
  });

  it('handles zero books correctly', () => {
    const props = {
      totalBooks: 0,
      booksCount: 0,
      currentPage: 1,
      totalPages: 1,
    };

    render(<ResultsInfo {...props} />);

    expect(screen.getByText('Showing 0 of 0 books')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
  });

  it('handles single book correctly', () => {
    const props = {
      totalBooks: 1,
      booksCount: 1,
      currentPage: 1,
      totalPages: 1,
    };

    render(<ResultsInfo {...props} />);

    expect(screen.getByText('Showing 1 of 1 books')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
  });

  it('has correct container styling classes', () => {
    render(<ResultsInfo {...defaultProps} />);

    const container = screen.getByText('Showing 12 of 150 books').parentElement;
    expect(container).toHaveClass(
      'flex',
      'flex-col',
      'sm:flex-row',
      'justify-between',
      'items-start',
      'sm:items-center',
      'mb-4',
      'sm:mb-6',
      'space-y-2',
      'sm:space-y-0',
    );
  });

  it('has correct text styling for book count', () => {
    render(<ResultsInfo {...defaultProps} />);

    const bookCountText = screen.getByText('Showing 12 of 150 books');
    expect(bookCountText).toHaveClass('text-sm', 'sm:text-base', 'text-gray-600');
  });

  it('has correct text styling for page info', () => {
    render(<ResultsInfo {...defaultProps} />);

    const pageInfoText = screen.getByText('Page 1 of 13');
    expect(pageInfoText).toHaveClass('text-sm', 'text-gray-500');
  });

  it('handles large numbers correctly', () => {
    const props = {
      totalBooks: 9999,
      booksCount: 100,
      currentPage: 99,
      totalPages: 100,
    };

    render(<ResultsInfo {...props} />);

    expect(screen.getByText('Showing 100 of 9999 books')).toBeInTheDocument();
    expect(screen.getByText('Page 99 of 100')).toBeInTheDocument();
  });
});

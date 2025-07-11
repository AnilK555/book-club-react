import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('renders with default message', () => {
    render(<EmptyState />);

    expect(screen.getByText('No books found matching your criteria.')).toBeInTheDocument();
    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });

  it('renders message and button correctly', () => {
    const mockClearFilters = vi.fn();
    render(<EmptyState onClearFilters={mockClearFilters} />);

    expect(screen.getByText('No books found matching your criteria.')).toBeInTheDocument();
    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    render(<EmptyState />);

    const container = screen.getByText('No books found matching your criteria.').parentElement;
    expect(container).toHaveClass('text-center', 'py-8', 'sm:py-12');
  });

  it('button has correct styling', () => {
    render(<EmptyState />);

    const button = screen.getByText('Clear Filters');
    expect(button).toHaveClass(
      'px-4',
      'py-2',
      'bg-blue-500',
      'text-white',
      'rounded-lg',
      'hover:bg-blue-600',
      'text-sm',
      'sm:text-base',
    );
  });

  it('calls onClearFilters when button is clicked', () => {
    const mockClearFilters = vi.fn();
    render(<EmptyState onClearFilters={mockClearFilters} />);

    const button = screen.getByText('Clear Filters');
    fireEvent.click(button);

    expect(mockClearFilters).toHaveBeenCalledTimes(1);
  });
});

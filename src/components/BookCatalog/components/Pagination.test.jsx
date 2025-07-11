import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Pagination from './Pagination';

// Mock window.innerWidth for responsive behavior
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

describe('Pagination', () => {
  const mockOnGoToPage = vi.fn();

  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    hasNext: true,
    hasPrev: false,
    onGoToPage: mockOnGoToPage,
  };

  beforeEach(() => {
    mockOnGoToPage.mockClear();
    window.innerWidth = 1024; // Reset to desktop width
  });

  it('renders pagination controls', () => {
    render(<Pagination {...defaultProps} />);

    // Should have Previous and Next buttons
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('calls onGoToPage when page number is clicked', () => {
    render(<Pagination {...defaultProps} />);

    const pageButton = screen.getByText('2');
    fireEvent.click(pageButton);

    expect(mockOnGoToPage).toHaveBeenCalledWith(2);
  });

  it('calls onGoToPage when Previous button is clicked', () => {
    const props = { ...defaultProps, currentPage: 5, hasPrev: true };
    render(<Pagination {...props} />);

    const prevButton = screen.getByText('Previous');
    fireEvent.click(prevButton);

    expect(mockOnGoToPage).toHaveBeenCalledWith(4);
  });

  it('calls onGoToPage when Next button is clicked', () => {
    render(<Pagination {...defaultProps} />);

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(mockOnGoToPage).toHaveBeenCalledWith(2);
  });

  it('disables Previous button when hasPrev is false', () => {
    render(<Pagination {...defaultProps} />);

    const prevButton = screen.getByText('Previous');
    expect(prevButton).toBeDisabled();
    expect(prevButton).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
  });

  it('disables Next button when hasNext is false', () => {
    const props = { ...defaultProps, hasNext: false };
    render(<Pagination {...props} />);

    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
    expect(nextButton).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
  });

  it('highlights current page', () => {
    const props = { ...defaultProps, currentPage: 3 };
    render(<Pagination {...props} />);

    const currentPageButton = screen.getByText('3');
    expect(currentPageButton).toHaveClass('bg-blue-500', 'text-white');
  });

  it('shows ellipsis when there are many pages', () => {
    const props = { ...defaultProps, currentPage: 10, totalPages: 20 };
    render(<Pagination {...props} />);

    // Should show ellipsis - there can be multiple
    const ellipsis = screen.getAllByText('...');
    expect(ellipsis.length).toBeGreaterThan(0);
  });

  it('shows first page button when current page is far from start', () => {
    const props = { ...defaultProps, currentPage: 10, totalPages: 20 };
    render(<Pagination {...props} />);

    // Should show page 1 button
    expect(screen.getByText('1')).toBeInTheDocument();
    // Should show last page button
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('renders mobile view with limited pages', () => {
    // Mock mobile width
    window.innerWidth = 500;

    render(<Pagination {...defaultProps} />);

    // Mobile view should show Prev/Next with page info
    expect(screen.getByText('← Prev')).toBeInTheDocument();
    expect(screen.getByText('Next →')).toBeInTheDocument();
    expect(screen.getByText('1 of 10')).toBeInTheDocument();
  });

  it('handles single page correctly', () => {
    const props = {
      currentPage: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
      onGoToPage: mockOnGoToPage,
    };

    render(<Pagination {...props} />);

    expect(screen.getByText('Previous')).toBeDisabled();
    expect(screen.getByText('Next')).toBeDisabled();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('calculates visible page range correctly', () => {
    const props = { ...defaultProps, currentPage: 5, totalPages: 10 };
    render(<Pagination {...props} />);

    // Should show pages around current page
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('handles edge case with few total pages', () => {
    const props = { ...defaultProps, totalPages: 3 };
    render(<Pagination {...props} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    // Should not show ellipsis for few pages
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('handles mobile navigation correctly', () => {
    window.innerWidth = 500;
    const props = { ...defaultProps, currentPage: 5, hasPrev: true };

    render(<Pagination {...props} />);

    const mobileNext = screen.getByText('Next →');
    const mobilePrev = screen.getByText('← Prev');

    fireEvent.click(mobileNext);
    expect(mockOnGoToPage).toHaveBeenCalledWith(6);

    fireEvent.click(mobilePrev);
    expect(mockOnGoToPage).toHaveBeenCalledWith(4);
  });

  it('shows correct page info in mobile view', () => {
    window.innerWidth = 500;
    const props = { ...defaultProps, currentPage: 7, totalPages: 15 };

    render(<Pagination {...props} />);

    expect(screen.getByText('7 of 15')).toBeInTheDocument();
  });

  it('handles zero total pages gracefully', () => {
    const props = {
      currentPage: 1,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
      onGoToPage: mockOnGoToPage,
    };

    // Should not crash
    expect(() => render(<Pagination {...props} />)).not.toThrow();
  });
});

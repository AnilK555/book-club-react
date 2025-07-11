import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders with error message', () => {
    const error = 'Something went wrong';
    render(<ErrorMessage error={error} />);

    expect(screen.getByText(error)).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('renders with custom error message', () => {
    const customError = 'Network connection failed';
    render(<ErrorMessage error={customError} />);

    expect(screen.getByText(customError)).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    const error = 'Test error';
    render(<ErrorMessage error={error} />);

    const errorContainer = screen.getByText(error).parentElement;
    expect(errorContainer).toHaveClass('bg-red-100', 'border', 'border-red-400', 'text-red-700', 'px-3', 'sm:px-4', 'py-3', 'rounded');
  });

  it('button has correct styling', () => {
    const error = 'Test error';
    render(<ErrorMessage error={error} />);

    const button = screen.getByText('Retry');
    expect(button).toHaveClass(
      'w-full',
      'sm:w-auto',
      'sm:ml-4',
      'bg-red-500',
      'text-white',
      'px-3',
      'py-1',
      'rounded',
      'hover:bg-red-600',
      'text-sm',
    );
  });

  it('calls onRetry when button is clicked', () => {
    const mockRetry = vi.fn();
    const error = 'Test error';
    render(<ErrorMessage error={error} onRetry={mockRetry} />);

    const button = screen.getByText('Retry');
    fireEvent.click(button);

    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('renders with error string', () => {
    const errorString = 'Network error';
    render(<ErrorMessage error={errorString} />);

    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('handles undefined error gracefully', () => {
    render(<ErrorMessage error={undefined} />);

    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('handles null error gracefully', () => {
    render(<ErrorMessage error={null} />);

    expect(screen.getByText('Retry')).toBeInTheDocument();
  });
});

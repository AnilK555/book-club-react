import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders loading spinner with default text', () => {
    render(<LoadingSpinner />);

    expect(screen.getByText('Loading books...')).toBeInTheDocument();
  });

  it('renders loading spinner with fixed text', () => {
    render(<LoadingSpinner />);

    expect(screen.getByText('Loading books...')).toBeInTheDocument();
  });

  it('has correct styling classes for container', () => {
    render(<LoadingSpinner />);

    const container = screen.getByText('Loading books...').parentElement;
    expect(container).toHaveClass('text-center', 'py-8', 'sm:py-12');
  });

  it('has spinner element with correct classes', () => {
    render(<LoadingSpinner />);

    // Find the spinner div
    const spinner = screen.getByText('Loading books...').previousElementSibling;
    expect(spinner).toHaveClass(
      'inline-block',
      'animate-spin',
      'rounded-full',
      'h-6',
      'w-6',
      'sm:h-8',
      'sm:w-8',
      'border-b-2',
      'border-blue-500',
    );
  });

  it('displays loading text with correct styling', () => {
    render(<LoadingSpinner />);

    const text = screen.getByText('Loading books...');
    expect(text).toHaveClass('mt-2', 'text-gray-600', 'text-sm', 'sm:text-base');
  });

  it('has proper accessibility for screen readers', () => {
    render(<LoadingSpinner />);

    // Should have loading text for screen readers
    expect(screen.getByText('Loading books...')).toBeInTheDocument();
  });

  it('renders spinner correctly', () => {
    render(<LoadingSpinner />);

    // Should have both spinner and text
    expect(screen.getByText('Loading books...')).toBeInTheDocument();
    const container = screen.getByText('Loading books...').parentElement;
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
});

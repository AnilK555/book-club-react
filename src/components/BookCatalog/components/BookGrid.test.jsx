import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BookGrid from './BookGrid';

vi.mock('./BookCard', () => ({
  default: ({ book }) => (
    <div data-testid={`book-card-${book.id}`}>
      {book.title} by {book.author}
    </div>
  ),
}));

describe('BookGrid', () => {
  const mockBooks = [
    {
      id: '1',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      genre: 'Fiction',
      year: 1925,
    },
    {
      id: '2',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      genre: 'Fiction',
      year: 1960,
    },
    {
      id: '3',
      title: '1984',
      author: 'George Orwell',
      genre: 'Dystopian',
      year: 1949,
    },
  ];

  it('renders all books in a grid', () => {
    render(<BookGrid books={mockBooks} />);

    expect(screen.getByTestId('book-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('book-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('book-card-3')).toBeInTheDocument();

    expect(screen.getByText('The Great Gatsby by F. Scott Fitzgerald')).toBeInTheDocument();
    expect(screen.getByText('To Kill a Mockingbird by Harper Lee')).toBeInTheDocument();
    expect(screen.getByText('1984 by George Orwell')).toBeInTheDocument();
  });

  it('renders with empty books array', () => {
    render(<BookGrid books={[]} />);

    const grid = document.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(screen.queryByTestId(/book-card-/)).not.toBeInTheDocument();
  });

  it('has correct grid styling classes', () => {
    render(<BookGrid books={mockBooks} />);

    const grid = document.querySelector('.grid');
    expect(grid).toHaveClass(
      'grid',
      'grid-cols-1',
      'sm:grid-cols-2',
      'lg:grid-cols-3',
      'gap-4',
      'sm:gap-6',
    );
  });

  it('renders single book correctly', () => {
    const singleBook = [mockBooks[0]];
    render(<BookGrid books={singleBook} />);

    expect(screen.getByTestId('book-card-1')).toBeInTheDocument();
    expect(screen.getByText('The Great Gatsby by F. Scott Fitzgerald')).toBeInTheDocument();
    expect(screen.queryByTestId('book-card-2')).not.toBeInTheDocument();
  });

  it('handles books with missing properties gracefully', () => {
    const incompleteBooks = [
      {
        id: '1',
        title: 'Book Without Author',
        genre: 'Fiction',
      },
      {
        id: '2',
        author: 'Author Without Title',
        genre: 'Non-fiction',
      },
    ];

    render(<BookGrid books={incompleteBooks} />);

    expect(screen.getByTestId('book-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('book-card-2')).toBeInTheDocument();
  });

  it('renders large number of books correctly', () => {
    const manyBooks = Array.from({ length: 20 }, (_, index) => ({
      id: `book-${index + 1}`,
      title: `Book ${index + 1}`,
      author: `Author ${index + 1}`,
      genre: 'Fiction',
      year: 2000 + index,
    }));

    render(<BookGrid books={manyBooks} />);

    manyBooks.forEach(book => {
      expect(screen.getByTestId(`book-card-${book.id}`)).toBeInTheDocument();
    });
  });

  it('maintains consistent key prop for React rendering', () => {
    const { rerender } = render(<BookGrid books={mockBooks} />);

    expect(screen.getByTestId('book-card-1')).toBeInTheDocument();

    const updatedBooks = [
      { ...mockBooks[0], title: 'Updated Title' },
      ...mockBooks.slice(1),
    ];

    rerender(<BookGrid books={updatedBooks} />);

    expect(screen.getByTestId('book-card-1')).toBeInTheDocument();
  });
});

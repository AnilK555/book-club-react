
import BookCatalog from '../components/BookCatalog/BookCatalog';

export const HomePage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mt-10">Welcome to the Book Club</h1>
      <p className="text-center mt-4">Explore our collection of books, join discussions, and connect with fellow book lovers!</p>
      <BookCatalog />
    </div>
  );
};

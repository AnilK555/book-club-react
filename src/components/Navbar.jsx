import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export const Navbar = () => {
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <Link to="/home" className="text-white text-lg font-bold">
            Book Club
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/reviews" className="text-white border border-amber-300 rounded-2xl px-4 py-2 hover:bg-amber-300 hover:text-gray-800 transition-colors">
              Reviews
            </Link>
            <Link to="/MyReadingList" className="text-white border border-amber-300 rounded-2xl px-4 py-2 hover:bg-amber-300 hover:text-gray-800 transition-colors">
              My Reading List
            </Link>
            <button
              className="text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition-colors"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

          <button
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} mt-4`}>
          <div className="flex flex-col space-y-3">
            <Link
              to="/reviews"
              className="text-white border border-amber-300 rounded-2xl px-4 py-2 hover:bg-amber-300 hover:text-gray-800 transition-colors text-center"
              onClick={closeMenu}
            >
              Reviews
            </Link>
            <Link
              to="/MyReadingList"
              className="text-white border border-amber-300 rounded-2xl px-4 py-2 hover:bg-amber-300 hover:text-gray-800 transition-colors text-center"
              onClick={closeMenu}
            >
              My Reading List
            </Link>
            <button
              className="text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition-colors"
              onClick={() => {
                handleLogout();
                closeMenu();
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

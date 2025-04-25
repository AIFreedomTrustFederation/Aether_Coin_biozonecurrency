import React from 'react';
import { NavLink } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 text-white">
      <nav className="container mx-auto p-4 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <NavLink to="/" className="hover:text-blue-400">
            Aetherion
          </NavLink>
        </div>

        {/* Navigation Links */}
        <ul className="hidden md:flex space-x-6">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'text-blue-400' : 'hover:text-blue-400'
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/merch"
              className={({ isActive }) =>
                isActive ? 'text-blue-400' : 'hover:text-blue-400'
              }
            >
              Merch
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive ? 'text-blue-400' : 'hover:text-blue-400'
              }
            >
              About
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive ? 'text-blue-400' : 'hover:text-blue-400'
              }
            >
              Contact
            </NavLink>
          </li>
        </ul>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <button
            className="text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Toggle navigation menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
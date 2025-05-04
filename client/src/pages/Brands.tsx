import React from 'react';
import { Link } from 'react-router-dom';

const Brands: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Brands</h1>
      <p className="mb-6">Please check out our new and improved brand showcase:</p>
      <Link 
        to="/brand-showcase" 
        className="px-6 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
      >
        Go to Brand Showcase
      </Link>
    </div>
  );
};

export default Brands;
import React from 'react';
import { Link } from 'react-router-dom';

interface BrandProps {
  name: string;
  description: string;
  color: string;
  url: string;
  logoUrl?: string;
}

const Brand: React.FC<BrandProps> = ({ name, description, color, url, logoUrl }) => {
  return (
    <div 
      className="p-6 rounded-lg shadow-md" 
      style={{ backgroundColor: color, color: 'white' }}
    >
      {logoUrl && (
        <div className="mb-4">
          <img src={logoUrl} alt={`${name} logo`} className="h-12 w-auto" />
        </div>
      )}
      <h3 className="text-xl font-bold mb-2">{name}</h3>
      <p className="mb-4">{description}</p>
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-block px-4 py-2 bg-white text-gray-900 rounded-md font-medium hover:bg-gray-100 transition-colors"
      >
        Visit {name}
      </a>
    </div>
  );
};

const BrandShowcase: React.FC = () => {
  const brands: BrandProps[] = [
    {
      name: 'Aether Coin',
      description: 'Quantum-resistant utility token for the decentralized future',
      color: '#1a6f38',
      url: 'https://aethercoin.aifreedomtrust.com',
    },
    {
      name: 'FractalCoin',
      description: 'Innovative fractal-based economic scaling system',
      color: '#2563eb',
      url: 'https://fractalcoin.aifreedomtrust.com',
    },
    {
      name: 'AetherCore',
      description: 'Core blockchain infrastructure and technology services',
      color: '#7c3aed',
      url: 'https://aethercore.aifreedomtrust.com',
    },
    {
      name: 'Biozoe',
      description: 'Temporal life & eternal spirit - consciousness exploration',
      color: '#10b981',
      url: 'https://biozoe.aifreedomtrust.com',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Freedom Trust Ecosystem</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore our family of brands working together to create a quantum-resistant,
          consciousness-aligned blockchain ecosystem
        </p>
      </header>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Brands</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {brands.map((brand) => (
            <Brand key={brand.name} {...brand} />
          ))}
        </div>
      </section>

      <section className="bg-gray-50 p-8 rounded-lg mb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Ecosystem Integration</h2>
        <p className="text-gray-600 mb-4">
          Our brands work seamlessly together to provide a comprehensive solution for blockchain
          technology, digital assets, and spiritual consciousness alignment.
        </p>
        <div className="flex justify-center mt-6">
          <Link 
            to="/"
            className="px-6 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </section>

      <footer className="text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} AI Freedom Trust. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default BrandShowcase;
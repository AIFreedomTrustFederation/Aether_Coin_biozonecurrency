import React, { useState, useEffect } from 'react';

// Mock fetchProducts function (replace with actual API call)
const fetchProducts = async () => {
  return [
    {
      id: 1,
      name: 'Aetherion Ledger Wallet',
      description: 'Secure your digital assets with our state-of-the-art hardware wallet.',
      image: '/images/ledger-wallet.png',
    },
    {
      id: 2,
      name: 'FractalChain Node Kit',
      description: 'Run your own FractalChain node with this easy-to-use hardware kit.',
      image: '/images/node-kit.png',
    },
    {
      id: 3,
      name: 'Aetherion NFT Display Frame',
      description: 'Showcase your NFTs in style with this high-resolution digital frame.',
      image: '/images/nft-frame.png',
    },
    {
      id: 4,
      name: 'Blockchain Developer Hoodie',
      description: 'Stay warm and stylish while coding on the blockchain.',
      image: '/images/dev-hoodie.png',
    },
    {
      id: 5,
      name: 'FractalChain Validator Badge',
      description: 'Exclusive badge for FractalChain validators.',
      image: '/images/validator-badge.png',
    },
    {
      id: 6,
      name: 'Aetherion Holographic Keychain',
      description: 'Carry the future in your pocket with this holographic keychain.',
      image: '/images/holo-keychain.png',
    },
    {
      id: 7,
      name: 'Web3 Starter Kit',
      description: 'Everything you need to start building on Web3.',
      image: '/images/web3-kit.png',
    },
    {
      id: 8,
      name: 'FractalChain T-Shirt',
      description: 'Show your support for FractalChain with this premium t-shirt.',
      image: '/images/fractal-tshirt.png',
    },
    {
      id: 9,
      name: 'Aetherion Decentralized Notebook',
      description: 'A notebook for your decentralized ideas.',
      image: '/images/notebook.png',
    },
    {
      id: 10,
      name: 'Crypto Miner’s Toolkit',
      description: 'Essential tools for crypto miners.',
      image: '/images/miner-toolkit.png',
    },
    {
      id: 11,
      name: 'Aetherion Wireless Earbuds',
      description: 'Experience high-quality sound with a futuristic design.',
      image: '/images/earbuds.png',
    },
    {
      id: 12,
      name: 'FractalChain Coffee Mug',
      description: 'Fuel your blockchain journey with this stylish mug.',
      image: '/images/mug.png',
    },
    {
      id: 13,
      name: 'Aetherion Gaming Mouse',
      description: 'Precision and style for gamers and developers alike.',
      image: '/images/gaming-mouse.png',
    },
    {
      id: 14,
      name: 'FractalChain Poster',
      description: 'Decorate your space with this stunning FractalChain artwork.',
      image: '/images/poster.png',
    },
    {
      id: 15,
      name: 'Aetherion Power Bank',
      description: 'Stay charged with this high-capacity power bank.',
      image: '/images/power-bank.png',
    },
    {
      id: 16,
      name: 'Blockchain Developer’s Guide',
      description: 'A comprehensive guide to blockchain development.',
      image: '/images/dev-guide.png',
    },
    {
      id: 17,
      name: 'Aetherion Desk Mat',
      description: 'Upgrade your workspace with this premium desk mat.',
      image: '/images/desk-mat.png',
    },
    {
      id: 18,
      name: 'FractalChain Cap',
      description: 'Stay cool and represent FractalChain with this stylish cap.',
      image: '/images/cap.png',
    },
    {
      id: 19,
      name: 'Aetherion Smart Lamp',
      description: 'Light up your space with this smart, blockchain-enabled lamp.',
      image: '/images/smart-lamp.png',
    },
    {
      id: 20,
      name: 'Crypto Trading Journal',
      description: 'Track your trades and strategies with this journal.',
      image: '/images/trading-journal.png',
    },
    {
      id: 21,
      name: 'Aetherion Backpack',
      description: 'Carry your gear in style with this futuristic backpack.',
      image: '/images/backpack.png',
    },
    {
      id: 22,
      name: 'FractalChain Sticker Pack',
      description: 'Decorate your devices with these exclusive stickers.',
      image: '/images/stickers.png',
    },
    {
      id: 23,
      name: 'Aetherion Desk Clock',
      description: 'A sleek desk clock with a blockchain-inspired design.',
      image: '/images/desk-clock.png',
    },
    {
      id: 24,
      name: 'FractalChain Mouse Pad',
      description: 'Smooth and durable mouse pad for your workspace.',
      image: '/images/mouse-pad.png',
    },
    {
      id: 25,
      name: 'Aetherion Water Bottle',
      description: 'Stay hydrated with this eco-friendly water bottle.',
      image: '/images/water-bottle.png',
    },
    {
      id: 26,
      name: 'Crypto Miner’s Cap',
      description: 'A cap designed for crypto miners.',
      image: '/images/miner-cap.png',
    },
    {
      id: 27,
      name: 'Aetherion Phone Stand',
      description: 'A futuristic phone stand for your desk.',
      image: '/images/phone-stand.png',
    },
    {
      id: 28,
      name: 'FractalChain Keycap Set',
      description: 'Customize your keyboard with these premium keycaps.',
      image: '/images/keycaps.png',
    },
    {
      id: 29,
      name: 'Aetherion LED Strip',
      description: 'Add a futuristic glow to your workspace.',
      image: '/images/led-strip.png',
    },
    {
      id: 30,
      name: 'Blockchain Puzzle Game',
      description: 'A fun and educational puzzle game about blockchain.',
      image: '/images/puzzle-game.png',
    },
  ];
};

// Reusable ProductCard Component
const ProductCard: React.FC<{ product: { id: number; name: string; description: string; image: string } }> = ({
  product,
}) => {
  return (
    <div
      className="product-card border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300"
      aria-label={`Product: ${product.name}`}
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-40 object-cover mb-4 rounded"
        loading="lazy"
      />
      <h3 className="text-lg font-bold mb-2">{product.name}</h3>
      <p className="text-sm text-gray-600 mb-4">{product.description}</p>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label={`Add ${product.name} to cart`}
      >
        Add to Cart
      </button>
    </div>
  );
};

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="product-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
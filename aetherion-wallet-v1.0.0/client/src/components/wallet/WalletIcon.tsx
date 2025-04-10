import React from 'react';

// Types of wallets we support
type WalletType = 'metamask' | 'trustwallet' | 'coinbasewallet' | 'rainbow' | 'argent' | 
  'alpha' | 'imtoken' | 'spot' | 'aetherion' | 'unknown';

interface WalletIconProps {
  type: WalletType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Component for displaying wallet icons
 * Uses a colorful placeholder for each wallet
 */
const WalletIcon: React.FC<WalletIconProps> = ({ 
  type, 
  size = 'md',
  className = '' 
}) => {
  // Size mappings
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  // Background color based on wallet type
  const getBackground = () => {
    switch (type) {
      case 'metamask':
        return 'bg-amber-500';
      case 'trustwallet':
        return 'bg-blue-500';
      case 'coinbasewallet':
        return 'bg-blue-700';
      case 'rainbow':
        return 'bg-gradient-to-r from-pink-500 to-blue-500';
      case 'argent':
        return 'bg-purple-700';
      case 'alpha':
        return 'bg-teal-600';
      case 'imtoken':
        return 'bg-green-600';
      case 'spot':
        return 'bg-gray-700';
      case 'aetherion':
        return 'bg-gradient-to-r from-purple-700 via-blue-500 to-teal-400';
      default:
        return 'bg-gray-500';
    }
  };
  
  // First letter of wallet type
  const getInitial = () => {
    if (type === 'aetherion') return 'A';
    return type.charAt(0).toUpperCase();
  };
  
  return (
    <div 
      className={`${sizeClasses[size]} ${getBackground()} rounded-full flex items-center justify-center text-white font-bold ${className}`}
      aria-label={`${type} wallet`}
    >
      {getInitial()}
    </div>
  );
};

export default WalletIcon;
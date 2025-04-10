import React from 'react';

interface LightweightLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
}

/**
 * Ultra lightweight SVG-based logo component for initial fast page loads
 * No hooks, no effects, no external assets - just pure SVG
 */
const LightweightLogo: React.FC<LightweightLogoProps> = ({ 
  size = 'md', 
  className = '',
  color = '#aa00ff' 
}) => {
  // Map size string to actual pixel values
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96
  };
  
  // Get actual size in pixels
  const pixelSize = sizeMap[size];
  
  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Simplified Aetherion logo - toroid shape with quantum effects */}
      <defs>
        <linearGradient id="gradientFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor="#4400aa" stopOpacity="0.9" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer torus */}
      <ellipse 
        cx="50" 
        cy="50" 
        rx="40" 
        ry="25" 
        strokeWidth="3"
        stroke="url(#gradientFill)"
        fill="none"
        transform="rotate(35 50 50)"
        filter="url(#glow)"
      />
      
      {/* Inner torus */}
      <ellipse 
        cx="50" 
        cy="50" 
        rx="25" 
        ry="40" 
        strokeWidth="3"
        stroke="url(#gradientFill)"
        fill="none"
        transform="rotate(-35 50 50)"
        filter="url(#glow)"
      />
      
      {/* Energy orb in center */}
      <circle 
        cx="50" 
        cy="50" 
        r="12" 
        fill="url(#gradientFill)"
        opacity="0.7"
        filter="url(#glow)"
      />
      
      {/* Quantum particle effects */}
      <circle cx="35" cy="38" r="3" fill={color} opacity="0.8" />
      <circle cx="65" cy="62" r="3" fill={color} opacity="0.8" />
      <circle cx="45" cy="70" r="3" fill={color} opacity="0.8" />
      <circle cx="55" cy="30" r="3" fill={color} opacity="0.8" />
    </svg>
  );
};

export default LightweightLogo;
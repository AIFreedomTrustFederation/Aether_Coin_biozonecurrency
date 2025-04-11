import React, { useEffect, useState } from 'react';
import aetherionLogoPath from "@/assets/aetherion-logo.svg";

interface AetherionLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  responsive?: boolean;
}

const sizesMap = {
  xs: { width: 24, height: 24 },
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
  xl: { width: 128, height: 128 },
};

/**
 * Optimized Aetherion logo component that adapts to different screen sizes
 */
const AetherionLogo: React.FC<AetherionLogoProps> = ({ 
  size = 'md',
  className = '',
  responsive = false
}) => {
  const [currentSize, setCurrentSize] = useState(size);
  
  useEffect(() => {
    if (!responsive) return;
    
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCurrentSize('xs');
      } else if (window.innerWidth < 768) {
        setCurrentSize('sm');
      } else if (window.innerWidth < 1024) {
        setCurrentSize('md');
      } else if (window.innerWidth < 1280) {
        setCurrentSize('lg');
      } else {
        setCurrentSize('xl');
      }
    };
    
    // Set initial size
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [responsive]);
  
  const dimensions = sizesMap[responsive ? currentSize : size];

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ 
        width: dimensions.width, 
        height: dimensions.height,
      }}
    >
      <img 
        src={aetherionLogoPath}
        alt="Aetherion Logo" 
        className="w-full h-full object-contain"
        style={{ filter: 'drop-shadow(0 0 8px rgba(170, 0, 255, 0.5))' }}
        loading="eager"
      />
    </div>
  );
};

export default AetherionLogo;
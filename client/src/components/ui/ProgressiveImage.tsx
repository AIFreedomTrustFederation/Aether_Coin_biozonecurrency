import React, { useState, useEffect } from 'react';

interface ProgressiveImageProps {
  src: string;
  lowQualitySrc?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * ProgressiveImage component for smoother image loading experience
 * Shows a low-quality placeholder while the full image loads
 */
export const ProgressiveImage = ({
  src,
  lowQualitySrc,
  alt,
  className = '',
  width,
  height
}: ProgressiveImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || '');
  
  useEffect(() => {
    // Reset state when source changes
    setIsLoaded(false);
    
    if (!lowQualitySrc) {
      // If no low quality placeholder, use low opacity background
      setCurrentSrc('');
    }
    
    // Preload high quality image
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };
    
    return () => {
      // Clean up
      img.onload = null;
    };
  }, [src, lowQualitySrc]);
  
  return (
    <div 
      className={`relative overflow-hidden ${className}`} 
      style={{ width: width ? `${width}px` : '100%', height: height ? `${height}px` : 'auto' }}
    >
      {/* Placeholder or lowQualitySrc */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse"
          style={{ backgroundColor: currentSrc ? 'transparent' : undefined }}
        />
      )}
      
      {/* Image with transition */}
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-40'}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          width={width}
          height={height}
        />
      )}
    </div>
  );
};

export default ProgressiveImage;
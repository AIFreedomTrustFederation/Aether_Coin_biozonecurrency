import React from 'react';
import { ProgressCircleProps } from '../types';

/**
 * A circular progress indicator component
 * 
 * @param props Component properties
 * @returns React component
 */
const ProgressCircle: React.FC<ProgressCircleProps> = ({
  percentage,
  size = 64,
  strokeWidth = 4,
  color = '#0284c7',
  backgroundColor = '#e2e8f0',
  children,
  className = ''
}) => {
  // Calculate dimensions
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          className="transition-all duration-300"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={backgroundColor}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <circle
          className="transition-all duration-300 ease-in-out"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      
      {/* Children content (typically text or icon) */}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};

export default ProgressCircle;
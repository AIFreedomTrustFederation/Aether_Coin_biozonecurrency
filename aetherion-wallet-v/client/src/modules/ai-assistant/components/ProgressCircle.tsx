import React from 'react';

interface ProgressCircleProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  thresholds?: {
    low: number;
    medium: number;
    high: number;
  };
  showLabel?: boolean;
  label?: string;
  className?: string;
}

/**
 * A circular progress indicator with customizable thresholds for color coding
 */
const ProgressCircle: React.FC<ProgressCircleProps> = ({
  value,
  size = 40,
  strokeWidth = 4,
  thresholds = { low: 30, medium: 60, high: 85 },
  showLabel = false,
  label = '',
  className = '',
}) => {
  // Normalize value to 0-100 range
  const normalizedValue = Math.min(100, Math.max(0, value));
  
  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (normalizedValue / 100) * circumference;
  
  // Determine color based on thresholds
  const getColor = () => {
    if (normalizedValue >= thresholds.high) {
      return 'text-red-500';
    } else if (normalizedValue >= thresholds.medium) {
      return 'text-yellow-500';
    } else if (normalizedValue >= thresholds.low) {
      return 'text-emerald-500';
    } else {
      return 'text-blue-500';
    }
  };
  
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-gray-200 dark:stroke-gray-700"
        />
        
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className={getColor()}
        />
      </svg>
      
      {/* Value */}
      <div className="absolute flex flex-col items-center justify-center w-full h-full">
        <span className="text-xs font-semibold">{Math.round(normalizedValue)}%</span>
        {showLabel && label && (
          <span className="text-[0.6rem] opacity-70 mt-[-2px]">{label}</span>
        )}
      </div>
    </div>
  );
};

export default ProgressCircle;
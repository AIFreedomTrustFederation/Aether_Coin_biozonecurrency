import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export interface QuantumLoaderProps {
  size?: "small" | "medium" | "large";
  type?: "orbital" | "pulse" | "convergence";
  loaderText?: string;
  showPercentage?: boolean;
}

const QuantumLoader: React.FC<QuantumLoaderProps> = ({ 
  size = "medium", 
  type = "orbital",
  loaderText = "Loading",
  showPercentage = false
}) => {
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Sizes configuration
  const sizeConfig = {
    small: {
      container: "w-16 h-16",
      particleSize: "w-1 h-1",
      fontSize: "text-xs",
      orbitalRadius: 20,
      particleCount: 8
    },
    medium: {
      container: "w-24 h-24",
      particleSize: "w-1.5 h-1.5",
      fontSize: "text-sm",
      orbitalRadius: 32,
      particleCount: 12
    },
    large: {
      container: "w-32 h-32",
      particleSize: "w-2 h-2",
      fontSize: "text-base",
      orbitalRadius: 48,
      particleCount: 16
    }
  };

  // Simulate loading progress
  useEffect(() => {
    if (showPercentage) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          const newValue = prev + Math.random() * 5;
          return newValue >= 100 ? 100 : newValue;
        });
      }, 200);
      
      return () => clearInterval(interval);
    }
  }, [showPercentage]);

  // Render different loader types
  const renderLoader = () => {
    switch (type) {
      case "orbital":
        return renderOrbitalLoader();
      case "pulse":
        return renderPulseLoader();
      case "convergence":
        return renderConvergenceLoader();
      default:
        return renderOrbitalLoader();
    }
  };

  // Orbital loader - particles orbit around a center point
  const renderOrbitalLoader = () => {
    const { particleCount, orbitalRadius, particleSize } = sizeConfig[size];
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * 360;
      const delay = (i / particleCount) * 0.8;
      const color = getColorForIndex(i, particleCount);

      particles.push(
        <motion.div
          key={i}
          className={`absolute ${particleSize} rounded-full ${color}`}
          initial={{ 
            x: Math.cos(angle * (Math.PI / 180)) * orbitalRadius,
            y: Math.sin(angle * (Math.PI / 180)) * orbitalRadius,
            opacity: 0.3
          }}
          animate={{ 
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 2,
            delay: delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            left: "50%",
            top: "50%",
            translateX: "-50%",
            translateY: "-50%",
            x: Math.cos(angle * (Math.PI / 180)) * orbitalRadius,
            y: Math.sin(angle * (Math.PI / 180)) * orbitalRadius,
            boxShadow: `0 0 8px ${getColorShadow(i, particleCount)}`
          }}
        />
      );
    }

    return (
      <>
        {particles}
        <motion.div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 rounded-full bg-[hsl(var(--greenshift)/30%)]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </>
    );
  };

  // Pulse loader - expanding and contracting circles
  const renderPulseLoader = () => {
    return (
      <>
        <motion.div 
          className="absolute inset-0 rounded-full border-2 border-[hsl(var(--redshift)/50%)]"
          animate={{
            scale: [0.5, 1.5],
            opacity: [1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
        
        <motion.div 
          className="absolute inset-0 rounded-full border border-[hsl(var(--blueshift)/50%)]"
          animate={{
            scale: [0.5, 1.2],
            opacity: [1, 0]
          }}
          transition={{
            duration: 2,
            delay: 0.5,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
        
        <motion.div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 rounded-full bg-[hsl(var(--greenshift)/30%)]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </>
    );
  };

  // Convergence loader - particles converging at the center
  const renderConvergenceLoader = () => {
    const { particleCount, particleSize } = sizeConfig[size];
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * 360;
      const delay = (i / particleCount) * 0.5;
      const distance = sizeConfig[size].orbitalRadius * 1.5;
      const color = getColorForIndex(i, particleCount);

      particles.push(
        <motion.div
          key={i}
          className={`absolute ${particleSize} rounded-full ${color}`}
          initial={{ 
            x: Math.cos(angle * (Math.PI / 180)) * distance,
            y: Math.sin(angle * (Math.PI / 180)) * distance,
            scale: 0.5,
            opacity: 0.3
          }}
          animate={{ 
            x: [Math.cos(angle * (Math.PI / 180)) * distance, 0, Math.cos(angle * (Math.PI / 180)) * distance],
            y: [Math.sin(angle * (Math.PI / 180)) * distance, 0, Math.sin(angle * (Math.PI / 180)) * distance],
            opacity: [0.3, 1, 0.3],
            scale: [0.5, 1.5, 0.5]
          }}
          transition={{
            duration: 3,
            delay: delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            left: "50%",
            top: "50%",
            translateX: "-50%",
            translateY: "-50%",
            boxShadow: `0 0 8px ${getColorShadow(i, particleCount)}`
          }}
        />
      );
    }

    return (
      <>
        {particles}
        <motion.div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/4 rounded-full bg-white"
          animate={{
            scale: [0.8, 1.5, 0.8],
            opacity: [0.3, 0.7, 0.3],
            backgroundColor: [
              "hsl(var(--redshift)/50%)", 
              "hsl(var(--greenshift)/50%)", 
              "hsl(var(--blueshift)/50%)",
              "hsl(var(--redshift)/50%)"
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </>
    );
  };

  // Helper function to get color based on particle index
  const getColorForIndex = (index: number, total: number) => {
    const section = Math.floor((index / total) * 3);
    
    switch (section) {
      case 0: return "bg-[hsl(var(--redshift))]";
      case 1: return "bg-[hsl(var(--greenshift))]";
      case 2: return "bg-[hsl(var(--blueshift))]";
      default: return "bg-[hsl(var(--redshift))]";
    }
  };

  // Helper function to get shadow color
  const getColorShadow = (index: number, total: number) => {
    const section = Math.floor((index / total) * 3);
    
    switch (section) {
      case 0: return "hsl(var(--redshift)/70%)";
      case 1: return "hsl(var(--greenshift)/70%)";
      case 2: return "hsl(var(--blueshift)/70%)";
      default: return "hsl(var(--redshift)/70%)";
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeConfig[size].container} mb-3`}>
        {renderLoader()}
      </div>
      
      <div className="text-center">
        {showPercentage ? (
          <div className="flex flex-col items-center">
            <span className={`${sizeConfig[size].fontSize} convergence-text`}>
              {loaderText}
            </span>
            <div className="w-24 h-1 mt-2 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[hsl(var(--redshift))] via-[hsl(var(--greenshift))] to-[hsl(var(--blueshift))]"
                initial={{ width: "0%" }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ ease: "easeInOut" }}
              />
            </div>
            <span className={`${sizeConfig[size].fontSize} text-muted-foreground mt-1`}>
              {Math.round(loadingProgress)}%
            </span>
          </div>
        ) : (
          <span className={`${sizeConfig[size].fontSize} convergence-text`}>
            {loaderText}
          </span>
        )}
      </div>
    </div>
  );
};

export default QuantumLoader;
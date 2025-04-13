import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type QuantumLoaderProps = {
  /** Size class for the loader (small, medium, or large) */
  size?: "sm" | "md" | "lg";
  /** Color theme for the loader */
  variant?: "forest" | "water" | "dual" | "cosmos";
  /** Show text label below the loader */
  showLabel?: boolean;
  /** Custom label text */
  labelText?: string;
  /** Optional additional CSS classes */
  className?: string;
  /** Determines if the animation should run (e.g., for loading states) */
  isLoading?: boolean;
};

/**
 * Quantum-inspired animated loading sequence component
 * Visualizes quantum principles through animation
 */
export const QuantumLoader: React.FC<QuantumLoaderProps> = ({
  size = "md",
  variant = "dual",
  showLabel = false,
  labelText = "Quantum Processing",
  className = "",
  isLoading = true,
}) => {
  // Sizing based on prop
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-36 h-36",
  };
  
  // Theme variants
  const variantClasses = {
    forest: "quantum-loader-forest",
    water: "quantum-loader-water",
    dual: "quantum-loader-dual",
    cosmos: "quantum-loader-cosmos",
  };
  
  // Particle counts based on size
  const particleCounts = {
    sm: 5,
    md: 8,
    lg: 12,
  };
  
  // State for quantum state simulation
  const [quantumState, setQuantumState] = useState(0);
  
  // Simulate quantum state changes
  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setQuantumState((prev) => (prev + 1) % 4);
    }, 800);
    
    return () => clearInterval(interval);
  }, [isLoading]);
  
  // Generate particles
  const particles = Array.from({ length: particleCounts[size] }).map((_, i) => (
    <motion.div 
      key={i}
      className={cn(
        "absolute rounded-full opacity-70",
        i % 2 === 0 ? "bg-forest-400" : "bg-water-400",
        size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : "w-4 h-4"
      )}
      initial={{ 
        x: 0, 
        y: 0, 
        opacity: 0.4 
      }}
      animate={{ 
        x: [0, (i % 3 - 1) * 30, 0],
        y: [0, (i % 2 === 0 ? -1 : 1) * 30, 0],
        opacity: [0.4, 0.8, 0.4],
        scale: [1, i % 2 === 0 ? 1.5 : 0.5, 1]
      }}
      transition={{ 
        duration: 2 + (i % 3), 
        ease: "easeInOut", 
        repeat: Infinity,
        delay: i * 0.2
      }}
      style={{
        left: `calc(50% - ${size === "sm" ? 4 : size === "md" ? 6 : 8}px)`,
        top: `calc(50% - ${size === "sm" ? 4 : size === "md" ? 6 : 8}px)`,
      }}
    />
  ));
  
  // Generate orbital rings
  const rings = Array.from({ length: 3 }).map((_, i) => (
    <motion.div
      key={`ring-${i}`}
      className={cn(
        "absolute rounded-full border opacity-20",
        variant === "forest" ? "border-forest-400" : 
        variant === "water" ? "border-water-400" : 
        variant === "cosmos" ? "border-blue-400" : 
        i % 2 === 0 ? "border-forest-400" : "border-water-400"
      )}
      style={{
        width: `${(i + 1) * 25}%`,
        height: `${(i + 1) * 25}%`,
        left: `${50 - ((i + 1) * 25) / 2}%`,
        top: `${50 - ((i + 1) * 25) / 2}%`,
      }}
      animate={{
        rotate: [0, i % 2 === 0 ? 360 : -360],
      }}
      transition={{
        duration: 15 + i * 5,
        ease: "linear",
        repeat: Infinity,
      }}
    />
  ));
  
  // Quantum state effects
  const quantumCore = (
    <motion.div 
      className={cn(
        "absolute rounded-full",
        variant === "forest" ? "bg-forest-500" : 
        variant === "water" ? "bg-water-500" : 
        variant === "cosmos" ? "bg-blue-500" : 
        "bg-gradient-to-r from-forest-500 to-water-500"
      )}
      style={{
        width: size === "sm" ? "30%" : size === "md" ? "25%" : "20%",
        height: size === "sm" ? "30%" : size === "md" ? "25%" : "20%",
        left: `calc(50% - ${size === "sm" ? "15%" : size === "md" ? "12.5%" : "10%"})`,
        top: `calc(50% - ${size === "sm" ? "15%" : size === "md" ? "12.5%" : "10%"})`,
      }}
      animate={{ 
        opacity: [0.7, 0.9, 0.7],
        scale: [1, 1.2, 1],
      }}
      transition={{ 
        duration: 2, 
        ease: "easeInOut", 
        repeat: Infinity,
      }}
    />
  );
  
  // Wave function collapse simulation
  const waveFunction = (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      animate={{
        opacity: quantumState === 3 ? [0.1, 0.3, 0.1] : 0,
      }}
      transition={{
        duration: 0.8,
        ease: "easeInOut",
      }}
    >
      <motion.div
        className={cn(
          "rounded-full",
          variant === "forest" ? "bg-forest-300/30" : 
          variant === "water" ? "bg-water-300/30" : 
          variant === "cosmos" ? "bg-blue-300/30" : 
          "bg-gradient-to-r from-forest-300/30 to-water-300/30"
        )}
        animate={{
          scale: [1, 2.5, 1],
        }}
        transition={{
          duration: 0.8,
          ease: "easeInOut",
        }}
        style={{
          width: size === "sm" ? "40%" : size === "md" ? "35%" : "30%",
          height: size === "sm" ? "40%" : size === "md" ? "35%" : "30%",
        }}
      />
    </motion.div>
  );
  
  if (!isLoading) return null;
  
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className={cn("relative", sizeClasses[size], variantClasses[variant])}>
        {/* Orbital rings */}
        {rings}
        
        {/* Core quantum state */}
        {quantumCore}
        
        {/* Wave function collapse effect */}
        {waveFunction}
        
        {/* Quantum particles */}
        {particles}
        
        {/* Entanglement lines - dynamically generated */}
        <svg className="absolute inset-0 w-full h-full">
          <motion.path
            d="M 50,30 C 70,40 80,60 50,70 C 20,60 30,40 50,30"
            fill="none"
            stroke={variant === "forest" ? "#4d994d" : 
                  variant === "water" ? "#0891b2" : 
                  variant === "cosmos" ? "#3b82f6" : "#4d994d"}
            strokeWidth={size === "sm" ? 0.5 : size === "md" ? 0.7 : 1}
            strokeOpacity={0.3}
            strokeDasharray="3,3"
            animate={{
              d: [
                "M 50,30 C 70,40 80,60 50,70 C 20,60 30,40 50,30",
                "M 30,50 C 40,70 60,80 70,50 C 60,20 40,30 30,50",
                "M 50,70 C 30,60 20,40 50,30 C 80,40 70,60 50,70",
                "M 70,50 C 60,30 40,20 30,50 C 40,80 60,70 70,50",
              ][quantumState],
            }}
            transition={{
              duration: 1,
              ease: "easeInOut",
            }}
          />
        </svg>
      </div>
      
      {showLabel && (
        <motion.div 
          className="mt-3 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {labelText}
        </motion.div>
      )}
    </div>
  );
};

export default QuantumLoader;
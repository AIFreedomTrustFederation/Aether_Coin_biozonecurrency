import React, { useState, useEffect, useLayoutEffect } from 'react';
import ReactConfetti from 'react-confetti';

// Simple internal window size hook to avoid dependency issues
const useWindowSize = () => {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  
  useLayoutEffect(() => {
    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', updateSize);
    updateSize();
    
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  return size;
};

interface BlockchainConfettiProps {
  isActive: boolean;
  duration?: number;
  onComplete?: () => void;
}

/**
 * BlockchainConfetti Component
 * 
 * This component displays blockchain-themed confetti animation when a wallet is connected.
 * It uses custom blockchain shapes (coins, blocks, wallet icons) as particles.
 */
const BlockchainConfetti: React.FC<BlockchainConfettiProps> = ({ 
  isActive, 
  duration = 4000, 
  onComplete 
}) => {
  const { width, height } = useWindowSize();
  const [isRunning, setIsRunning] = useState(false);
  
  // Custom shapes for confetti pieces
  const drawCoin = (ctx: CanvasRenderingContext2D) => {
    // Gold color for coin
    ctx.fillStyle = '#F7931A';
    ctx.beginPath();
    ctx.arc(10, 10, 9, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add a symbol inside the coin
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('₳', 10, 10);
  };
  
  const drawBlock = (ctx: CanvasRenderingContext2D) => {
    // Block shape (cube-like)
    ctx.fillStyle = '#6F4FF2';
    ctx.fillRect(0, 0, 20, 20);
    
    // Add lines to make it look like a cube
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(5, 5);
    ctx.lineTo(15, 5);
    ctx.lineTo(15, 15);
    ctx.lineTo(5, 15);
    ctx.closePath();
    ctx.stroke();
  };
  
  const drawWallet = (ctx: CanvasRenderingContext2D) => {
    // Wallet shape
    ctx.fillStyle = '#00C39A';
    ctx.fillRect(0, 0, 20, 15);
    
    // Wallet handle
    ctx.fillStyle = '#00A38A';
    ctx.fillRect(7, 0, 6, -3);
  };
  
  // Custom drawn confetti
  const customConfettiShapes = [
    // Function that draws coin shape
    (ctx: CanvasRenderingContext2D) => {
      drawCoin(ctx);
      return true; // Return true for custom drawn shapes
    },
    // Function that draws block shape
    (ctx: CanvasRenderingContext2D) => {
      drawBlock(ctx);
      return true;
    },
    // Function that draws wallet shape
    (ctx: CanvasRenderingContext2D) => {
      drawWallet(ctx);
      return true;
    }
  ];
  
  useEffect(() => {
    if (isActive) {
      setIsRunning(true);
      
      // Stop the confetti after duration
      const timer = setTimeout(() => {
        setIsRunning(false);
        if (onComplete) {
          onComplete();
        }
      }, duration);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [isActive, duration, onComplete]);
  
  if (!isRunning) {
    return null;
  }
  
  return (
    <ReactConfetti
      width={width}
      height={height}
      recycle={false}
      numberOfPieces={150}
      gravity={0.15}
      colors={[
        '#F7931A', // Bitcoin gold
        '#627EEA', // Ethereum blue
        '#24AE8F', // Aetherion green (customize this for your app's branding)
        '#FF9900', // Binance yellow
        '#8A2BE2', // Quantum purple
        '#00C39A', // Teal
        '#6F4FF2'  // Purple
      ]}
      drawShape={(ctx) => {
        // Randomly select one of our custom shapes or use default
        const randomIndex = Math.floor(Math.random() * (customConfettiShapes.length + 1));
        if (randomIndex < customConfettiShapes.length) {
          return customConfettiShapes[randomIndex](ctx);
        }
        return null; // Default confetti shape
      }}
    />
  );
};

export default BlockchainConfetti;
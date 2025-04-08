import React, { useState, useEffect } from 'react';
import WalletConnector from './WalletConnector';
import BlockchainConfetti from './BlockchainConfetti';
import { useWallet } from '../../context/WalletContext';

interface CelebratingWalletConnectorProps {
  // Any additional props can be added here
}

/**
 * CelebratingWalletConnector Component
 * 
 * Enhances the WalletConnector with animated blockchain-themed confetti
 * that plays when a wallet is successfully connected.
 */
const CelebratingWalletConnector: React.FC<CelebratingWalletConnectorProps> = () => {
  const { wallet } = useWallet();
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasShownCelebration, setHasShownCelebration] = useState(false);
  
  // Track when wallet connects successfully
  useEffect(() => {
    // Only show celebration when first connecting (not on page refresh with connected wallet)
    if (wallet && wallet.status === 'connected' && !hasShownCelebration) {
      setShowCelebration(true);
      setHasShownCelebration(true);
    } else if (!wallet || wallet.status !== 'connected') {
      // Reset the celebration flag when disconnected
      setHasShownCelebration(false);
    }
  }, [wallet, hasShownCelebration]);
  
  const handleCelebrationComplete = () => {
    setShowCelebration(false);
  };
  
  return (
    <>
      <WalletConnector />
      <BlockchainConfetti 
        isActive={showCelebration} 
        duration={5000}
        onComplete={handleCelebrationComplete}
      />
    </>
  );
};

export default CelebratingWalletConnector;
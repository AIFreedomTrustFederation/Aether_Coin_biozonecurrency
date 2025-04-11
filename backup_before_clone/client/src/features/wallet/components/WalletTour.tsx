import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Shield, ArrowUpRight, ArrowDownLeft, History, Zap, Lock, RefreshCw } from 'lucide-react';

interface WalletTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

type TourStep = {
  id: string;
  title: string;
  content: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  element: string;
  icon: React.ReactNode;
  actions?: {
    text: string;
    action: () => void;
  }[];
};

export const WalletTour = ({ onComplete, onSkip }: WalletTourProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [highestStepSeen, setHighestStepSeen] = useState(0);

  // Define tour steps
  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Your Quantum Wallet',
      content: 'This guided tour will help you understand the key features of your quantum-resistant wallet. Would you like to explore the wallet together?',
      position: 'top',
      element: '.wallet-overview',
      icon: <Wallet className="h-5 w-5 text-primary" />,
      actions: [
        {
          text: 'Let\'s go!',
          action: () => goToNextStep()
        }
      ]
    },
    {
      id: 'quantum-security',
      title: 'Quantum-Resistant Security',
      content: 'Your wallet is protected by post-quantum cryptography, designed to withstand attacks from both classical and quantum computers.',
      position: 'right',
      element: '.wallet-security-info',
      icon: <Shield className="h-5 w-5 text-primary" />
    },
    {
      id: 'assets-overview',
      title: 'Your Digital Assets',
      content: 'This section shows all cryptocurrencies in your wallet with real-time valuations and performance metrics.',
      position: 'left',
      element: '.assets-list',
      icon: <Zap className="h-5 w-5 text-primary" />
    },
    {
      id: 'send-function',
      title: 'Sending Assets',
      content: 'Easily send cryptocurrencies to any address. Each transaction is protected by quantum-resistant encryption.',
      position: 'bottom',
      element: '.send-assets-button',
      icon: <ArrowUpRight className="h-5 w-5 text-primary" />
    },
    {
      id: 'receive-function',
      title: 'Receiving Assets',
      content: 'Share your wallet address or QR code to receive funds from others securely.',
      position: 'bottom',
      element: '.receive-assets-button',
      icon: <ArrowDownLeft className="h-5 w-5 text-primary" />
    },
    {
      id: 'transaction-history',
      title: 'Transaction History',
      content: 'View your complete transaction history with detailed information about each transfer.',
      position: 'left',
      element: '.transaction-history',
      icon: <History className="h-5 w-5 text-primary" />
    },
    {
      id: 'security-features',
      title: 'Advanced Security Features',
      content: 'Your wallet includes multi-factor authentication, real-time threat monitoring, and quantum-resistant key storage.',
      position: 'top',
      element: '.wallet-security',
      icon: <Lock className="h-5 w-5 text-primary" />
    },
    {
      id: 'complete',
      title: 'Tour Complete!',
      content: 'You now understand the basics of your quantum wallet. Would you like to explore more advanced features or ask any questions?',
      position: 'top',
      element: '.wallet-overview',
      icon: <RefreshCw className="h-5 w-5 text-primary" />,
      actions: [
        {
          text: 'Ask a Question',
          action: () => handleAskQuestion()
        },
        {
          text: 'Start Using Wallet',
          action: () => finishTour()
        }
      ]
    }
  ];

  const currentStep = tourSteps[currentStepIndex];

  // Navigate through tour steps
  const goToNextStep = useCallback(() => {
    if (currentStepIndex < tourSteps.length - 1) {
      setCurrentStepIndex(prevStep => {
        const nextStep = prevStep + 1;
        setHighestStepSeen(prev => Math.max(prev, nextStep));
        return nextStep;
      });
    } else {
      finishTour();
    }
  }, [currentStepIndex, tourSteps.length]);

  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prevStep => prevStep - 1);
    }
  }, [currentStepIndex]);

  const finishTour = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onSkip();
    }, 300);
  }, [onSkip]);

  const handleAskQuestion = useCallback(() => {
    // This would trigger the AI assistant to appear
    console.log('Ask a question triggered');
    // For now, just move to the complete step
    finishTour();
  }, [finishTour]);

  // Position the tooltip next to the target element
  useEffect(() => {
    const positionTooltip = () => {
      const tooltipElement = document.getElementById('wallet-tour-tooltip');
      const targetElement = document.querySelector(currentStep.element);
      
      if (tooltipElement && targetElement) {
        const targetRect = targetElement.getBoundingClientRect();
        const tooltipRect = tooltipElement.getBoundingClientRect();
        const spacing = 20; // Space between tooltip and target
        
        let top, left;
        
        switch (currentStep.position) {
          case 'top':
            top = targetRect.top - tooltipRect.height - spacing;
            left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
            break;
          case 'right':
            top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
            left = targetRect.right + spacing;
            break;
          case 'bottom':
            top = targetRect.bottom + spacing;
            left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
            break;
          case 'left':
            top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
            left = targetRect.left - tooltipRect.width - spacing;
            break;
        }
        
        // Ensure tooltip stays within viewport
        top = Math.max(10, Math.min(top, window.innerHeight - tooltipRect.height - 10));
        left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10));
        
        tooltipElement.style.top = `${top}px`;
        tooltipElement.style.left = `${left}px`;
      }
    };
    
    // Position initially and on window resize
    positionTooltip();
    window.addEventListener('resize', positionTooltip);
    
    // Highlight the target element
    const targetElement = document.querySelector(currentStep.element);
    if (targetElement) {
      targetElement.classList.add('tour-highlight');
    }
    
    return () => {
      window.removeEventListener('resize', positionTooltip);
      
      // Remove highlight
      const highlightedElement = document.querySelector('.tour-highlight');
      if (highlightedElement) {
        highlightedElement.classList.remove('tour-highlight');
      }
    };
  }, [currentStep]);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 bg-black/60 z-50" onClick={handleSkip} />
      
      {/* Tour tooltip */}
      <Card 
        id="wallet-tour-tooltip" 
        className="fixed z-50 w-80 shadow-lg transition-opacity duration-300 opacity-100"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            {currentStep.icon}
            <span className="ml-2">{currentStep.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{currentStep.content}</p>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            {Array.from({ length: tourSteps.length }).map((_, index) => (
              <span 
                key={index} 
                className={`w-2 h-2 rounded-full ${index <= highestStepSeen ? 'bg-primary' : 'bg-muted'} ${index === currentStepIndex ? 'scale-125' : ''}`} 
              />
            ))}
          </div>
          
          <div className="flex space-x-2">
            {currentStepIndex > 0 && (
              <Button variant="outline" size="sm" onClick={goToPreviousStep}>
                Back
              </Button>
            )}
            
            {currentStep.actions ? (
              currentStep.actions.map((action, index) => (
                <Button key={index} size="sm" onClick={action.action}>
                  {action.text}
                </Button>
              ))
            ) : (
              <Button size="sm" onClick={goToNextStep}>
                Next
              </Button>
            )}
            
            {currentStepIndex < tourSteps.length - 1 && (
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                Skip
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default WalletTour;
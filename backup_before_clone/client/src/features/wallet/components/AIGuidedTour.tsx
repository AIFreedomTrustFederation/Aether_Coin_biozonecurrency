import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wallet, Shield, ArrowUpRight, ArrowDownLeft, 
  History, Zap, Lock, RefreshCw, BrainCircuit 
} from 'lucide-react';
import AIGuidanceService from '../services/AIGuidanceService';
import { Tooltip } from '@/components/ui/tooltip';

interface AIGuidedTourProps {
  onComplete: () => void;
  onSkip: () => void;
  userSkillLevel?: 'beginner' | 'intermediate' | 'advanced';
  walletData?: {
    walletBalances: Record<string, number>;
    recentTransactions: any[];
    userPreferences: Record<string, any>;
  };
}

type TourStep = {
  id: string;
  title: string;
  content: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  element: string;
  icon: React.ReactNode;
  aiPrompt?: string;
  actions?: {
    text: string;
    action: () => void;
  }[];
};

export const AIGuidedTour = ({ 
  onComplete, 
  onSkip, 
  userSkillLevel = 'beginner',
  walletData
}: AIGuidedTourProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [highestStepSeen, setHighestStepSeen] = useState(0);
  const [aiResponses, setAiResponses] = useState<Record<string, string>>({});
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    actionType: string;
    actionText: string;
    actionData?: any;
  }[]>([]);

  // Define tour steps
  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'AI-Guided Wallet Tour',
      content: 'I\'ll be your personal AI guide to exploring this quantum-resistant wallet. I can adapt explanations to your experience level and answer questions along the way.',
      position: 'top',
      element: '.wallet-overview',
      icon: <BrainCircuit className="h-5 w-5 text-primary" />,
      aiPrompt: 'Introduce yourself as an AI guide for a quantum-resistant wallet. Keep it brief and friendly. Mention you\'ll be explaining key features and can answer questions.',
      actions: [
        {
          text: 'Let\'s begin',
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
      icon: <Shield className="h-5 w-5 text-primary" />,
      aiPrompt: `Explain quantum-resistant cryptography in simple terms for a ${userSkillLevel} user. Mention why it's important for the future and how it keeps their assets safe.`
    },
    {
      id: 'assets-overview',
      title: 'Your Digital Assets',
      content: 'This section shows all cryptocurrencies in your wallet with real-time valuations and performance metrics.',
      position: 'left',
      element: '.assets-list',
      icon: <Zap className="h-5 w-5 text-primary" />,
      aiPrompt: `Explain the assets overview section of the wallet to a ${userSkillLevel} user. Mention the key metrics they should pay attention to for monitoring their portfolio.`
    },
    {
      id: 'send-function',
      title: 'Sending Assets',
      content: 'Easily send cryptocurrencies to any address. Each transaction is protected by quantum-resistant encryption.',
      position: 'bottom',
      element: '.send-assets-button',
      icon: <ArrowUpRight className="h-5 w-5 text-primary" />,
      aiPrompt: `Explain the process of sending assets from this wallet to a ${userSkillLevel} user. Include security considerations and verification steps that protect their assets.`
    },
    {
      id: 'receive-function',
      title: 'Receiving Assets',
      content: 'Share your wallet address or QR code to receive funds from others securely.',
      position: 'bottom',
      element: '.receive-assets-button',
      icon: <ArrowDownLeft className="h-5 w-5 text-primary" />,
      aiPrompt: `Explain how to receive assets in this wallet to a ${userSkillLevel} user. Mention the address formats, QR code functionality, and any security aspects they should be aware of.`
    },
    {
      id: 'transaction-history',
      title: 'Transaction History',
      content: 'View your complete transaction history with detailed information about each transfer.',
      position: 'left',
      element: '.transaction-history',
      icon: <History className="h-5 w-5 text-primary" />,
      aiPrompt: `Explain the transaction history section to a ${userSkillLevel} user. Describe what information is shown and how they can use it to track and verify their transactions.`
    },
    {
      id: 'security-features',
      title: 'Advanced Security Features',
      content: 'Your wallet includes multi-factor authentication, real-time threat monitoring, and quantum-resistant key storage.',
      position: 'top',
      element: '.wallet-security',
      icon: <Lock className="h-5 w-5 text-primary" />,
      aiPrompt: `Explain advanced security features of this wallet to a ${userSkillLevel} user. Include multi-factor authentication, threat monitoring, and key storage concepts.`
    },
    {
      id: 'complete',
      title: 'Tour Complete!',
      content: 'You now understand the basics of your quantum wallet. Feel free to ask me any questions – I\'m here to help!',
      position: 'top',
      element: '.wallet-overview',
      icon: <RefreshCw className="h-5 w-5 text-primary" />,
      aiPrompt: 'Create a friendly conclusion to the wallet tour. Encourage the user to ask questions if they have any, and suggest 2-3 specific features they might want to explore next.',
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

  // Fetch AI guidance when the step changes
  useEffect(() => {
    const fetchAIGuidance = async () => {
      if (!currentStep.aiPrompt || aiResponses[currentStep.id]) {
        return;
      }

      setIsAiLoading(true);
      try {
        // Create context object for AI request
        const context = {
          screenContext: currentStep.id,
          userSkillLevel
        };

        // Add wallet data if available
        if (walletData) {
          Object.assign(context, { walletContext: walletData });
        }

        // Request AI guidance
        const response = await AIGuidanceService.getOnboardingGuidance(
          currentStep.aiPrompt,
          [],
          context
        );

        // Update response and suggested actions
        setAiResponses(prev => ({
          ...prev,
          [currentStep.id]: response.content
        }));

        if (response.suggestedActions && response.suggestedActions.length > 0) {
          setAiSuggestions(response.suggestedActions);
        } else {
          setAiSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching AI guidance:', error);
        // Set a fallback response
        setAiResponses(prev => ({
          ...prev,
          [currentStep.id]: "I can explain more about this feature if you have questions."
        }));
      } finally {
        setIsAiLoading(false);
      }
    };

    fetchAIGuidance();
  }, [currentStep, userSkillLevel, walletData, aiResponses]);

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
    // This would trigger the AI assistant interface
    console.log('Ask a question about wallet features');
    
    // For demo purposes, we'll just finish the tour
    // In a real implementation, this would open an AI chat interface
    finishTour();
  }, [finishTour]);

  const handleAiSuggestion = useCallback((action: string, data?: any) => {
    console.log(`AI suggestion action: ${action}`, data);
    
    // Handle different action types
    switch (action) {
      case 'NAVIGATE':
        // In a real app, this would navigate to a specific screen
        if (data?.screen) {
          console.log(`Navigate to: ${data.screen}`);
        }
        break;
      case 'SHOW_FEATURE':
        // This would highlight a specific feature
        if (data?.feature) {
          console.log(`Highlight feature: ${data.feature}`);
        }
        break;
      default:
        console.log('Unknown action type');
    }
    
    // After handling the suggestion, proceed to next step
    goToNextStep();
  }, [goToNextStep]);

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

  // Get the content to display - either AI response or default
  const displayContent = aiResponses[currentStep.id] || currentStep.content;

  return (
    <>
      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 bg-black/60 z-50" onClick={handleSkip} />
      
      {/* Tour tooltip */}
      <Card 
        id="wallet-tour-tooltip" 
        className="fixed z-50 w-96 shadow-lg transition-opacity duration-300 opacity-100"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            {currentStep.icon}
            <span className="ml-2">{currentStep.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAiLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-4/5"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">
                {displayContent}
              </p>
              
              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-primary">Suggested Actions:</p>
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.map((suggestion, idx) => (
                      <Button 
                        key={idx} 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={() => handleAiSuggestion(suggestion.actionType, suggestion.actionData)}
                      >
                        {suggestion.actionText}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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

export default AIGuidedTour;
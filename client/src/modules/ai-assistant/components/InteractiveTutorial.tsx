import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '../contexts/AIContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Volume2, 
  VolumeX,
  PlayCircle,
  PauseCircle,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Define tutorial step types for different interaction patterns
type TutorialStep = 
  | { type: 'message', element: string, instruction: string }
  | { type: 'click', element: string, instruction: string }
  | { type: 'select', options: string[], instruction: string }
  | { type: 'radio', options: string[], instruction: string }
  | { type: 'checkbox', elements: string[], instruction: string }
  | { type: 'drag', elements: string[], targets: string[], instruction: string }
  | { type: 'slider', min: number, max: number, step: number, defaultValue: number, instruction: string }
  | { type: 'form', fields: Array<{id: string, label: string, type: string, placeholder?: string}>, instruction: string }
  | { type: 'input', id: string, placeholder: string, instruction: string }
  | { type: 'observe', id: string, instruction: string, duration: number }
  | { type: 'ai-message', instruction: string, characterName: string, message: string };

// Define the complete tutorial structure
const tutorialSections = [
  {
    id: 'welcome',
    title: 'Welcome to Aetherion',
    description: 'Let\'s explore the revolutionary quantum-resistant blockchain platform',
    steps: [
      {
        type: 'message',
        element: 'welcome-intro',
        instruction: 'Welcome to Aetherion! This tutorial will guide you through our quantum-resistant blockchain platform and wallet interface. Press Next to continue.'
      },
      {
        type: 'ai-message',
        instruction: 'Let me introduce myself. I\'m Mysterion, your AI assistant for all things Aetherion.',
        characterName: 'Mysterion',
        message: 'I\'m here to help you navigate this revolutionary Web3 platform. I can help with transactions, explain concepts, and guide you through our features.'
      },
      {
        type: 'message',
        element: 'tutorial-overview',
        instruction: 'This tutorial will cover the basics of using Aetherion, including wallet management, domain hosting, AI assistance, and the Fractal Reserve system.'
      }
    ]
  },
  {
    id: 'wallet-basics',
    title: 'Wallet Management',
    description: 'Learn how to manage your quantum-secured wallet',
    steps: [
      {
        type: 'message',
        element: 'wallet-intro',
        instruction: 'Your Aetherion wallet is secured by quantum-resistant cryptography. Let\'s learn how to use it.'
      },
      {
        type: 'click',
        element: '.wallet-section',
        instruction: 'Click on the wallet section to view your accounts'
      },
      {
        type: 'message',
        element: 'wallet-security',
        instruction: 'Notice the security indicators showing the quantum-resistance level of your wallet. All Aetherion wallets use post-quantum encryption algorithms.'
      }
    ]
  },
  {
    id: 'fractal-reserve',
    title: 'Recurve Fractal Reserve',
    description: 'Understanding the innovative Recurve Fractal Reserve mechanism',
    steps: [
      {
        type: 'message',
        element: 'fractal-intro',
        instruction: 'The Recurve Fractal Reserve is a revolutionary financial mechanism based on mathematical patterns found in nature.'
      },
      {
        type: 'observe',
        id: 'mandelbrot-visual',
        instruction: 'Watch how the Mandelbrot visualization represents the fractal nature of our reserve system.',
        duration: 5000
      },
      {
        type: 'message',
        element: 'fractal-benefits',
        instruction: 'This system ensures fair value distribution and prevents the early-adopter advantage common in traditional cryptocurrencies.'
      }
    ]
  },
  {
    id: 'domain-hosting',
    title: 'Domain Hosting',
    description: 'How to host websites on the decentralized .trust network',
    steps: [
      {
        type: 'message',
        element: 'domain-intro',
        instruction: 'Aetherion allows you to host websites on the decentralized .trust network, with integration to Filecoin for storage.'
      },
      {
        type: 'click',
        element: '.domain-hosting-tab',
        instruction: 'Click on the Domain Hosting tab to explore this feature'
      },
      {
        type: 'message',
        element: 'domain-wizard',
        instruction: 'The domain hosting wizard makes it easy to deploy websites with decentralized storage and hosting.'
      }
    ]
  },
  {
    id: 'ai-assistant',
    title: 'Mysterion AI Assistant',
    description: 'Working with your AI assistant and earning SING coins',
    steps: [
      {
        type: 'message',
        element: 'mysterion-intro',
        instruction: 'Mysterion is your AI assistant for navigating Aetherion. You can earn SING coins by helping train Mysterion.'
      },
      {
        type: 'click',
        element: '.chat-button',
        instruction: 'Click the chat button to start a conversation with Mysterion'
      },
      {
        type: 'input',
        id: 'chat-input',
        placeholder: 'Ask something about FractalCoin...',
        instruction: 'Try asking a question about FractalCoin to see how Mysterion responds'
      }
    ]
  },
  {
    id: 'conclusion',
    title: 'Ready to Begin',
    description: 'You\'re now ready to explore Aetherion',
    steps: [
      {
        type: 'message',
        element: 'conclusion-message',
        instruction: 'Congratulations! You have completed the Aetherion tutorial. You can now explore the platform on your own.'
      },
      {
        type: 'ai-message',
        instruction: 'Remember, I\'m always here to help if you have questions.',
        characterName: 'Mysterion',
        message: 'Don\'t hesitate to ask me for guidance as you explore Aetherion. You can also earn SING coins by helping train my responses through feedback.'
      },
      {
        type: 'message',
        element: 'final-step',
        instruction: 'Click Finish to complete the tutorial and start using Aetherion. You can always revisit this tutorial from the Help menu.'
      }
    ]
  }
];

interface InteractiveTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: string;
}

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ 
  isOpen,
  onClose,
  initialSection
}) => {
  const { enableTutorialMode, disableTutorialMode } = useAI();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(() => {
    // Try to use initialSection from props first (from API)
    if (initialSection) {
      const index = tutorialSections.findIndex(section => section.id === initialSection);
      return index >= 0 ? index : 0;
    }
    
    // Fallback: Try to load from localStorage if available
    try {
      const savedSection = localStorage.getItem('aetherion_tutorial_last_section');
      if (savedSection) {
        const index = tutorialSections.findIndex(section => section.id === savedSection);
        if (index >= 0) {
          return index;
        }
      }
    } catch (error) {
      console.error('Failed to load tutorial section from localStorage:', error);
    }
    
    // Default to the first section if no saved state is found
    return 0;
  });
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [stepCompleted, setStepCompleted] = useState(false);
  
  // Audio refs
  const nextSoundRef = useRef<HTMLAudioElement | null>(null);
  const completeSoundRef = useRef<HTMLAudioElement | null>(null);
  
  const currentSection = tutorialSections[currentSectionIndex];
  const currentStep = currentSection?.steps[currentStepIndex];
  const totalSections = tutorialSections.length;
  const totalStepsInCurrentSection = currentSection?.steps.length || 0;

  // Calculate overall progress
  useEffect(() => {
    const stepIndex = currentStepIndex + 1;
    const sectionIndex = currentSectionIndex;
    
    // Calculate how many steps we've gone through in all previous sections
    let previousSteps = 0;
    for (let i = 0; i < sectionIndex; i++) {
      previousSteps += tutorialSections[i].steps.length;
    }
    
    // Add the current steps
    const currentSteps = stepIndex;
    
    // Total steps across all sections
    let totalSteps = 0;
    tutorialSections.forEach(section => {
      totalSteps += section.steps.length;
    });
    
    // Calculate progress percentage
    const progressValue = ((previousSteps + currentSteps) / totalSteps) * 100;
    setProgress(progressValue);
  }, [currentSectionIndex, currentStepIndex]);

  // Enable tutorial mode when component mounts
  useEffect(() => {
    enableTutorialMode();
    
    // Set up audio elements
    nextSoundRef.current = new Audio('/sounds/next.mp3');
    completeSoundRef.current = new Audio('/sounds/complete.mp3');
    
    // Save tutorial progress to the server and localStorage as fallback
    const saveTutorialProgress = async () => {
      try {
        // Try to save to the server if authenticated
        await apiRequest(
          '/api/tutorial/status', 
          'POST', 
          {
            completed: false,
            lastSection: currentSection.id
          }
        );
      } catch (error) {
        console.error('Failed to save tutorial progress to server:', error);
        
        // Fallback: Save to localStorage if server save fails (e.g., not authenticated)
        try {
          localStorage.setItem('aetherion_tutorial_completed', 'false');
          localStorage.setItem('aetherion_tutorial_last_section', currentSection.id);
        } catch (localError) {
          console.error('Failed to save tutorial progress to localStorage:', localError);
        }
      }
    };
    
    saveTutorialProgress();
    
    return () => {
      disableTutorialMode();
    };
  }, [enableTutorialMode, disableTutorialMode, currentSection]);

  // Function to play sound based on action
  const playSound = (type: 'next' | 'complete') => {
    if (!soundEnabled) return;
    
    if (type === 'next' && nextSoundRef.current) {
      nextSoundRef.current.currentTime = 0;
      nextSoundRef.current.play().catch(err => console.error('Error playing sound:', err));
    } else if (type === 'complete' && completeSoundRef.current) {
      completeSoundRef.current.currentTime = 0;
      completeSoundRef.current.play().catch(err => console.error('Error playing sound:', err));
    }
  };

  // Move to the next step or section
  const nextStep = () => {
    // Play sound
    playSound('next');
    
    // Reset step completion status
    setStepCompleted(false);
    
    if (currentStepIndex < totalStepsInCurrentSection - 1) {
      // Move to next step in current section
      setCurrentStepIndex(currentStepIndex + 1);
    } else if (currentSectionIndex < totalSections - 1) {
      // Move to next section, reset step index
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentStepIndex(0);
      
      // Save tutorial progress to the server and localStorage as fallback
      const saveTutorialProgress = async () => {
        try {
          // Try to save to the server if authenticated
          await apiRequest(
            '/api/tutorial/status', 
            'POST', 
            {
              completed: false,
              lastSection: tutorialSections[currentSectionIndex + 1].id
            }
          );
        } catch (error) {
          console.error('Failed to save tutorial progress to server:', error);
          
          // Fallback: Save to localStorage if server save fails (e.g., not authenticated)
          try {
            localStorage.setItem('aetherion_tutorial_completed', 'false');
            localStorage.setItem('aetherion_tutorial_last_section', tutorialSections[currentSectionIndex + 1].id);
          } catch (localError) {
            console.error('Failed to save tutorial progress to localStorage:', localError);
          }
        }
      };
      
      saveTutorialProgress();
    } else {
      // Tutorial completed
      playSound('complete');
      
      // Save completed status to the server
      const saveTutorialCompletion = async () => {
        try {
          // Try to save to the server if authenticated
          await apiRequest(
            '/api/tutorial/status', 
            'POST', 
            {
              completed: true,
              lastSection: currentSection.id
            }
          );
        } catch (error) {
          console.error('Failed to save tutorial completion:', error);
          
          // Fallback: Save to localStorage if server save fails (e.g., not authenticated)
          try {
            localStorage.setItem('aetherion_tutorial_completed', 'true');
            localStorage.setItem('aetherion_tutorial_last_section', currentSection.id);
          } catch (localError) {
            console.error('Failed to save tutorial completion to localStorage:', localError);
          }
        }
      };
      
      saveTutorialCompletion();
      onClose();
    }
  };

  // Move to the previous step or section
  const prevStep = () => {
    // Play sound
    playSound('next');
    
    // Reset step completion status
    setStepCompleted(false);
    
    if (currentStepIndex > 0) {
      // Move to previous step in current section
      setCurrentStepIndex(currentStepIndex - 1);
    } else if (currentSectionIndex > 0) {
      // Move to previous section, set step index to last step of that section
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentStepIndex(tutorialSections[currentSectionIndex - 1].steps.length - 1);
    }
    // If we're already at the first step of the first section, do nothing
  };

  // Handle user skipping the tutorial
  const handleSkip = async () => {
    try {
      // Try to save to the server if authenticated
      await apiRequest(
        '/api/tutorial/status', 
        'POST', 
        {
          completed: false,
          lastSection: currentSection.id
        }
      );
      onClose();
    } catch (error) {
      console.error('Failed to save tutorial skip status:', error);
      
      // Fallback: Save to localStorage if server save fails (e.g., not authenticated)
      try {
        localStorage.setItem('aetherion_tutorial_completed', 'false');
        localStorage.setItem('aetherion_tutorial_last_section', currentSection.id);
      } catch (localError) {
        console.error('Failed to save tutorial skip status to localStorage:', localError);
      }
      
      onClose();
    }
  };

  // Auto-advance timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (autoAdvance && stepCompleted) {
      timer = setTimeout(() => {
        nextStep();
      }, 3000); // Auto advance after 3 seconds
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [autoAdvance, stepCompleted]);

  // Handle step completion based on step type
  const completeStep = useCallback(() => {
    setStepCompleted(true);
    
    // If auto-advance is enabled, the useEffect will handle moving to the next step
    if (!autoAdvance) {
      // Optional: Maybe add a visual indicator that the step is ready to advance
    }
  }, [autoAdvance]);

  // Render different types of interactive elements based on step type
  const renderStepContent = () => {
    if (!currentStep) return null;
    
    switch (currentStep.type) {
      case 'message':
        return (
          <div className="tutorial-message">
            <p>{currentStep.instruction}</p>
          </div>
        );
        
      case 'ai-message':
        return (
          <div className="tutorial-ai-message flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Sparkles className="text-primary-foreground w-4 h-4" />
              </div>
              <span className="font-bold">{currentStep.characterName}</span>
            </div>
            <p className="pl-10">{currentStep.message}</p>
            <p className="text-sm text-muted-foreground mt-2">{currentStep.instruction}</p>
          </div>
        );
        
      case 'click':
        return (
          <div className="tutorial-click">
            <p>{currentStep.instruction}</p>
            <div className="mt-4">
              <Button 
                onClick={completeStep}
                className="simulate-click-btn"
              >
                Simulate Click
              </Button>
            </div>
          </div>
        );
        
      case 'select':
        return (
          <div className="tutorial-select">
            <p>{currentStep.instruction}</p>
            <div className="mt-4 space-y-2">
              {currentStep.options.map((option, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  className="w-full justify-start text-left"
                  onClick={() => completeStep()}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );
        
      case 'radio':
        return (
          <div className="tutorial-radio">
            <p>{currentStep.instruction}</p>
            <RadioGroup className="mt-4 space-y-2" onValueChange={() => completeStep()}>
              {currentStep.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="tutorial-checkbox">
            <p>{currentStep.instruction}</p>
            <div className="mt-4 space-y-2">
              {currentStep.elements.map((element, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox id={`checkbox-${index}`} onCheckedChange={() => completeStep()} />
                  <label
                    htmlFor={`checkbox-${index}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {element}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'slider':
        return (
          <div className="tutorial-slider">
            <p>{currentStep.instruction}</p>
            <div className="mt-6">
              <Slider
                defaultValue={[currentStep.defaultValue]}
                max={currentStep.max}
                min={currentStep.min}
                step={currentStep.step}
                onValueChange={() => completeStep()}
              />
            </div>
          </div>
        );
        
      case 'form':
        return (
          <div className="tutorial-form">
            <p>{currentStep.instruction}</p>
            <div className="mt-4 space-y-4">
              {currentStep.fields.map((field, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <Input 
                    id={field.id} 
                    type={field.type} 
                    placeholder={field.placeholder}
                    onChange={() => completeStep()} 
                  />
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'input':
        return (
          <div className="tutorial-input">
            <p>{currentStep.instruction}</p>
            <div className="mt-4">
              <Input 
                id={currentStep.id} 
                placeholder={currentStep.placeholder}
                onChange={() => completeStep()} 
              />
            </div>
          </div>
        );
        
      case 'observe':
        // Auto-complete after duration
        useEffect(() => {
          const timer = setTimeout(() => {
            completeStep();
          }, currentStep.duration);
          
          return () => clearTimeout(timer);
        }, [currentStep]);
        
        return (
          <div className="tutorial-observe">
            <p>{currentStep.instruction}</p>
            <div className="mt-4 flex justify-center">
              <div className="relative w-12 h-12">
                <motion.div
                  className="absolute inset-0 border-4 rounded-full"
                  initial={{ borderColor: "rgba(255, 255, 255, 0.2)" }}
                  animate={{
                    borderColor: ["rgba(255, 255, 255, 0.2)", "rgba(99, 102, 241, 1)", "rgba(255, 255, 255, 0.2)"],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                  }}
                />
                <motion.div
                  className="absolute inset-2 bg-primary rounded-full opacity-50"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                  }}
                />
              </div>
            </div>
          </div>
        );
        
      default:
        return <p>Unknown step type</p>;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-3xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="relative pb-2">
              <div className="absolute right-4 top-4 flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setAutoAdvance(!autoAdvance)}
                >
                  {autoAdvance ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleSkip}
                >
                  <X size={18} />
                </Button>
              </div>
              
              <CardTitle className="text-xl">
                {currentSection?.title}
              </CardTitle>
              <p className="text-muted-foreground">{currentSection?.description}</p>
              
              <div className="mt-4 flex items-center">
                <p className="text-sm mr-2">Progress:</p>
                <Progress value={progress} className="flex-1" />
                <p className="text-sm ml-2">{Math.round(progress)}%</p>
              </div>
              
              <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                <span>Section {currentSectionIndex + 1} of {totalSections}</span>
                <span>Step {currentStepIndex + 1} of {totalStepsInCurrentSection}</span>
              </div>
            </CardHeader>
            
            <CardContent className="pt-4 pb-6 min-h-[200px]">
              {renderStepContent()}
            </CardContent>
            
            <CardFooter className="flex justify-between border-t p-4">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentSectionIndex === 0 && currentStepIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  onClick={handleSkip}
                >
                  Skip Tutorial
                </Button>
                
                <Button 
                  onClick={nextStep}
                  disabled={!stepCompleted && currentStep?.type !== 'message' && currentStep?.type !== 'ai-message'}
                >
                  {currentSectionIndex === totalSections - 1 && currentStepIndex === totalStepsInCurrentSection - 1
                    ? "Finish"
                    : "Next"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InteractiveTutorial;
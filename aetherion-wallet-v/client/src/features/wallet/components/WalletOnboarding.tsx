import { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Sparkles, BookOpen } from 'lucide-react';
import useLocalStorage from '../../../hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';

// Lazy load the tour components for better performance
const WalletTour = lazy(() => import('./WalletTour'));
const AIGuidedTour = lazy(() => import('./AIGuidedTour'));

// Loading spinner component for Suspense fallback
const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
    <div className="flex flex-col items-center">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <p className="mt-4 text-lg font-medium text-primary">Loading tour...</p>
    </div>
  </div>
);

type OnboardingMode = 'tour' | 'ai-guided' | 'skip';

interface WalletOnboardingProps {
  userData?: {
    id: string;
    name: string;
    email: string;
    skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  };
  walletData?: {
    walletBalances: Record<string, number>;
    recentTransactions: any[];
    userPreferences: Record<string, any>;
  };
  onComplete: () => void;
}

const WalletOnboarding = ({ userData, walletData, onComplete }: WalletOnboardingProps) => {
  const [onboardingMode, setOnboardingMode] = useState<OnboardingMode | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [welcomeDismissed, setWelcomeDismissed] = useLocalStorage('aetherion-welcome-dismissed', false);
  const { toast } = useToast();
  
  // Check if user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // In a real app, this would check user preferences from API/database
      const hasOnboarded = localStorage.getItem('aetherion-completed-onboarding') === 'true';
      
      if (hasOnboarded) {
        setHasCompletedOnboarding(true);
      }
    };
    
    checkOnboardingStatus();
  }, []);
  
  const handleOnboardingComplete = () => {
    // Save onboarding completion status
    localStorage.setItem('aetherion-completed-onboarding', 'true');
    setHasCompletedOnboarding(true);
    
    // Show success toast
    toast({
      title: "Onboarding Complete",
      description: "You're all set to use your quantum-resistant wallet!",
      duration: 5000,
    });
    
    // Notify parent component
    onComplete();
  };
  
  const handleTourSkip = () => {
    setOnboardingMode(null);
    setWelcomeDismissed(true);
    
    // Show brief toast
    toast({
      title: "Tour Skipped",
      description: "You can always access the tour from the help menu later.",
      duration: 3000,
    });
    
    // Notify parent component
    onComplete();
  };
  
  const startTour = (mode: OnboardingMode) => {
    setOnboardingMode(mode);
  };
  
  // If user has already completed onboarding, skip the welcome screen
  if (hasCompletedOnboarding) {
    return null;
  }
  
  // Show tour based on selected mode
  if (onboardingMode === 'tour') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <WalletTour onComplete={handleOnboardingComplete} onSkip={handleTourSkip} />
      </Suspense>
    );
  }
  
  if (onboardingMode === 'ai-guided') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AIGuidedTour 
          onComplete={handleOnboardingComplete} 
          onSkip={handleTourSkip}
          userSkillLevel={userData?.skillLevel || 'beginner'}
          walletData={walletData}
        />
      </Suspense>
    );
  }
  
  // Skip onboarding if user chose to
  if (onboardingMode === 'skip') {
    handleTourSkip();
    return null;
  }
  
  // If welcome screen was previously dismissed, don't show anything
  if (welcomeDismissed) {
    return null;
  }
  
  // Default: show welcome screen with options
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Welcome to Aetherion</CardTitle>
          <CardDescription>
            Your quantum-resistant blockchain wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Would you like to take a quick tour of your new wallet? You can choose from the following options:
          </p>
          
          <div className="grid gap-3">
            <Button 
              variant="outline" 
              className="justify-start h-auto py-4 px-4"
              onClick={() => startTour('ai-guided')}
            >
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <BrainCircuit className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">AI-Guided Tour</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Let our AI assistant guide you through wallet features with personalized explanations.
                  </p>
                </div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-auto py-4 px-4"
              onClick={() => startTour('tour')}
            >
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Standard Tour</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Take a quick tour highlighting the key features of your quantum wallet.
                  </p>
                </div>
              </div>
            </Button>
            
            <Button 
              variant="ghost" 
              className="justify-start h-auto py-4 px-4"
              onClick={() => startTour('skip')}
            >
              <div className="flex items-start">
                <div className="bg-muted p-2 rounded-full mr-3">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Explore on My Own</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Skip the tour and start using your wallet right away.
                  </p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            You can always access the wallet tour later from the help menu.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WalletOnboarding;
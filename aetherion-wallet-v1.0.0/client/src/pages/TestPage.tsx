import React from 'react';
import TestMode from '../components/testing/TestMode';
import { Button } from '@/components/ui/button';
import { useLiveMode } from '../contexts/LiveModeContext';
import { useToast } from '@/hooks/use-toast';
import { Zap, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

const TestPage: React.FC = () => {
  const { isLiveMode, toggleLiveMode } = useLiveMode();
  const { toast } = useToast();

  const handleSwitchToLiveMode = () => {
    if (!isLiveMode) {
      toggleLiveMode();
      toast({
        title: "Switching to Live Mode",
        description: "Live Mode activated for real blockchain connections"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-4">
        <div className="flex items-center justify-between mb-6">
          <Link href="/wallet" className="text-primary hover:underline flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Wallet Management
          </Link>
          
          <Button 
            variant="default" 
            size="sm" 
            className="gap-2"
            onClick={handleSwitchToLiveMode}
          >
            <Zap className="h-4 w-4" />
            Switch to Live Mode
          </Button>
        </div>
      </div>
      <TestMode />
    </div>
  );
};

export default TestPage;
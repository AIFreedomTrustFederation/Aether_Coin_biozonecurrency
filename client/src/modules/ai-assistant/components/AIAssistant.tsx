import React, { useState } from 'react';
import { AIProvider } from '../contexts/AIContext';
import ChatInterface from './ChatInterface';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, X } from 'lucide-react';

// Using a local interface instead of importing from types to avoid TypeScript errors
interface AIAssistantProps {
  userId: number;
  className?: string;
}

/**
 * AIAssistant component that provides the Mysterion AI experience
 * It can be minimized to a floating button and expanded to a chat window
 */
export function AIAssistant({ userId, className = '' }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <AIProvider userId={userId}>
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        {isOpen ? (
          <Card className="shadow-lg border rounded-lg overflow-hidden w-80 md:w-96 h-[500px] flex flex-col">
            <ChatInterface />
            <Button 
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2" 
              onClick={toggleOpen}
              aria-label="Close assistant"
            >
              <X size={18} />
            </Button>
          </Card>
        ) : (
          <Button 
            onClick={toggleOpen} 
            className="rounded-full h-14 w-14 shadow-lg"
            aria-label="Open AI assistant"
          >
            <MessageSquare size={24} />
          </Button>
        )}
      </div>
    </AIProvider>
  );
}

export default AIAssistant;
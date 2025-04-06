import React, { useState, useRef, useEffect } from 'react';
import { AIProvider } from '../contexts/AIContext';
import ChatInterface from './ChatInterface';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, Minus, Move, Settings } from 'lucide-react';

// Using a local interface instead of importing from types to avoid TypeScript errors
interface AIAssistantProps {
  userId: number;
  className?: string;
}

/**
 * AIAssistant component that provides the Mysterion AI experience
 * It can be minimized to a floating button and expanded to a chat window
 * Now includes draggable functionality and can be closed completely
 */
export function AIAssistant({ userId, className = '' }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);
  
  // Initialize position to bottom-right corner
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({
        x: window.innerWidth - 80,
        y: window.innerHeight - 80
      });
    }
  }, []);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };
  
  const closeAssistant = () => {
    setIsVisible(false);
  };
  
  const minimizeAssistant = () => {
    setIsOpen(false);
  };
  
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragRef.current) {
      const rect = dragRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };
  
  const handleDragMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 60));
      const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 60));
      
      setPosition({ x: newX, y: newY });
    }
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  // Add and remove event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging]);
  
  if (!isVisible) return null;
  
  return (
    <AIProvider userId={userId}>
      <div 
        ref={dragRef}
        className={`fixed z-50 ${className}`} 
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          transition: isDragging ? 'none' : 'all 0.2s ease'
        }}
      >
        {isOpen ? (
          <Card className="shadow-lg border rounded-lg overflow-hidden w-80 md:w-96 h-[500px] flex flex-col relative">
            {/* Chat header with drag handle and controls */}
            <div 
              className="p-2 border-b bg-primary/10 flex justify-between items-center cursor-move"
              onMouseDown={handleDragStart}
            >
              <div className="flex items-center">
                <Move size={16} className="mr-2 text-muted-foreground" />
                <span className="font-medium">Mysterion AI</span>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-6 w-6"
                  onClick={minimizeAssistant}
                  aria-label="Minimize assistant"
                >
                  <Minus size={14} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-6 w-6"
                  onClick={closeAssistant}
                  aria-label="Close assistant"
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
            
            {/* Chat interface */}
            <div className="flex-1 overflow-hidden">
              <ChatInterface />
            </div>
          </Card>
        ) : (
          <div className="relative group">
            <Button 
              onClick={toggleOpen} 
              className="rounded-full h-14 w-14 shadow-lg cursor-move"
              onMouseDown={handleDragStart}
              aria-label="Open AI assistant"
            >
              <MessageSquare size={24} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="h-6 w-6 absolute -top-2 -right-2 bg-background border rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={closeAssistant}
              aria-label="Close assistant completely"
            >
              <X size={14} />
            </Button>
          </div>
        )}
      </div>
    </AIProvider>
  );
}

export default AIAssistant;
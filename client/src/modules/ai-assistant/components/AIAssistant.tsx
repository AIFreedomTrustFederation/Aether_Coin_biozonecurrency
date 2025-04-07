import React, { useState, useRef, useEffect, useContext } from 'react';
import { AIProvider } from '../contexts/AIContext';
import ChatInterface from './ChatInterface';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, Minus, Move, Settings } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Using a local interface instead of importing from types to avoid TypeScript errors
interface AIAssistantProps {
  userId: number;
  className?: string;
}

// Mock data for initial messages
const initialMessages = [
  {
    id: uuidv4(),
    role: 'assistant' as const,
    content: "Hello! I'm Mysterion, your AI assistant. How can I help you today?",
    timestamp: new Date()
  }
];

// Touch position interface
interface TouchPosition {
  x: number;
  y: number;
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
  
  // Initialize position to bottom-right corner, adjusted for mobile devices
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobileView = window.innerWidth < 768;
      
      // Adjust position based on device type
      setPosition({
        x: window.innerWidth - 80,
        y: isMobileView ? window.innerHeight - 160 : window.innerHeight - 80 // Higher position on mobile to avoid bottom nav
      });
      
      // Update position on resize
      const handleResize = () => {
        const isMobile = window.innerWidth < 768;
        setPosition({
          x: window.innerWidth - 80,
          y: isMobile ? window.innerHeight - 160 : window.innerHeight - 80
        });
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
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
  
  // Mouse drag handlers
  const handleDragStart = (e: React.MouseEvent) => {
    if (dragRef.current) {
      e.preventDefault();
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
  
  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (dragRef.current && e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = dragRef.current.getBoundingClientRect();
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
      setIsDragging(true);
    }
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches.length > 0) {
      // Use passive: false to allow preventDefault
      if (e.cancelable) {
        e.preventDefault(); // Prevent scrolling while dragging
      }
      
      const touch = e.touches[0];
      // Calculate boundaries to ensure the button stays on screen with a slight margin
      const margin = 20;
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 80;
      
      const newX = Math.max(margin, Math.min(touch.clientX - dragOffset.x, maxX));
      const newY = Math.max(margin, Math.min(touch.clientY - dragOffset.y, maxY));
      
      setPosition({ x: newX, y: newY });
    }
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
  };
  
  // Add and remove event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      // Mouse events
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      
      // Touch events
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('touchcancel', handleTouchEnd);
    }
    
    return () => {
      // Clean up mouse events
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      
      // Clean up touch events
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
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
              onTouchStart={handleTouchStart}
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
              <ChatInterface 
                messages={initialMessages}
                onSendMessage={(message) => {
                  console.log("Message sent:", message);
                  // In a real implementation, this would be handled by the AIContext
                }}
                isProcessing={false}
                placeholder="Ask Mysterion anything..."
              />
            </div>
          </Card>
        ) : (
          <div className="relative group">
            <Button 
              onClick={(e) => {
                // Only toggle if it's a tap/click, not a drag start
                if (!isDragging) {
                  toggleOpen();
                }
              }} 
              className="rounded-full h-16 w-16 shadow-xl cursor-move bg-primary text-primary-foreground
                hover:opacity-90 active:scale-95 transition-all"
              onMouseDown={handleDragStart}
              onTouchStart={handleTouchStart}
              style={{ touchAction: 'none' }} // Prevent browser handling for better touch control
              aria-label="Open AI assistant"
            >
              <MessageSquare size={28} />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              className="h-7 w-7 absolute -top-2 -right-2 bg-background border rounded-full opacity-100 shadow-md"
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
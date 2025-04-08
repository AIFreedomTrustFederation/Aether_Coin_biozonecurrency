import React, { useState, useRef, useEffect, useContext } from 'react';
import { AIProvider, useAI } from '../contexts/AIContext';
import ChatInterface from './ChatInterface';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, Minus, Move, Settings, Send } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from './ChatInterface'; // Import the Message type
import styles from './AIAssistant.module.css';

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
 * Enhanced AIContent component that implements a simple but reliable chat
 * This avoids relying on complex external contexts that may have type issues
 */
const AIContent = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      role: 'assistant',
      content: "Hello! I'm Mysterion, your AI assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle sending a message - optimized for mobile
  const handleSendMessage = (content: string) => {
    if (!content.trim() || isProcessing) return;
    
    // Add user message to chat
    const newMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setIsProcessing(true);
    
    // Simulate AI response with delay
    setTimeout(() => {
      // Generate basic responses based on message content
      let responseText = "";
      const lowerContent = content.toLowerCase();
      
      if (lowerContent.includes("hello") || lowerContent.includes("hi")) {
        responseText = "Hello! I'm Mysterion, your AI assistant for the Aetherion platform. I can help with questions about quantum security, blockchain features, and much more. How can I assist you today?";
      } else if (lowerContent.includes("help") || lowerContent.includes("what can you do")) {
        responseText = "I can help with various topics related to Aetherion, including quantum security features, wallet management, Singularity Coin details, and transaction verification. What would you like to know more about?";
      } else if (lowerContent.includes("thanks") || lowerContent.includes("thank you")) {
        responseText = "You're welcome! I'm here to assist with any other questions you might have about Aetherion's features and capabilities.";
      } else {
        responseText = "I'm here to help with any blockchain-related questions, security concerns, or general assistance you might need. Feel free to ask about specific features of the Aetherion platform or how to use any of its components.";
      }
      
      // Add AI response
      const aiResponse: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsProcessing(false);
      
      // Focus input field again for mobile
      if (inputRef.current && /Mobi|Android/i.test(navigator.userAgent)) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }, 1000);
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-muted mr-auto'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{message.content}</div>
                <div 
                  className={`text-xs mt-1 ${
                    message.role === 'user' 
                      ? 'text-primary-foreground/70 text-right' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 max-w-[80%] p-3 rounded-lg bg-muted mr-auto">
                <div className="flex space-x-1">
                  <div className={`w-2 h-2 bg-primary/70 rounded-full animate-bounce ${styles.typingDot1}`}></div>
                  <div className={`w-2 h-2 bg-primary/70 rounded-full animate-bounce ${styles.typingDot2}`}></div>
                  <div className={`w-2 h-2 bg-primary/70 rounded-full animate-bounce ${styles.typingDot3}`}></div>
                </div>
                <div className="text-sm text-muted-foreground">Thinking...</div>
              </div>
            </div>
          )}
          
          <div ref={endOfMessagesRef} />
        </div>
      </div>
      
      {/* Input area - optimized for mobile */}
      <div className="p-3 border-t flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask Mysterion anything..."
          disabled={isProcessing}
          className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(inputValue);
              setInputValue('');
            }
          }}
        />
        <button
          type="button"
          disabled={!inputValue.trim() || isProcessing}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10"
          onClick={() => {
            handleSendMessage(inputValue);
            setInputValue('');
          }}
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

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
  
  // State to track if the keyboard is visible
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  
  // Initialize position to bottom-right corner, adjusted for mobile devices
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobileView = window.innerWidth < 768;
      
      // Store original window height for keyboard detection
      setOriginalHeight(window.innerHeight);
      setWindowHeight(window.innerHeight);
      
      // Adjust position based on device type
      setPosition({
        // For mobile devices, position on the left side of the screen
        x: isMobileView ? 20 : window.innerWidth - 80,
        y: isMobileView ? window.innerHeight - 160 : window.innerHeight - 80 // Higher position on mobile to avoid bottom nav
      });
      
      // Update position on resize and detect keyboard visibility
      const handleResize = () => {
        const isMobile = window.innerWidth < 768;
        const currentHeight = window.innerHeight;
        
        // Store current window height
        setWindowHeight(currentHeight);
        
        // If the height significantly decreased, assume keyboard opened
        // Usually keyboard takes up about 30-40% of the screen
        const heightDifference = originalHeight - currentHeight;
        const heightRatio = heightDifference / originalHeight;
        const keyboardVisible = heightRatio > 0.2; // 20% or more height reduction
        
        setIsKeyboardVisible(keyboardVisible);
        
        // When keyboard is shown, move the chat window up
        // Calculate new Y position to keep the chat in view above keyboard
        let newY = isMobile ? window.innerHeight - 160 : window.innerHeight - 80;
        
        if (keyboardVisible && isOpen) {
          // Position the chat window near the top of the screen when keyboard is open
          newY = isMobile ? 10 : 50; // Move it to the very top when keyboard is open
        }
        
        setPosition({
          // Keep on left side for mobile devices
          x: isMobile ? 20 : window.innerWidth - 80,
          y: newY
        });
      };
      
      // Different browsers / devices have different events for keyboard
      window.addEventListener('resize', handleResize);
      
      // For iOS devices
      const handleFocusIn = () => {
        const activeElement = document.activeElement;
        if (activeElement && 
            (activeElement.tagName === 'INPUT' || 
             activeElement.tagName === 'TEXTAREA')) {
          setIsKeyboardVisible(true);
          
          // Move the chat window to the top when keyboard opens
          const isMobile = window.innerWidth < 768;
          setPosition({
            // Keep on left side for mobile devices
            x: isMobile ? 20 : window.innerWidth - 80,
            y: isMobile ? 10 : 50
          });
        }
      };
      
      // For when keyboard closes
      const handleFocusOut = () => {
        const activeElement = document.activeElement;
        if (activeElement && 
            activeElement.tagName !== 'INPUT' && 
            activeElement.tagName !== 'TEXTAREA') {
          setIsKeyboardVisible(false);
          
          // Restore normal position
          const isMobile = window.innerWidth < 768;
          setPosition({
            // Keep on left side for mobile devices
            x: isMobile ? 20 : window.innerWidth - 80,
            y: isMobile ? window.innerHeight - 160 : window.innerHeight - 80
          });
        }
      };
      
      document.addEventListener('focusin', handleFocusIn);
      document.addEventListener('focusout', handleFocusOut);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('focusin', handleFocusIn);
        document.removeEventListener('focusout', handleFocusOut);
      };
    }
  }, [isOpen, originalHeight]);

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
  
  // Touch drag handlers with improved differentiation between drag and tap
  const handleTouchStart = (e: React.TouchEvent) => {
    // Skip handling if touch starts on chat interface elements
    if (e.target instanceof HTMLElement) {
      const target = e.target as HTMLElement;
      // Don't initiate drag if clicking on input field, button, or chat content
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'BUTTON' || 
        target.closest('form') || 
        target.closest('.chat-messages') ||
        target.closest('button')
      ) {
        return;
      }
    }
    
    if (dragRef.current && e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = dragRef.current.getBoundingClientRect();
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
      
      // Use a small delay before confirming drag to differentiate from taps
      setTimeout(() => {
        setIsDragging(true);
      }, 100);
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
  
  // Enhanced touch end handler with better handling for mobile devices
  const handleTouchEnd = (e: TouchEvent) => {
    // If it was a short touch (potential tap), reset isDragging immediately
    // to ensure the click handler fires correctly
    setIsDragging(false);
    
    // For mobile devices, manage focus on form inputs when chat is opened
    if (isOpen) {
      // Small delay to let the browser process the touch end
      setTimeout(() => {
        // Focus the chat input if it exists
        const chatInput = document.querySelector('.chat-input') || 
                          document.querySelector('input[type="text"]');
        if (chatInput instanceof HTMLInputElement) {
          chatInput.focus();
        }
      }, 100);
    }
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
        className={`${styles.aiAssistantContainer} ${className} ${isDragging ? styles.dragging : ''}`} 
        data-position-x={position.x}
        data-position-y={position.y}
      >
        {isOpen ? (
          <Card 
            className={`shadow-lg border rounded-lg overflow-hidden w-[90vw] md:w-96 flex flex-col relative ${
              isKeyboardVisible ? 'h-[80vh]' : 'h-[500px]'
            }`}
          >
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
            
            {/* Chat interface - Now connected to AIContext */}
            <div 
              className="flex-1 overflow-hidden" 
              onClick={(e) => e.stopPropagation()} // Prevent chat area clicks from triggering drag
            >
              <AIContent />
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
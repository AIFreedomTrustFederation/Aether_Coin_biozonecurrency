import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Import mobile optimization styles
import './chatInterface.css';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isProcessing?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
}

const ChatInterface = ({
  messages,
  onSendMessage,
  isProcessing = false,
  autoFocus = true,
  placeholder = "Type a message...",
  className = "",
}: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Focus input on mount if autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  // Enhanced message sending function with mobile optimization
  const sendMessage = () => {
    if (inputValue.trim() && !isProcessing) {
      // Get the current input value before it might be cleared by React's state update
      const messageToSend = inputValue.trim();
      
      // Clear input immediately for better mobile UX
      setInputValue('');
      
      // Send the message using the cached value
      onSendMessage(messageToSend);
      
      // Focus back to the input after sending
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
      
      return true;
    }
    return false;
  };
  
  // Special handler for mobile touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent default only for the send button to avoid any conflicts
    if ((e.target as HTMLElement).closest('button')) {
      e.preventDefault();
    }
  };
  
  // Legacy form handler (no longer used but kept for backward compatibility)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };
  
  return (
    <div className={cn("flex flex-col h-full border rounded-md overflow-hidden", className)}>
      {/* Messages area */}
      <ScrollArea className="flex-1 chat-messages p-4">
        <div className="space-y-4">
          {messages && messages.length > 0 ? (
            messages.map((message: Message) => (
              <div 
                key={message.id}
                className={cn(
                  "flex flex-col max-w-[80%] rounded-lg p-3 ",
                  message.role === 'user' 
                    ? "ml-auto bg-primary text-primary-foreground" 
                    : message.role === 'assistant'
                      ? "mr-auto bg-muted" 
                      : "mx-auto bg-secondary/50 text-secondary-foreground text-sm italic"
                )}
              >
                <div className="whitespace-pre-wrap break-words">{message.content}</div>
                <div 
                  className={cn(
                    "text-xs mt-1", 
                    message.role === 'user' 
                      ? "text-primary-foreground/70 text-right" 
                      : "text-muted-foreground"
                  )}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">No messages yet</div>
          )}
          
          {isProcessing && (
            <div className="flex items-center mr-auto bg-muted rounded-lg p-3 space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
              <div className="text-sm text-muted-foreground">Thinking...</div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
      </ScrollArea>
      
      {/* Input area - enhanced for mobile compatibility */}
      <div className="border-t p-3 flex gap-2" onTouchStart={handleTouchStart}>
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          disabled={isProcessing}
          className="flex-1 chat-input"
          onKeyDown={(e) => {
            // Handle Enter key for submission (mobile and desktop)
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          // Capture onBlur event to help with mobile keyboard issues
          onBlur={(e) => {
            // Prevent input from losing focus on mobile when the keyboard appears
            if (/Mobi|Android/i.test(navigator.userAgent)) {
              setTimeout(() => {
                e.target.focus();
              }, 10);
            }
          }}
        />
        <Button 
          type="button" 
          size="icon"
          disabled={!inputValue.trim() || isProcessing}
          onClick={() => {
            // Use the unified sendMessage function
            sendMessage();
          }}
          // Add extra mobile-specific events
          onTouchEnd={(e) => {
            e.preventDefault();
            if (!isProcessing && inputValue.trim()) {
              sendMessage();
            }
          }}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export { ChatInterface };
export default ChatInterface;
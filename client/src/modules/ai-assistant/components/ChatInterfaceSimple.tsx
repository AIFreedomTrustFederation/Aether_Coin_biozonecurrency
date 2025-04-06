import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isProcessing) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };
  
  return (
    <div className={cn("flex flex-col h-full border rounded-md overflow-hidden", className)}>
      {/* Messages area */}
      <ScrollArea className="flex-1 chat-messages p-4">
        <div className="space-y-4">
          {messages.map((message) => (
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
          ))}
          
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
      
      {/* Input area */}
      <form onSubmit={handleSubmit} className="border-t p-3 flex gap-2">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          disabled={isProcessing}
          className="flex-1"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!inputValue.trim() || isProcessing}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInterface;
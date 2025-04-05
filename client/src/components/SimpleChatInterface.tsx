import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface SimpleChatInterfaceProps {
  messages: {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }[];
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
}

const SimpleChatInterface: React.FC<SimpleChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isProcessing, 
  autoFocus = false,
  placeholder = "Type a message...", 
  className = "" 
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isProcessing) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto mb-4 space-y-4 h-[300px] max-h-[300px] p-2"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}
      >
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`${
              message.role === 'user' 
                ? 'ml-auto bg-blue-600 text-white' 
                : 'mr-auto bg-white/10 text-white'
            } rounded-lg px-4 py-2 max-w-[80%]`}
          >
            {message.content}
          </div>
        ))}
        {isProcessing && (
          <div className="mr-auto bg-white/10 text-white rounded-lg px-4 py-2 max-w-[80%]">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} /> {/* Empty div to scroll to */}
      </div>
      
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          disabled={isProcessing}
          autoFocus={autoFocus}
          className={`flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 ${className}`}
        />
        <Button 
          type="submit" 
          disabled={isProcessing || !inputValue.trim()} 
          size="icon"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default SimpleChatInterface;
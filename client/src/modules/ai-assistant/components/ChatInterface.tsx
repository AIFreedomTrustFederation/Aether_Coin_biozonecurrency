import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../contexts/AIContext';
import { ChatMessage } from '../types';
import { formatTimestamp } from '../utils/formatters';
import { Send, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className = '' }: ChatInterfaceProps) {
  const { state, handleChatMessage, clearChat } = useAI();
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.messages]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    handleChatMessage(messageInput);
    setMessageInput('');
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat header */}
      <div className="flex justify-between items-center p-3 border-b">
        <h3 className="text-lg font-medium">Mysterion AI Assistant</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearChat} 
          title="Clear chat history"
        >
          <X size={16} className="mr-1" />
          Clear
        </Button>
      </div>
      
      {/* Chat messages */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4">
          {state.messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p className="mb-2">Welcome to Mysterion AI Assistant</p>
              <p className="text-sm">How can I help you today?</p>
            </div>
          ) : (
            state.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Ask Mysterion anything..."
            disabled={state.isProcessing}
            className="flex-1"
          />
          <Button type="submit" disabled={state.isProcessing || !messageInput.trim()}>
            {state.isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const getBubbleStyle = () => {
    switch (message.sender) {
      case 'user':
        return 'bg-primary text-primary-foreground ml-12';
      case 'ai':
        return 'bg-muted text-muted-foreground mr-12';
      case 'system':
        return 'bg-accent text-accent-foreground mx-8 text-sm';
      default:
        return 'bg-muted text-muted-foreground mr-12';
    }
  };

  const bubbleStyle = getBubbleStyle();
  
  return (
    <div className={`rounded-lg p-3 ${bubbleStyle} ${message.isLoading ? 'opacity-70' : ''}`}>
      {message.isLoading && (
        <div className="flex items-center mb-1">
          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
          <span className="text-xs">Processing...</span>
        </div>
      )}
      <div className="whitespace-pre-line">{message.content}</div>
      <div className="text-xs opacity-70 text-right mt-1">
        {formatTimestamp(message.timestamp)}
      </div>
    </div>
  );
}

export default ChatInterface;
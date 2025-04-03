import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PaperPlaneIcon, Loader2 } from 'lucide-react';
import { formatDate } from '../utils/formatters';
import { ChatInterfaceProps } from '../types';
import { useAI } from '../contexts/AIContext';
import ReactMarkdown from 'react-markdown';

/**
 * Chat interface component for the AI assistant.
 * Displays conversation history and allows users to send messages.
 */
const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  className = '', 
  autoFocus = false,
  inputPlaceholder = 'Type a message...',
}) => {
  const { state, sendMessage } = useAI();
  const { conversation, isProcessing } = state;
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current;
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [conversation]);
  
  // Focus textarea when component is mounted if autoFocus is true
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isProcessing) {
      sendMessage(message.trim());
      setMessage('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat history */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {conversation.length === 0 ? (
            <div className="h-full flex items-center justify-center min-h-[60vh]">
              <div className="text-center p-6 rounded-lg max-w-md">
                <h3 className="text-lg font-medium mb-2">Welcome to your AI Assistant</h3>
                <p className="text-muted-foreground mb-4">
                  I can help you with managing your wallet, verifying transactions, and monitoring security threats. How can I assist you today?
                </p>
                <div className="grid grid-cols-1 gap-2 mt-4">
                  {[
                    'How secure is my wallet?',
                    'Verify my latest transaction',
                    'Explain escrow protection',
                    'Show me recent security scans'
                  ].map((suggestion, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="justify-start text-left h-auto py-2 px-3"
                      onClick={() => {
                        setMessage(suggestion);
                        if (textareaRef.current) {
                          textareaRef.current.focus();
                        }
                      }}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            conversation.map((msg, idx) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-lg max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted rounded-bl-none'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown
                      className="prose prose-sm dark:prose-invert"
                      components={{
                        a: ({ children, ...props }) => (
                          <a {...props} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        ),
                        code: ({ children }) => (
                          <code className="px-1 py-0.5 rounded bg-muted-foreground/20 text-sm font-mono">
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="p-2 rounded bg-muted-foreground/20 overflow-x-auto text-sm font-mono my-2">
                            {children}
                          </pre>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-4 my-1 space-y-1">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-4 my-1 space-y-1">
                            {children}
                          </ol>
                        ),
                        p: ({ children }) => (
                          <p className="mb-1">{children}</p>
                        )
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
                <span className="text-xs text-muted-foreground mt-1 px-1">
                  {formatDate(msg.timestamp, true, false)}
                </span>
              </div>
            ))
          )}
          
          {isProcessing && (
            <div className="flex items-start">
              <div className="px-4 py-2 rounded-lg bg-muted rounded-bl-none flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span>AI is thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Message input */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={inputPlaceholder}
            className="min-h-[60px] resize-none"
            disabled={isProcessing}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isProcessing || !message.trim()}
            className="h-[60px] w-[60px] flex-shrink-0"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <PaperPlaneIcon className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
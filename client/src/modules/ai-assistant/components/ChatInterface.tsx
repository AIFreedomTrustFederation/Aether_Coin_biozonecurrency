import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../contexts/AIContext';
import { 
  Send, 
  Mic, 
  X, 
  Bot, 
  User, 
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDate } from '../utils/formatters';
import ReactMarkdown from 'react-markdown';
import { ChatInterfaceProps } from '../types';

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  className = '',
  inputPlaceholder = 'Ask your AI assistant something...',
  showTimestamps = true,
  autoFocus = true,
}) => {
  const { state, sendMessage } = useAI();
  const { messages, isTyping, config } = state;

  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Auto focus input on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    sendMessage(message);
    setMessage('');
  };

  const handleMicToggle = () => {
    // In a real implementation, this would use the Web Speech API
    // or a similar speech recognition service
    
    if (isListening) {
      // Stop listening logic would go here
      setIsListening(false);
    } else {
      // If voice is disabled in settings, show a notification
      if (!config.enableVoice) {
        // Here you might show a toast notification explaining that
        // voice input is disabled in settings
        alert('Voice input is disabled in settings. Please enable it first.');
        return;
      }
      
      // Start listening logic would go here
      setIsListening(true);
      
      // Mock voice recognition result after 3 seconds
      setTimeout(() => {
        setMessage(prev => prev + 'What security issues do I have?');
        setIsListening(false);
      }, 3000);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Bot className="h-12 w-12 mb-4 text-primary" />
            <h3 className="text-lg font-medium mb-2">Quantum-Secure AI Assistant</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              How can I help you with your blockchain wallet today? You can ask about security, transactions, market insights, or general wallet management.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
              <Button 
                variant="outline"
                className="text-left justify-start"
                onClick={() => sendMessage("What can you do?")}
              >
                What can you do?
              </Button>
              <Button 
                variant="outline"
                className="text-left justify-start"
                onClick={() => sendMessage("Check my wallet security")}
              >
                Check my wallet security
              </Button>
              <Button 
                variant="outline"
                className="text-left justify-start"
                onClick={() => sendMessage("What are my pending transactions?")}
              >
                Pending transactions
              </Button>
              <Button 
                variant="outline"
                className="text-left justify-start"
                onClick={() => sendMessage("Securely store my credentials")}
              >
                Store credentials
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-2">
            {messages.map((msg, idx) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[90%] ${
                    msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <Card
                      className={`px-4 py-3 ${
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : ''
                      }`}
                    >
                      <div className="prose dark:prose-invert break-words prose-p:leading-relaxed prose-pre:p-0">
                        <ReactMarkdown className={msg.sender === 'user' ? '' : 'chat-markdown'}>
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    </Card>
                    {showTimestamps && (
                      <div className="text-xs text-muted-foreground mt-1 ml-1">
                        {formatDate(msg.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[90%]">
                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-muted">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <Card className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={inputPlaceholder}
            className="flex-1"
            disabled={isListening}
          />
          
          {message && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setMessage('')}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear input</span>
            </Button>
          )}
          
          {config.enableVoice && (
            <Button
              type="button"
              variant={isListening ? 'destructive' : 'outline'}
              size="icon"
              onClick={handleMicToggle}
            >
              {isListening ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isListening ? 'Stop recording' : 'Start recording'}
              </span>
            </Button>
          )}
          
          <Button type="submit" size="icon" disabled={!message.trim() || isListening}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
        
        {/* Customize with additional information or disclaimers */}
        <div className="mt-2 text-xs text-muted-foreground flex justify-between items-center">
          <span>End-to-end quantum-secure encryption</span>
          <AlertTriangle className="h-3 w-3" />
        </div>
      </div>
      
      <style jsx>{`
        .typing-indicator {
          display: flex;
          align-items: center;
        }
        
        .typing-indicator span {
          height: 8px;
          width: 8px;
          margin-right: 4px;
          border-radius: 50%;
          display: inline-block;
          background-color: currentColor;
          opacity: 0.6;
          animation: bouncing 1.2s linear infinite;
        }
        
        .typing-indicator span:nth-child(1) {
          animation-delay: 0s;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
          margin-right: 0;
        }
        
        @keyframes bouncing {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-5px);
          }
        }
        
        .chat-markdown p {
          margin: 0.5rem 0;
        }
        
        .chat-markdown p:first-child {
          margin-top: 0;
        }
        
        .chat-markdown p:last-child {
          margin-bottom: 0;
        }
        
        .chat-markdown ul, .chat-markdown ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        
        .chat-markdown code {
          background-color: rgba(0,0,0,0.1);
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-size: 0.9em;
        }
        
        .chat-markdown pre {
          background-color: rgba(0,0,0,0.1);
          padding: 0.5rem;
          border-radius: 5px;
          overflow-x: auto;
          margin: 0.5rem 0;
        }
        
        .chat-markdown pre code {
          background-color: transparent;
          padding: 0;
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
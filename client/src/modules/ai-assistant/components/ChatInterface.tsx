import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, ChevronDown, Plus } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isProcessing?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  disableInput?: boolean;
  clearOnSend?: boolean;
  showNewChat?: boolean;
  onNewChat?: () => void;
}

/**
 * A chat interface component for interacting with the AI assistant
 */
const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isProcessing = false,
  placeholder = 'Type a message...',
  autoFocus = false,
  className = '',
  disableInput = false,
  clearOnSend = true,
  showNewChat = false,
  onNewChat
}) => {
  const [message, setMessage] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom only when a new message is added, not on initial load
  const [initialRender, setInitialRender] = useState(true);
  const prevMessagesLengthRef = useRef<number>(0);
  
  useEffect(() => {
    // Skip auto-scrolling on initial render to prevent jumping to bottom of page
    if (initialRender && messages.length > 0) {
      setInitialRender(false);
      prevMessagesLengthRef.current = messages.length;
      return;
    }
    
    // Only scroll if new messages were added (not on first load)
    if (messages.length > prevMessagesLengthRef.current && endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    prevMessagesLengthRef.current = messages.length;
  }, [messages, initialRender]);
  
  // Auto focus input if specified
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isProcessing && !disableInput) {
      onSendMessage(message);
      if (clearOnSend) {
        setMessage('');
      }
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };
  
  const renderMessageContent = (content: string) => {
    // This could be expanded to handle markdown, code blocks, etc.
    return (
      <div className="whitespace-pre-wrap break-words">
        {content}
      </div>
    );
  };
  
  const scrollToBottom = () => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <div className={`flex flex-col rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-blue-500" />
          <h3 className="font-medium">AI Assistant</h3>
        </div>
        
        {showNewChat && onNewChat && (
          <button 
            onClick={onNewChat}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800"
          >
            <Plus size={16} />
          </button>
        )}
      </div>
      
      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight: '400px', minHeight: '300px' }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-6">
            <Bot size={32} className="mb-2 text-blue-500 opacity-70" />
            <p className="text-sm">
              How can I assist you with your blockchain transactions today?
            </p>
            <p className="text-xs mt-1 max-w-md">
              I can help verify transactions, secure your wallet, and protect against phishing attacks.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-tl-lg rounded-tr-sm rounded-bl-lg rounded-br-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm rounded-tr-lg rounded-bl-lg rounded-br-lg'
                } px-4 py-2.5`}
              >
                <div className="flex-shrink-0 mr-2">
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 mt-1" />
                  ) : (
                    <Bot className="w-4 h-4 mt-1" />
                  )}
                </div>
                <div className="flex-1">
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Show typing indicator when processing */}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-3 rounded-tl-sm rounded-tr-lg rounded-bl-lg rounded-br-lg">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Invisible element to scroll to */}
        <div ref={endOfMessagesRef} />
      </div>
      
      {/* Scroll to bottom button, visible when not at bottom */}
      {messagesContainerRef.current && 
       messagesContainerRef.current.scrollHeight > 
       messagesContainerRef.current.clientHeight + 
       messagesContainerRef.current.scrollTop + 100 && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-16 right-4 bg-gray-100 dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronDown size={16} />
        </button>
      )}
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center p-3 border-t border-gray-200 dark:border-gray-800">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          disabled={isProcessing || disableInput}
          className="flex-1 border-0 bg-transparent focus:ring-0 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        <button
          type="submit"
          disabled={!message.trim() || isProcessing || disableInput}
          className={`p-1.5 rounded-md ${
            !message.trim() || isProcessing || disableInput
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
          }`}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
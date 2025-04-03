import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../contexts/AIContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Send, PaperclipIcon, X, Loader2 } from 'lucide-react';
import { Message as MessageType } from '../types';
import { formatDistance } from 'date-fns';
import DOMPurify from 'dompurify';
import { Markdown } from 'react-markdown/lib/react-markdown';

interface ChatInterfaceProps {
  className?: string;
  minimized?: boolean;
  fullWidth?: boolean;
  showHeader?: boolean;
  onClose?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  className = '',
  minimized = false,
  fullWidth = false,
  showHeader = true,
  onClose
}) => {
  const { state, sendMessage, dispatch } = useAI();
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Mark messages as read when viewed
    if (state.unreadCount > 0) {
      dispatch({ type: 'MARK_READ' });
    }
  }, [state.messages, state.unreadCount, dispatch]);

  // Handle voice input (would be integrated with a real speech recognition API)
  const toggleVoiceInput = () => {
    if (!state.config.enableVoice) return;
    
    if (isListening) {
      // Stop listening
      setIsListening(false);
    } else {
      // Start listening
      setIsListening(true);
      
      // For demonstration purposes, we'll simulate a voice input
      setTimeout(() => {
        setMessage(prev => prev + 'Voice transcription would appear here. ');
        setIsListening(false);
      }, 3000);
    }
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (message.trim() === '' && attachments.length === 0) return;
    
    // Prepare attachments for sending
    const messageAttachments = attachments.map(file => ({
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      name: file.name,
      size: file.size,
      mimeType: file.type,
      // In a real implementation, we would upload the file to a server and get a URL
      url: URL.createObjectURL(file)
    }));
    
    // Send the message
    sendMessage(message, messageAttachments);
    
    // Clear input
    setMessage('');
    setAttachments([]);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  // Handle removing an attachment
  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Render message component
  const Message: React.FC<{ message: MessageType }> = ({ message }) => {
    const isUser = message.sender === 'user';
    
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div
          className={`max-w-[80%] rounded-lg px-4 py-2 ${
            isUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          {/* Message content with markdown support */}
          <div className="prose prose-sm dark:prose-invert">
            <Markdown>{DOMPurify.sanitize(message.text)}</Markdown>
          </div>
          
          {/* Attachments if any */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map(attachment => (
                <div key={attachment.id} className="flex items-center space-x-2">
                  {attachment.type === 'image' && attachment.url && (
                    <img 
                      src={attachment.url} 
                      alt={attachment.name || 'Attachment'} 
                      className="max-h-32 max-w-full rounded-md" 
                    />
                  )}
                  
                  {attachment.type === 'file' && (
                    <div className="flex items-center space-x-2 text-xs bg-background/50 rounded p-1">
                      <PaperclipIcon size={12} />
                      <span>{attachment.name}</span>
                      {attachment.size && (
                        <span className="text-muted-foreground">
                          ({Math.round(attachment.size / 1024)} KB)
                        </span>
                      )}
                    </div>
                  )}
                  
                  {attachment.type === 'transaction' && (
                    <div className="text-xs bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 rounded p-1">
                      Transaction: {attachment.data?.id || 'Unknown'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Timestamp */}
          <div className={`text-xs mt-1 ${isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            {formatDistance(new Date(message.timestamp), new Date(), { addSuffix: true })}
          </div>
        </div>
      </div>
    );
  };

  // If minimized, only show a notification badge
  if (minimized) {
    return (
      <div className={`fixed bottom-4 right-4 ${className}`}>
        <Button 
          size="icon" 
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={() => onClose && onClose()}
        >
          <span className="relative">
            AI
            {state.unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                {state.unreadCount}
              </Badge>
            )}
          </span>
        </Button>
      </div>
    );
  }

  return (
    <Card className={`flex flex-col ${fullWidth ? 'w-full' : 'w-96'} ${className}`}>
      {/* Chat header */}
      {showHeader && (
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center">
            <div className="mr-2 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
              AI
            </div>
            <div>
              <h3 className="font-medium">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">
                {state.isTyping ? 'Typing...' : 'How can I help you?'}
              </p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={18} />
            </Button>
          )}
        </div>
      )}
      
      {/* Chat messages */}
      <ScrollArea className="flex-1 p-3" style={{ height: fullWidth ? '400px' : '300px' }}>
        {state.messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-muted-foreground p-4">
            <div>
              <p>No messages yet</p>
              <p className="text-sm">Send a message to start a conversation with your AI assistant</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {state.messages.map(msg => (
              <Message key={msg.id} message={msg} />
            ))}
            {state.isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-secondary text-secondary-foreground rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Typing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      
      {/* Attachment preview */}
      {attachments.length > 0 && (
        <div className="p-2 border-t bg-muted/50">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div 
                key={index} 
                className="flex items-center bg-background rounded-md p-1 pr-2 text-xs"
              >
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 mr-1"
                  onClick={() => handleRemoveAttachment(index)}
                >
                  <X size={10} />
                </Button>
                <span className="truncate max-w-[100px]">{file.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Input area */}
      <div className="p-3 border-t">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
          >
            <PaperclipIcon size={18} />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              multiple
            />
          </Button>
          
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1"
          />
          
          {state.config.enableVoice && (
            <Button
              variant="outline"
              size="icon"
              onClick={toggleVoiceInput}
              title={isListening ? 'Stop listening' : 'Voice input'}
              className={isListening ? 'bg-red-100 text-red-500' : ''}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </Button>
          )}
          
          <Button size="icon" onClick={handleSendMessage}>
            <Send size={18} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;
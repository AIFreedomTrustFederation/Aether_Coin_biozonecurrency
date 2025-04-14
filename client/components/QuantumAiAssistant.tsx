/**
 * Quantum AI Assistant Component
 * 
 * This component provides an AI-driven assistant for quantum security features,
 * allowing users to interact with the quantum security system using natural language.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useQuantumAi, SecurityAction, SecurityGuidance } from '../hooks/useQuantumAi';

// Define types
type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  actions?: SecurityAction[];
};

type QuantumAiAssistantProps = {
  initialMessage?: string;
  className?: string;
};

/**
 * Quantum AI Assistant Component
 */
export function QuantumAiAssistant({ initialMessage, className }: QuantumAiAssistantProps) {
  const { 
    loading, 
    error, 
    securityStatus, 
    getSecurityGuidance, 
    executeSecurityAction 
  } = useQuantumAi();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: initialMessage || 'Hello! I\'m your quantum security assistant. How can I help you with your quantum-resistant security features today?',
      timestamp: Date.now()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle user input submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isProcessing) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);
    
    try {
      // Get AI guidance
      const response = await getSecurityGuidance(inputValue, securityStatus?.securityLevel);
      
      const assistantMessage: Message = {
        id: response.id || `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: response.timestamp || Date.now(),
        actions: response.securityActions
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      // Handle error
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: `Sorry, I encountered an error: ${err instanceof Error ? err.message : String(err)}`,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Execute a security action
  const handleExecuteAction = async (action: SecurityAction) => {
    try {
      setIsProcessing(true);
      
      // Execute the action
      const result = await executeSecurityAction(action);
      
      // Add system message about the action
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        role: 'system',
        content: result.message || `Action "${action.description}" executed successfully.`,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, systemMessage]);
    } catch (err) {
      // Handle error
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: `Failed to execute action: ${err instanceof Error ? err.message : String(err)}`,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className={`quantum-ai-assistant ${className || ''}`}>
      <div className="messages-container">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-content">{message.content}</div>
            
            {message.actions && message.actions.length > 0 && (
              <div className="message-actions">
                <h4>Suggested Actions:</h4>
                <div className="actions-list">
                  {message.actions.map((action, index) => (
                    <button
                      key={`${message.id}-action-${index}`}
                      className="action-button"
                      onClick={() => handleExecuteAction(action)}
                      disabled={isProcessing}
                    >
                      {action.description}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Ask about quantum security features..."
          disabled={isProcessing}
          className="input-field"
        />
        <button 
          type="submit" 
          disabled={isProcessing || !inputValue.trim()} 
          className="submit-button"
        >
          {isProcessing ? 'Processing...' : 'Send'}
        </button>
      </form>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="security-status">
        {securityStatus && (
          <>
            <div className="status-label">Security Level:</div>
            <div className={`status-value ${securityStatus.securityLevel}`}>
              {securityStatus.securityLevel.toUpperCase()}
            </div>
            <div className="status-label">Security Score:</div>
            <div className="status-value">{securityStatus.securityScore}/100</div>
          </>
        )}
      </div>
    </div>
  );
}
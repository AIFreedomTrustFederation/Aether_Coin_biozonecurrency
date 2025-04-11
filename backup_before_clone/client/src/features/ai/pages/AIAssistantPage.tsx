import { useState, useRef, useCallback } from 'react';
import MainLayout from '@/core/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Send, Bot, User, Info, ArrowRight, Loader2 } from 'lucide-react';

/**
 * AI Assistant page component
 * Provides an AI-powered chatbot interface for user assistance
 */
const AIAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hello! I'm your Aetherion AI assistant. How can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of chat when messages change
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Handle sending a new message
  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      let aiResponse;
      
      // Example of contextual responses based on message content
      if (inputValue.toLowerCase().includes('transaction') && inputValue.toLowerCase().includes('reverse')) {
        aiResponse = {
          id: messages.length + 2,
          role: 'assistant',
          content: "I can help you with reversing a potentially fraudulent transaction. To proceed with the transaction recovery process, I'll need the following information:\n\n1. Transaction hash or ID\n2. Date and time of transaction\n3. Amount and cryptocurrency type\n4. Recipient address\n\nOnce verified, I'll initiate the quantum-secure escrow recovery protocol.",
          timestamp: new Date().toISOString(),
        };
      } else if (inputValue.toLowerCase().includes('security')) {
        aiResponse = {
          id: messages.length + 2,
          role: 'assistant',
          content: "Your Aetherion wallet implements multiple layers of quantum-resistant security:\n\n• CRYSTAL-Kyber for key encapsulation\n• SPHINCS+ for digital signatures\n• Recursive Merkle trees for verification\n• zk-STARKs for privacy\n\nAll these technologies work together to provide holographic security where parts verify the whole.",
          timestamp: new Date().toISOString(),
        };
      } else if (inputValue.toLowerCase().includes('wallet')) {
        aiResponse = {
          id: messages.length + 2,
          role: 'assistant',
          content: "Your current wallet status:\n\n• Balance: $15,557.00\n• Security Status: All quantum protection layers active\n• Recent Activity: 3 transactions in the past 48 hours\n• Health Score: 95/100\n\nWould you like to review your recent transactions or check specific asset balances?",
          timestamp: new Date().toISOString(),
        };
      } else {
        aiResponse = {
          id: messages.length + 2,
          role: 'assistant',
          content: "I'm here to help with your Aetherion experience. You can ask me about:\n\n• Wallet security and protection\n• Transaction details and history\n• Reversing suspicious transactions\n• Quantum security features\n• Price alerts and market information\n• Account settings and preferences",
          timestamp: new Date().toISOString(),
        };
      }
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  }, [inputValue, messages.length]);
  
  // Handle keyboard shortcut for sending message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Scroll to bottom whenever messages change
  useState(() => {
    scrollToBottom();
  });

  return (
    <MainLayout>
      <div className="container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 flex flex-col h-[calc(100vh-130px)]">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center">
                  <Bot className="mr-2 h-5 w-5" />
                  AI Assistant
                </CardTitle>
                <CardDescription>
                  Ask questions about your wallet, transactions, or security
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[calc(100vh-280px)] p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <ChatMessage 
                        key={message.id} 
                        role={message.role} 
                        content={message.content} 
                      />
                    ))}
                    {isLoading && (
                      <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/20">AI</AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg bg-muted p-3 text-sm flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Thinking...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messageEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="pt-2">
                <div className="flex w-full items-center space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="mr-2 h-5 w-5" />
                  How can AI help?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Transaction Recovery</h3>
                    <p className="text-sm text-muted-foreground">
                      Our AI can help you reverse potentially fraudulent transactions through 
                      our quantum-secure escrow system.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Security Monitoring</h3>
                    <p className="text-sm text-muted-foreground">
                      Get insights into your wallet's security status and recommendations 
                      for improving your protection.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Market Intelligence</h3>
                    <p className="text-sm text-muted-foreground">
                      Ask about market trends, price predictions, and investment strategies 
                      for your portfolio.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Security Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md space-y-2">
                  <h3 className="font-medium text-amber-800">Never Share Private Keys</h3>
                  <p className="text-sm text-amber-700">
                    Our AI assistant will never ask for your private keys, seed phrases, 
                    or password information.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Suggested Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => setInputValue("How secure is my wallet?")}
                >
                  <span>How secure is my wallet?</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => setInputValue("Can you help reverse a transaction?")}
                >
                  <span>Can you help reverse a transaction?</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => setInputValue("Show me my wallet status")}
                >
                  <span>Show me my wallet status</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Chat message component
const ChatMessage = ({ role, content }: { role: string; content: string }) => {
  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-9 w-9">
        {role === 'assistant' ? (
          <AvatarFallback className="bg-primary/20">AI</AvatarFallback>
        ) : (
          <AvatarFallback className="bg-muted">
            <User className="h-5 w-5" />
          </AvatarFallback>
        )}
      </Avatar>
      <div
        className={`rounded-lg p-3 text-sm ${
          role === 'assistant' ? 'bg-muted' : 'bg-primary text-primary-foreground'
        }`}
      >
        {content.split('\n').map((text, i) => (
          <p key={i} className={i > 0 ? 'mt-2' : ''}>
            {text}
          </p>
        ))}
      </div>
    </div>
  );
};

export default AIAssistantPage;
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  id: number;
  content: string;
  sender: 'user' | 'mysterion';
  timestamp: Date;
}

interface ChatInterfaceProps {
  onCodeGenerated: (code: any, projectName: string) => void;
}

export default function ChatInterface({ onCodeGenerated }: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Add initial welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: 0,
          content: "Hello! I'm Mysterion, your DApp creation assistant. I can help you build custom smart contracts and decentralized applications using natural language. What kind of DApp would you like to create today?",
          sender: 'mysterion',
          timestamp: new Date()
        }
      ]);
    }
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      id: messages.length,
      content: message,
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    
    try {
      // This would call your NLP processor API in a real implementation
      const response = await apiRequest('/api/dapp-builder/process', {
        method: 'POST',
        body: JSON.stringify({ prompt: message })
      });
      
      // Add AI response to chat
      setMessages(prev => [
        ...prev,
        {
          id: prev.length,
          content: response.message,
          sender: 'mysterion',
          timestamp: new Date()
        }
      ]);
      
      // If code was generated, pass it to the parent component
      if (response.generatedCode) {
        onCodeGenerated(response.generatedCode, response.projectName || 'MyDapp');
        
        toast({
          title: 'Code generated successfully',
          description: 'Your DApp code has been created based on your requirements.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Add error message to chat
      setMessages(prev => [
        ...prev,
        {
          id: prev.length,
          content: "I'm sorry, I encountered an error while processing your request. Please try again with a different description or check the technical requirements.",
          sender: 'mysterion',
          timestamp: new Date()
        }
      ]);
      
      toast({
        title: 'Error processing request',
        description: 'There was a problem generating your DApp code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle>Chat with Mysterion</CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col overflow-hidden p-4">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-2 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      <Avatar className={`mt-1 ${msg.sender === 'user' ? 'bg-primary' : 'bg-secondary'}`}>
                        <AvatarFallback>
                          {msg.sender === 'user' ? 'U' : 'M'}
                        </AvatarFallback>
                        {msg.sender === 'mysterion' && (
                          <AvatarImage src="/mysterion-avatar.png" alt="Mysterion" />
                        )}
                      </Avatar>
                      
                      <div className={`rounded-lg p-3 ${
                        msg.sender === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                        <div className={`text-xs mt-1 ${
                          msg.sender === 'user' 
                            ? 'text-primary-foreground/80' 
                            : 'text-muted-foreground'
                        }`}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={endOfMessagesRef} />
              </div>
              
              <form onSubmit={handleSubmit} className="mt-auto">
                <div className="flex items-end gap-2">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe your DApp (e.g., 'Create a token with 1 million supply')"
                    className="min-h-[60px] flex-1"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Thinking...' : 'Send'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="examples" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Example Prompts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">ERC-20 Token</h3>
                <p className="text-sm text-muted-foreground">
                  "Create an ERC-20 token called AetherCoin with a total supply of 10 million tokens. 
                  Include functionality for minting, burning, and pausing transfers in emergencies. 
                  Make it upgradeable for future improvements."
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setMessage("Create an ERC-20 token called AetherCoin with a total supply of 10 million tokens. Include functionality for minting, burning, and pausing transfers in emergencies. Make it upgradeable for future improvements.")}
                >
                  Use This Example
                </Button>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">NFT Collection</h3>
                <p className="text-sm text-muted-foreground">
                  "Create an NFT collection for digital art called QuantumArt. Each NFT should have 
                  properties for the artist, creation date, and rarity level. Include royalty features 
                  so artists receive 2.5% of secondary sales."
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setMessage("Create an NFT collection for digital art called QuantumArt. Each NFT should have properties for the artist, creation date, and rarity level. Include royalty features so artists receive 2.5% of secondary sales.")}
                >
                  Use This Example
                </Button>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Marketplace</h3>
                <p className="text-sm text-muted-foreground">
                  "Build a decentralized marketplace for trading NFTs with a 1% platform fee. 
                  Users should be able to list items, make offers, cancel listings, and buy 
                  NFTs directly. Include a dispute resolution mechanism."
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setMessage("Build a decentralized marketplace for trading NFTs with a 1% platform fee. Users should be able to list items, make offers, cancel listings, and buy NFTs directly. Include a dispute resolution mechanism.")}
                >
                  Use This Example
                </Button>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">DAO Governance</h3>
                <p className="text-sm text-muted-foreground">
                  "Create a governance contract for a DAO that allows token holders to create, 
                  vote on, and execute proposals. Proposals should have a minimum threshold of 
                  100,000 tokens to create, and require 60% majority to pass. Include timelock 
                  functionality for security."
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setMessage("Create a governance contract for a DAO that allows token holders to create, vote on, and execute proposals. Proposals should have a minimum threshold of 100,000 tokens to create, and require 60% majority to pass. Include timelock functionality for security.")}
                >
                  Use This Example
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
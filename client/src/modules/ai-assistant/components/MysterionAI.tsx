import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  Send, 
  User, 
  Loader2, 
  Sparkles, 
  Zap, 
  BrainCircuit,
  Shield, 
  Wallet, 
  BarChart3,
  Coins,
  Cpu,
  AlertCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { v4 as uuidv4 } from 'uuid';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'general' | 'blockchain' | 'security' | 'transaction' | 'technical' | 'creative';
}

interface MysterionAIProps {
  className?: string;
  userId?: number;
  initialActiveTab?: string;
}

/**
 * Mysterion AI - A versatile AI assistant capable of handling any type of request
 * Features include:
 * - General knowledge and conversation
 * - Blockchain and cryptocurrency insights
 * - Security monitoring and alerts
 * - Creative content generation
 * - Technical assistance
 */
const MysterionAI: React.FC<MysterionAIProps> = ({ 
  className = '',
  userId = 1,
  initialActiveTab = 'chat'
}) => {
  // State
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [messages, setMessages] = useState<Message[]>([{
    id: uuidv4(),
    role: 'assistant',
    content: "Hello! I'm Mysterion, your AI assistant. I can help with any request - from blockchain transactions to creative writing. How can I assist you today?",
    timestamp: new Date(),
    type: 'general'
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Helper functions
  const scrollToBottom = useCallback(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  
  // Focus input on tab change
  useEffect(() => {
    if (activeTab === 'chat' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeTab]);

  // Handle message submission - enhanced for mobile compatibility
  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim() || isProcessing) return;
    
    // Cache the input value before clearing it to prevent race conditions
    const messageText = inputValue.trim();
    
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };
    
    // Clear input immediately for better mobile UX
    setInputValue('');
    
    // Update messages
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    // Process the message and generate a response
    setTimeout(() => {
      const response = generateAIResponse(messageText);
      setMessages(prev => [...prev, response]);
      setIsProcessing(false);
      
      // Ensure scroll to bottom happens after message is rendered
      setTimeout(scrollToBottom, 100);
      
      // Refocus the input field on mobile
      if (inputRef.current && /Mobi|Android/i.test(navigator.userAgent)) {
        inputRef.current.focus();
      }
    }, 1500);
  }, [inputValue, isProcessing, scrollToBottom]);
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Generate AI response based on user input
  const generateAIResponse = (input: string): Message => {
    const lowerInput = input.toLowerCase();
    let content = '';
    let type: 'general' | 'blockchain' | 'security' | 'transaction' | 'technical' | 'creative' = 'general';
    
    // Categorize the message type based on content
    if (lowerInput.includes('blockchain') || 
        lowerInput.includes('crypto') || 
        lowerInput.includes('wallet') || 
        lowerInput.includes('bitcoin') || 
        lowerInput.includes('ethereum') ||
        lowerInput.includes('transaction') ||
        lowerInput.includes('singularity coin') ||
        lowerInput.includes('sing')) {
      type = 'blockchain';
    } else if (lowerInput.includes('secure') || 
               lowerInput.includes('hack') || 
               lowerInput.includes('protect') || 
               lowerInput.includes('phishing') ||
               lowerInput.includes('quantum')) {
      type = 'security';
    } else if (lowerInput.includes('send') || 
               lowerInput.includes('receive') || 
               lowerInput.includes('transfer') ||
               lowerInput.includes('payment')) {
      type = 'transaction';
    } else if (lowerInput.includes('code') || 
               lowerInput.includes('program') || 
               lowerInput.includes('technical') ||
               lowerInput.includes('develop') ||
               lowerInput.includes('software')) {
      type = 'technical'; 
    } else if (lowerInput.includes('create') || 
               lowerInput.includes('write') || 
               lowerInput.includes('design') ||
               lowerInput.includes('generate') ||
               lowerInput.includes('story')) {
      type = 'creative';
    }
    
    // Generate response based on type
    switch (type) {
      case 'blockchain':
        if (lowerInput.includes('wallet')) {
          content = "Your wallet is fully secured with quantum-resistant encryption. Your current balance is displaying across multiple cryptocurrencies. Is there something specific about your wallet you'd like to know?";
        } else if (lowerInput.includes('transaction')) {
          content = "I can help you with blockchain transactions. Would you like to review your recent transactions, initiate a new transaction, or perhaps understand transaction fees better?";
        } else if (lowerInput.includes('singularity coin') || lowerInput.includes('sing')) {
          content = "Singularity Coin (SING) is our quantum-resistant Layer 1 blockchain token. It uses fractal recursive Mandelbrot sets for security. The current ICO price is $0.000646 per coin, with 1 billion coins available out of a total 10 billion supply. Would you like to learn more about its technology or how to participate in the ICO?";
        } else {
          content = "I'm knowledgeable about blockchain technologies and cryptocurrencies. I can provide information on market trends, explain technical concepts, or help you manage your digital assets. What specific aspect are you interested in?";
        }
        break;
        
      case 'security':
        if (lowerInput.includes('quantum')) {
          content = "Aetherion implements multiple quantum-resistant security layers including CRYSTAL-Kyber for key encapsulation, SPHINCS+ for digital signatures, recursive Merkle trees for verification, and zk-STARKs for privacy. These create a holographic security model where parts verify the whole. Would you like me to explain any of these technologies in more detail?";
        } else if (lowerInput.includes('hack') || lowerInput.includes('phishing')) {
          content = "I'm constantly monitoring for potential security threats. Our system employs advanced detection for phishing attempts and suspicious activities. If you believe you've encountered a security issue, I can help you identify it and take appropriate action.";
        } else {
          content = "Security is our top priority at Aetherion. Your assets are protected by multiple layers of quantum-resistant encryption and real-time monitoring. Is there a specific security concern I can address for you?";
        }
        break;
        
      case 'transaction':
        content = "I can assist with transaction management. Whether you need to transfer funds, review transaction history, or recover a potentially fraudulent transaction, I'm here to help. For transfers, I can verify recipients and analyze for potential security issues. What transaction would you like to work with?";
        break;
        
      case 'technical':
        content = "As your technical assistant, I can help with code development, explain technical concepts, troubleshoot issues, or provide guidance on best practices. What technical challenge are you facing today?";
        break;
        
      case 'creative':
        content = "I'd be happy to assist with creative tasks. Whether you need content creation, design ideas, storytelling, or other creative work, I'm here to help. What would you like to create today?";
        break;
        
      default:
        if (lowerInput.includes('hello') || lowerInput.includes('hi ')) {
          content = "Hello! I'm Mysterion, your AI assistant for Aetherion. I can help with any request, not limited to blockchain operations. Feel free to ask me about wallet security, transactions, creative tasks, technical questions, or just chat!";
        } else if (lowerInput.includes('help') || lowerInput.includes('can you')) {
          content = "I can help you with various tasks including:\n\n• Blockchain and cryptocurrency management\n• Security analysis and monitoring\n• Transaction verification and processing\n• Technical assistance and troubleshooting\n• Creative content generation\n• General knowledge and conversation\n\nJust let me know what you need!";
        } else {
          content = "I'm here to assist you with any request. Whether it's blockchain operations, security questions, technical help, creative tasks, or just a friendly conversation, I'm equipped to help. What would you like to know or discuss today?";
        }
    }
    
    return {
      id: uuidv4(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      type
    };
  };
  
  // Get icon for message type
  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'blockchain': return <Coins className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'transaction': return <Wallet className="h-4 w-4" />;
      case 'technical': return <Cpu className="h-4 w-4" />;
      case 'creative': return <Sparkles className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };
  
  return (
    <Card className={`overflow-hidden border-none shadow-md ${className}`}>
      <CardContent className="p-0">
        <Tabs 
          defaultValue={initialActiveTab} 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="h-[calc(100vh-120px)]"
        >
          <div className="border-b bg-muted/20">
            <TabsList className="bg-transparent h-14 w-full rounded-none justify-center">
              <TabsTrigger 
                value="chat" 
                className="flex items-center gap-2 data-[state=active]:bg-background"
              >
                <BrainCircuit className="h-4 w-4" />
                <span className="sm:inline hidden">Mysterion AI</span>
              </TabsTrigger>
              <TabsTrigger 
                value="blockchain" 
                className="flex items-center gap-2 data-[state=active]:bg-background"
              >
                <Coins className="h-4 w-4" />
                <span className="sm:inline hidden">Blockchain</span>
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="flex items-center gap-2 data-[state=active]:bg-background"
              >
                <Shield className="h-4 w-4" />
                <span className="sm:inline hidden">Security</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="flex items-center gap-2 data-[state=active]:bg-background"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="sm:inline hidden">Analytics</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Chat Interface */}
          <TabsContent 
            value="chat" 
            className="absolute inset-0 overflow-hidden m-0 pt-14"
          >
            <div className="h-full flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex max-w-[80%] ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tl-lg rounded-tr-sm rounded-bl-lg rounded-br-lg'
                            : 'bg-muted text-foreground rounded-tl-sm rounded-tr-lg rounded-bl-lg rounded-br-lg'
                        } px-4 py-3`}
                      >
                        <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                          {message.role === 'assistant' ? (
                            <AvatarFallback>
                              {getMessageIcon(message.type)}
                            </AvatarFallback>
                          ) : (
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          {message.content.split('\n').map((text, i) => (
                            <p key={i} className={i > 0 ? 'mt-2' : ''}>
                              {text}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="flex max-w-[80%] bg-muted text-foreground rounded-tl-sm rounded-tr-lg rounded-bl-lg rounded-br-lg px-4 py-3">
                        <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                          <AvatarFallback>
                            <BrainCircuit className="h-4 w-4 animate-pulse" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Processing your request...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messageEndRef} />
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t bg-background">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Ask Mysterion anything..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isProcessing}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={!inputValue.trim() || isProcessing}
                    className="flex-shrink-0"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </TabsContent>
          
          {/* Blockchain Tab */}
          <TabsContent 
            value="blockchain" 
            className="absolute inset-0 overflow-auto m-0 pt-14 p-4"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Wallet Health</CardTitle>
                    <CardDescription>
                      Status of your cryptocurrencies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <span>SING</span>
                        </div>
                        <div>
                          <span className="font-medium">2,500</span>
                          <span className="text-muted-foreground ml-2">$1,615.00</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-blue-500" />
                          <span>ETH</span>
                        </div>
                        <div>
                          <span className="font-medium">1.25</span>
                          <span className="text-muted-foreground ml-2">$3,250.00</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-green-500" />
                          <span>USDC</span>
                        </div>
                        <div>
                          <span className="font-medium">1,000</span>
                          <span className="text-muted-foreground ml-2">$1,000.00</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        setInputValue("Help me manage my cryptocurrency portfolio");
                        setActiveTab("chat");
                      }}
                    >
                      Manage Portfolio
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Transaction Activity</CardTitle>
                    <CardDescription>
                      Recent blockchain transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        <span className="flex-1">Received 0.5 ETH</span>
                        <span className="text-muted-foreground">Today</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                        <span className="flex-1">Sent 100 USDC</span>
                        <span className="text-muted-foreground">Yesterday</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                        <span className="flex-1">ICO Purchase: 500 SING</span>
                        <span className="text-muted-foreground">Apr 02</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        setInputValue("Show me my transaction history");
                        setActiveTab("chat");
                      }}
                    >
                      View All Transactions
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>
                    Common blockchain operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setInputValue("How do I send a transaction?");
                        setActiveTab("chat");
                      }}
                    >
                      Send Tokens
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setInputValue("How do I receive crypto?");
                        setActiveTab("chat");
                      }}
                    >
                      Receive
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setInputValue("Tell me about Singularity Coin ICO");
                        setActiveTab("chat");
                      }}
                    >
                      ICO Info
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setInputValue("How do I secure my wallet?");
                        setActiveTab("chat");
                      }}
                    >
                      Security
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setInputValue("What are gas fees?");
                        setActiveTab("chat");
                      }}
                    >
                      Gas Info
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setInputValue("Can you explain staking?");
                        setActiveTab("chat");
                      }}
                    >
                      Staking
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent 
            value="security" 
            className="absolute inset-0 overflow-auto m-0 pt-14 p-4"
          >
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Security Status</CardTitle>
                  <CardDescription>
                    Overall security assessment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-4">
                    <div className="relative h-20 w-20 flex items-center justify-center rounded-full bg-muted">
                      <div className="absolute inset-0">
                        <svg viewBox="0 0 100 100" className="h-full w-full transform rotate-90">
                          <circle 
                            cx="50" cy="50" r="45" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="10" 
                            strokeDasharray="283" 
                            strokeDashoffset="28.3"
                            className="text-green-500" 
                          />
                        </svg>
                      </div>
                      <span className="relative text-xl font-bold">90%</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">Strong Protection</h4>
                      <p className="text-sm text-muted-foreground">Your wallet has quantum-resistant security active</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>CRYSTAL-Kyber Encryption</span>
                      </div>
                      <span className="text-green-500 text-sm">Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>SPHINCS+ Signatures</span>
                      </div>
                      <span className="text-green-500 text-sm">Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Fractal Validation</span>
                      </div>
                      <span className="text-green-500 text-sm">Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span>zk-STARKs Privacy</span>
                      </div>
                      <span className="text-yellow-500 text-sm">Partial</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setInputValue("How can I improve my wallet security?");
                      setActiveTab("chat");
                    }}
                  >
                    Enhance Security
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Recent Alerts</CardTitle>
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  </div>
                  <CardDescription>
                    Security notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 border rounded-md bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800/50">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <span className="font-medium text-yellow-700 dark:text-yellow-300">Unusual Login Location</span>
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">New login detected from San Francisco, CA. If this wasn't you, please secure your account immediately.</p>
                    <div className="flex justify-end mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-yellow-700 dark:text-yellow-300 border-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                        onClick={() => {
                          setInputValue("Help me secure my account after unusual login");
                          setActiveTab("chat");
                        }}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="font-medium">Phishing Protection</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Protected against 3 potential phishing attempts this month.</p>
                    <div className="flex justify-end mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setInputValue("Tell me about the blocked phishing attempts");
                          setActiveTab("chat");
                        }}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent 
            value="analytics" 
            className="absolute inset-0 overflow-auto m-0 pt-14 p-4"
          >
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Market Overview</CardTitle>
                  <CardDescription>
                    Cryptocurrency market insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-40 bg-muted rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-10 w-10 text-muted-foreground opacity-30 mx-auto" />
                      <p className="mt-2 text-muted-foreground">Chart visualization placeholder</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Bitcoin</div>
                      <div className="text-lg font-medium">$55,432.18</div>
                      <div className="text-xs text-green-500">+2.4%</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Ethereum</div>
                      <div className="text-lg font-medium">$2,653.47</div>
                      <div className="text-xs text-green-500">+3.8%</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Singularity</div>
                      <div className="text-lg font-medium">$0.000646</div>
                      <div className="text-xs text-blue-500">ICO Phase</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Market Cap</div>
                      <div className="text-lg font-medium">$1.87T</div>
                      <div className="text-xs text-green-500">+1.2%</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setInputValue("What's your analysis of current market trends?");
                      setActiveTab("chat");
                    }}
                  >
                    Get Market Analysis
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Portfolio Growth</CardTitle>
                  <CardDescription>
                    Performance of your assets over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-40 bg-muted rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-10 w-10 text-muted-foreground opacity-30 mx-auto" />
                      <p className="mt-2 text-muted-foreground">Growth chart placeholder</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span>1 Month Return</span>
                      <span className="font-medium text-green-500">+8.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>3 Month Return</span>
                      <span className="font-medium text-green-500">+15.7%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>6 Month Return</span>
                      <span className="font-medium text-green-500">+32.1%</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setInputValue("How can I optimize my portfolio for better returns?");
                      setActiveTab("chat");
                    }}
                  >
                    Optimize Portfolio
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MysterionAI;
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatInterface, { Message } from '../modules/ai-assistant/components/ChatInterface';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Brain,
  Wallet,
  Database,
  Shield,
  PieChart,
  ArrowRight,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Radio,
  HelpCircle
} from 'lucide-react';

// Define onboarding steps
const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Aetherion',
    description: 'Get started with our quantum-resistant blockchain platform',
    content: 'Welcome to Aetherion! I\'m Mysterion, your AI assistant. I\'m here to help you navigate our quantum-resistant blockchain ecosystem. What would you like to learn about first?',
  },
  {
    id: 'wallet-setup',
    title: 'Wallet Setup',
    description: 'Create and secure your Aetherion wallet',
    content: 'Let\'s set up your Aetherion wallet. Our wallet supports multiple cryptocurrencies in our ecosystem including Singularity Coin (SING), FractalCoin (FTC), AICoin (ICON), and WinNation (WIN). Would you like to create a new wallet or import an existing one?',
  },
  {
    id: 'mining',
    title: 'Mining',
    description: 'Start mining various coins in our ecosystem',
    content: 'Mining in Aetherion is unique - our fractal sharding approach allows for more efficient and environmentally friendly mining. You can mine Singularity Coin (SING) as our Layer 1 token, or contribute to mining any of our Layer 2 tokens (FTC, ICON, WIN). Which mining process would you like to learn about?',
  },
  {
    id: 'blockchain-explorer',
    title: 'Blockchain Explorer',
    description: 'Navigate through transaction histories and blockchain data',
    content: 'Our blockchain explorer allows you to view all transactions across the Aetherion ecosystem. You can search for specific wallets, transactions, or view network statistics. What specific information would you like to explore?',
  },
  {
    id: 'ico-participation',
    title: 'ICO Participation',
    description: 'Join current ICOs in the Aetherion ecosystem',
    content: 'Aetherion supports multiple Initial Coin Offerings for projects building on our platform. You can participate in ICOs directly from your wallet with minimal fees. Would you like to see current active ICOs or learn about the participation process?',
  },
  {
    id: 'mysterion-network',
    title: 'Mysterion AI Network',
    description: 'Contribute to and benefit from our distributed AI network',
    content: 'The Mysterion Network is our distributed AI training system where users can contribute processing power to train AI models and earn rewards. Your contributions help maintain the world\'s first truly decentralized AI system. Would you like to learn more about how to participate or the technical details?',
  }
];

// Initial system message explaining the assistant's role
const SYSTEM_MESSAGE: Message = {
  id: uuidv4(),
  role: 'system',
  content: 'I am Mysterion, the AI assistant for Aetherion - a quantum-resistant blockchain ecosystem. My purpose is to help users navigate the platform features, understand its unique value propositions, and troubleshoot any issues they encounter. I can explain concepts related to our cryptocurrencies (SING, FTC, ICON, WIN, IULC), wallet management, ICO participation, mining processes, and distributed AI training.',
  timestamp: new Date()
};

// The main AI assistant onboarding component
const AIAssistantOnboarding: React.FC = () => {
  const [activeStep, setActiveStep] = useState<string>('welcome');
  const [messages, setMessages] = useState<Message[]>([
    SYSTEM_MESSAGE,
    {
      id: uuidv4(),
      role: 'assistant',
      content: ONBOARDING_STEPS[0].content,
      timestamp: new Date()
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTutorialPanel, setShowTutorialPanel] = useState(true);

  // Handle sending a message in the chat interface
  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    // Simulate AI processing - in a real application, this would call an AI API
    setTimeout(() => {
      generateResponse(content);
    }, 1500);
  };

  // Generate an AI response based on user input
  const generateResponse = (userInput: string) => {
    const lowerInput = userInput.toLowerCase();
    let responseContent = '';
    let nextStep = activeStep;
    
    // Simple keyword-based response generation
    if (activeStep === 'welcome') {
      if (lowerInput.includes('wallet') || lowerInput.includes('account')) {
        responseContent = ONBOARDING_STEPS[1].content;
        nextStep = 'wallet-setup';
      } else if (lowerInput.includes('mining')) {
        responseContent = ONBOARDING_STEPS[2].content;
        nextStep = 'mining';
      } else if (lowerInput.includes('explorer') || lowerInput.includes('transactions')) {
        responseContent = ONBOARDING_STEPS[3].content;
        nextStep = 'blockchain-explorer';
      } else if (lowerInput.includes('ico') || lowerInput.includes('invest')) {
        responseContent = ONBOARDING_STEPS[4].content;
        nextStep = 'ico-participation';
      } else if (lowerInput.includes('ai') || lowerInput.includes('mysterion')) {
        responseContent = ONBOARDING_STEPS[5].content;
        nextStep = 'mysterion-network';
      } else {
        responseContent = "I can help you with wallet setup, mining, exploring the blockchain, participating in ICOs, or learning about the Mysterion AI Network. What would you like to know more about?";
      }
    } else if (activeStep === 'wallet-setup') {
      if (lowerInput.includes('create') || lowerInput.includes('new')) {
        responseContent = "Great! To create a new wallet, you'll need to:\n\n1. Generate a secure seed phrase (keep this private!)\n2. Set a strong password\n3. Choose which coins you want to manage in your wallet\n\nWould you like me to guide you through this process, or would you like to see a demo first?";
      } else if (lowerInput.includes('import') || lowerInput.includes('existing')) {
        responseContent = "To import an existing wallet, you'll need your seed phrase or private key. Aetherion supports wallet imports from most major blockchain platforms. Would you like to proceed with importing, or would you like more information about compatibility?";
      } else if (lowerInput.includes('security') || lowerInput.includes('protect')) {
        responseContent = "Aetherion wallets use quantum-resistant encryption to protect your assets. We recommend:\n\n1. Using a hardware wallet for large holdings\n2. Enabling multi-factor authentication\n3. Regularly backing up your wallet files\n4. Never sharing your seed phrase or private keys\n\nWould you like more detailed security recommendations?";
      } else {
        responseContent = "I can help you create a new wallet, import an existing one, or discuss wallet security features. What would you like to do?";
      }
    } else if (activeStep === 'mining') {
      if (lowerInput.includes('sing') || lowerInput.includes('singularity')) {
        responseContent = "Mining Singularity Coin (SING) as our Layer 1 token uses our Fractal Consensus algorithm which is more energy-efficient than traditional PoW. You'll need:\n\n1. A computer with at least 8GB RAM and a modern CPU\n2. The Aetherion Node software\n3. A SING wallet address\n\nWould you like me to help you set up SING mining?";
      } else if (lowerInput.includes('ftc') || lowerInput.includes('fractal')) {
        responseContent = "FractalCoin (FTC) mining contributes to our decentralized storage network. By mining FTC, you provide storage space and earn rewards for storing fractionally sharded data. The more reliable your node, the higher your rewards. Would you like to learn how to optimize your FTC mining setup?";
      } else if (lowerInput.includes('icon') || lowerInput.includes('ai')) {
        responseContent = "AICoin (ICON) mining is unique - instead of computing hashes, you contribute AI processing power to the Mysterion Network. Your computer helps train AI models, and you're rewarded with ICON tokens. This can be done even on modest hardware. Would you like to start contributing to the AI network?";
      } else if (lowerInput.includes('win') || lowerInput.includes('winnation')) {
        responseContent = "WinNation (WIN) mining is our governance token mining process. By running a validation node, you help secure the network and participate in governance decisions. WIN miners vote on protocol updates and ecosystem developments. Would you like to learn more about becoming a governance validator?";
      } else {
        responseContent = "I can explain mining processes for any of our ecosystem coins: Singularity Coin (SING), FractalCoin (FTC), AICoin (ICON), or WinNation (WIN). Which one interests you most?";
      }
    } else if (activeStep === 'blockchain-explorer') {
      if (lowerInput.includes('transaction') || lowerInput.includes('tx')) {
        responseContent = "To explore transactions, you can:\n\n1. Enter a transaction hash in the search bar\n2. View recent transactions on the main explorer page\n3. See transaction details including time, amount, sender, receiver, and status\n\nWould you like me to show you an example transaction?";
      } else if (lowerInput.includes('wallet') || lowerInput.includes('address')) {
        responseContent = "You can search for any wallet address to see:\n\n1. Current balance of all ecosystem tokens\n2. Transaction history\n3. Smart contracts associated with the address\n4. Wallet health score and security assessment\n\nWould you like to learn more about any of these features?";
      } else if (lowerInput.includes('network') || lowerInput.includes('stats')) {
        responseContent = "Our explorer provides real-time network statistics including:\n\n1. Transaction volume and count\n2. Active miners and validators\n3. Network security metrics\n4. Token distribution charts\n5. Gas fees and network congestion indicators\n\nWhich network statistics would you like to view?";
      } else {
        responseContent = "The blockchain explorer can help you find information about transactions, wallet addresses, or network statistics. What specific information are you looking for?";
      }
    } else if (activeStep === 'ico-participation') {
      if (lowerInput.includes('active') || lowerInput.includes('current')) {
        responseContent = "Current active ICOs in the Aetherion ecosystem include:\n\n1. QuantumChain - Quantum computing service platform\n2. EcoBlock - Sustainable energy tracking system\n3. DataVault - Decentralized data marketplace\n\nEach ICO has different participation requirements and token economics. Which one would you like more information about?";
      } else if (lowerInput.includes('process') || lowerInput.includes('how')) {
        responseContent = "To participate in an ICO:\n\n1. Navigate to the ICO section in your Aetherion wallet\n2. Complete KYC verification if required\n3. Select the amount of tokens you wish to purchase\n4. Choose your payment method (SING, FTC, or external currencies)\n5. Confirm the transaction\n\nTokens will appear in your wallet after the ICO concludes. Would you like to see a demonstration?";
      } else if (lowerInput.includes('risk') || lowerInput.includes('safe')) {
        responseContent = "All ICOs on Aetherion undergo a security audit and project verification process. However, as with any investment, there are risks involved. We recommend:\n\n1. Reading the project whitepaper thoroughly\n2. Researching the team members\n3. Investing only what you can afford to lose\n4. Diversifying your investments\n\nWould you like advice on evaluating a specific project?";
      } else {
        responseContent = "I can tell you about current active ICOs, walk you through the participation process, or discuss risk management for ICO investments. What would you like to know?";
      }
    } else if (activeStep === 'mysterion-network') {
      if (lowerInput.includes('participate') || lowerInput.includes('contribute')) {
        responseContent = "To contribute to the Mysterion Network:\n\n1. Navigate to the Mysterion section in your Aetherion wallet\n2. Set how much computing resources you want to contribute\n3. Choose which AI models you're willing to help train\n4. Start the Mysterion client\n\nYou'll earn ICON tokens based on your contribution level and time. Your computer will automatically process AI training jobs when idle. Would you like to start now?";
      } else if (lowerInput.includes('technical') || lowerInput.includes('how it works')) {
        responseContent = "The Mysterion Network uses a distributed approach to AI training:\n\n1. AI models are broken into micro-training tasks\n2. These tasks are distributed to network participants\n3. Results are verified and aggregated using a consensus mechanism\n4. Completed models are validated on specialized validator nodes\n\nThis approach allows for decentralized AI development without centralized hardware requirements. Would you like to learn about the encryption and privacy features?";
      } else if (lowerInput.includes('reward') || lowerInput.includes('earn')) {
        responseContent = "Rewards in the Mysterion Network are distributed based on:\n\n1. Computing power contributed (CPU/GPU time)\n2. Quality of training results\n3. Uptime and reliability of your node\n4. Duration of participation\n\nRewards are paid in ICON tokens, with bonus multipliers for long-term participants. The average home computer can earn approximately 2-5 ICON per day. Would you like to estimate your potential earnings?";
      } else {
        responseContent = "I can explain how to participate in the Mysterion Network, the technical details of how it works, or the reward structure for contributors. What aspect interests you most?";
      }
    } else {
      responseContent = "I'm here to help you learn about any aspect of the Aetherion ecosystem. What would you like to know more about?";
    }
    
    // Add assistant response
    const assistantMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: responseContent,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsProcessing(false);
    
    // Update active step if navigation occurred
    if (nextStep !== activeStep) {
      setActiveStep(nextStep);
    }
  };

  // Navigate directly to a specific topic
  const navigateToTopic = (stepId: string) => {
    const step = ONBOARDING_STEPS.find(s => s.id === stepId);
    if (!step) return;
    
    setActiveStep(stepId);
    
    // Add system message indicating the topic change
    const systemMessage: Message = {
      id: uuidv4(),
      role: 'system',
      content: `Navigating to topic: ${step.title}`,
      timestamp: new Date()
    };
    
    // Add assistant message with the step content
    const assistantMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: step.content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, systemMessage, assistantMessage]);
  };

  return (
    <div className="flex flex-col h-screen md:flex-row md:h-[calc(100vh-64px)]">
      {/* Left sidebar with tutorial panel - hidden on mobile unless toggled */}
      <div className={`md:w-80 bg-muted transition-all duration-300 ease-in-out ${showTutorialPanel ? 'h-1/3 md:h-auto' : 'h-12'} overflow-hidden`}>
        <div 
          className="flex items-center justify-between p-4 cursor-pointer bg-muted/90 sticky top-0"
          onClick={() => setShowTutorialPanel(!showTutorialPanel)}
        >
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            <h3 className="font-medium">Aetherion Tutorials</h3>
          </div>
          <ChevronRight className={`h-5 w-5 transition-transform duration-200 ${showTutorialPanel ? 'rotate-90' : ''}`} />
        </div>
        
        {showTutorialPanel && (
          <div className="p-4">
            <Accordion type="single" collapsible className="w-full">
              {ONBOARDING_STEPS.map((step) => (
                <AccordionItem value={step.id} key={step.id}>
                  <AccordionTrigger className={`${activeStep === step.id ? 'text-primary font-medium' : ''}`}>
                    <div className="flex items-center">
                      {step.id === 'welcome' && <HelpCircle className="h-4 w-4 mr-2" />}
                      {step.id === 'wallet-setup' && <Wallet className="h-4 w-4 mr-2" />}
                      {step.id === 'mining' && <Database className="h-4 w-4 mr-2" />}
                      {step.id === 'blockchain-explorer' && <PieChart className="h-4 w-4 mr-2" />}
                      {step.id === 'ico-participation' && <RefreshCw className="h-4 w-4 mr-2" />}
                      {step.id === 'mysterion-network' && <Brain className="h-4 w-4 mr-2" />}
                      {step.title}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => navigateToTopic(step.id)}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Explore this topic
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col p-4 md:p-6">
        <Card className="flex-1 overflow-hidden flex flex-col">
          <div className="bg-card p-4 border-b flex justify-between items-center">
            <div className="flex items-center">
              <Radio className="h-5 w-5 text-primary mr-2 animate-pulse" />
              <h2 className="text-xl font-semibold">Mysterion AI Assistant</h2>
            </div>
            <div>
              <Tabs defaultValue="chat">
                <TabsList>
                  <TabsTrigger value="chat">
                    <span className="hidden sm:inline">Chat with Assistant</span>
                    <span className="sm:hidden">Chat</span>
                  </TabsTrigger>
                  <TabsTrigger value="help">
                    <span className="hidden sm:inline">Help & Resources</span>
                    <span className="sm:hidden">Help</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="chat" className="flex flex-col h-full">
              <TabsContent value="chat" className="flex-1 overflow-hidden data-[state=active]:flex-1 data-[state=active]:flex data-[state=active]:flex-col">
                <ChatInterface
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isProcessing={isProcessing}
                  className="h-full border-0"
                />
              </TabsContent>
              
              <TabsContent value="help" className="p-4 space-y-4 overflow-auto max-h-full">
                <div>
                  <h3 className="text-lg font-medium mb-2">Quick Commands</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center"><code className="bg-muted p-1 rounded mr-2">/wallet</code> - Get help with wallet setup</li>
                    <li className="flex items-center"><code className="bg-muted p-1 rounded mr-2">/mining</code> - Learn about mining options</li>
                    <li className="flex items-center"><code className="bg-muted p-1 rounded mr-2">/explore</code> - Open blockchain explorer</li>
                    <li className="flex items-center"><code className="bg-muted p-1 rounded mr-2">/ico</code> - View active ICOs</li>
                    <li className="flex items-center"><code className="bg-muted p-1 rounded mr-2">/ai</code> - Learn about Mysterion Network</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">What can Mysterion help with?</h3>
                  <p className="text-muted-foreground mb-3">
                    The AI assistant can help you with:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center"><Shield className="h-4 w-4 text-primary mr-2" /> Security recommendations</li>
                    <li className="flex items-center"><Wallet className="h-4 w-4 text-primary mr-2" /> Wallet management</li>
                    <li className="flex items-center"><Database className="h-4 w-4 text-primary mr-2" /> Mining optimization</li>
                    <li className="flex items-center"><PieChart className="h-4 w-4 text-primary mr-2" /> Transaction analysis</li>
                    <li className="flex items-center"><Brain className="h-4 w-4 text-primary mr-2" /> AI contribution guidance</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AIAssistantOnboarding;
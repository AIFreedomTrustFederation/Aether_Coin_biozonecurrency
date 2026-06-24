import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Lightbulb, Database, Wallet, Code } from 'lucide-react';
// Use lightweight logo for fast initial rendering
import LightweightLogo from '@/components/common/LightweightLogo';
// Import the SimpleChatInterface component
import SimpleChatInterface from '../components/SimpleChatInterface';
// AIAssistant is already added globally in App.tsx - no need to import it here

const LandingPage: React.FC = () => {
  const [messages, setMessages] = useState<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Initialize with welcome message and prevent scrolling issues
  useEffect(() => {
    // Set initial scroll position to top immediately
    if (typeof window !== 'undefined') {
      // Ensure the page starts at the top immediately on mount
      window.scrollTo(0, 0);
      
      // Set overflow hidden on body initially to prevent scroll jumps
      document.body.style.overflow = 'hidden';
      
      // Re-enable scrolling after content is stabilized
      const timer = setTimeout(() => {
        document.body.style.overflow = '';
      }, 100);
      
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    }
    
    const welcomeMessage = {
      id: Date.now().toString(),
      role: 'assistant' as const,
      content: "Welcome to the Singularity! Where the past and future converge.",
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  }, []);
  
  const handleSendMessage = (message: string) => {
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    // Simulate AI response
    setTimeout(() => {
      // Generate response based on message content
      let response = '';
      
      if (message.toLowerCase().includes('singularity')) {
        response = "The Singularity is the theoretical point where artificial intelligence exceeds human intelligence, leading to an unpredictable future. Here at Aetherion, we're working to ensure that future is beneficial for humanity through secure blockchain technologies.";
      } else if (message.toLowerCase().includes('blockchain') || message.toLowerCase().includes('crypto')) {
        response = "Our quantum-resistant blockchain provides unparalleled security for your digital assets, protecting them against both current and future threats, including quantum computing attacks.";
      } else if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi') || message.toLowerCase().includes('hey')) {
        response = "Hello! I'm your Aetherion AI assistant. How can I help you navigate the convergence of past and future technologies today?";
      } else if (message.toLowerCase().includes('get started')) {
        response = "To get started, you can create a wallet, explore our quantum-resistant features, or learn about our Matrix integration for secure notifications. Would you like to know more about any of these options?";
      } else {
        response = "The convergence of past wisdom and future technology creates unlimited possibilities. How can I assist you in exploring the Aetherion ecosystem today?";
      }
      
      // Add AI response
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 1500);
  };
  
  // Add preloading of important route resources  
  useEffect(() => {
    // Preload critical resources for routes users are likely to navigate to
    const preloadRoutes = () => {
      // Create link elements for preloading
      const preloadLinks = [
        '/dashboard',
        '/wallet',
        '/bridge',
      ].map(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        link.as = 'document';
        return link;
      });

      // Append preload links to document head
      preloadLinks.forEach(link => document.head.appendChild(link));
    };

    // Preload after a short delay so initial page load isn't affected
    const timer = setTimeout(preloadRoutes, 2000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-indigo-900 text-white neon-scrollbar">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-24 flex flex-col items-center">
        {/* Use lightweight logo for faster initial render */}
        <div className="mb-4">
          <LightweightLogo size="xl" color="#aa00ff" />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 neon-glow neon-pulse" data-text="Aetherion">
          Aetherion
        </h1>
        <p className="text-xl md:text-2xl text-center mb-8 max-w-3xl text-gray-300 neon-glow">
          Pioneering the Quantum-Resistant Blockchain Ecosystem
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <Link href="/codester">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md text-lg flex items-center neon-button-advanced animate-pulse">
              <Code className="mr-2 h-5 w-5" />
              Try Codester IDE
            </Button>
          </Link>
          <Link href="/codester">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md text-lg flex items-center neon-button-advanced animate-pulse">
              <Code className="mr-2 h-5 w-5" />
              Try Codester IDE
            </Button>
          </Link>
          <Link href="/ai-assistant-onboarding">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg flex items-center neon-button-advanced">
              <Lightbulb className="mr-2 h-5 w-5" />
              AI Assistant Demo
            </Button>
          </Link>
          <Link href="/blockchain-explorer">
            <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400/10 px-6 py-3 rounded-md text-lg flex items-center neon-border">
              <Database className="mr-2 h-5 w-5" />
              Explore Blockchain
            </Button>
          </Link>
          <Link href="/wallet">
            <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400/10 px-6 py-3 rounded-md text-lg flex items-center neon-border">
              <Wallet className="mr-2 h-5 w-5" />
              Access Wallet
            </Button>
          </Link>
          <Link href="/portal">
            <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md text-lg flex items-center neon-button-advanced">
              <Database className="mr-2 h-5 w-5" />
              FractalCoin Portal
            </Button>
          </Link>
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 w-full max-w-6xl">
          <div className="bg-white/5 p-6 rounded-lg backdrop-blur-sm">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Quantum-Resistant Security</h3>
            <p className="text-gray-400">Protected against both current and future computational threats, including quantum attacks.</p>
          </div>
          
          <div className="bg-white/5 p-6 rounded-lg backdrop-blur-sm">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Enhanced Protection</h3>
            <p className="text-gray-400">Advanced AI continuously monitors transactions for suspicious activity and phishing attempts.</p>
          </div>
          
          <div className="bg-white/5 p-6 rounded-lg backdrop-blur-sm">
            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Open-Source Notifications</h3>
            <p className="text-gray-400">Secure communication through Matrix integration keeps you informed of important activity.</p>
          </div>
        </div>
        
        {/* Codester Feature Highlight */}
        <div className="w-full max-w-6xl mb-16 bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-8 rounded-lg border border-purple-500/20 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <div className="inline-flex items-center justify-center p-2 bg-purple-500/20 rounded-full mb-4">
                <Code className="h-5 w-5 text-purple-400 mr-2" />
                <span className="font-medium text-purple-400">NEW</span>
              </div>
              <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                Introducing Codester
              </h2>
              <p className="text-gray-300 mb-6">
                A Web3-native collaborative IDE for the next generation of blockchain developers. Write, collaborate, and deploy code with AI assistance and blockchain integration.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/codester">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md text-lg flex items-center neon-button-advanced">
                    <Code className="mr-2 h-5 w-5" />
                    Try Codester Now
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 rounded-lg overflow-hidden border border-purple-500/20">
              <div className="bg-black/50 p-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs text-gray-400">SmartContract.sol</div>
              </div>
              <div className="bg-black/70 p-4 h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <Code className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-gray-300">Web3-Native Collaborative IDE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Codester Feature Highlight */}
        <div className="w-full max-w-6xl mb-16 bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-8 rounded-lg border border-purple-500/20 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <div className="inline-flex items-center justify-center p-2 bg-purple-500/20 rounded-full mb-4">
                <Code className="h-5 w-5 text-purple-400 mr-2" />
                <span className="font-medium text-purple-400">NEW</span>
              </div>
              <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                Introducing Codester
              </h2>
              <p className="text-gray-300 mb-6">
                A Web3-native collaborative IDE for the next generation of blockchain developers. Write, collaborate, and deploy code with AI assistance and blockchain integration.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/codester">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md text-lg flex items-center neon-button-advanced">
                    <Code className="mr-2 h-5 w-5" />
                    Try Codester Now
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 rounded-lg overflow-hidden border border-purple-500/20">
              <div className="bg-black/50 p-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs text-gray-400">SmartContract.sol</div>
              </div>
              <div className="bg-black/70 p-4 h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <Code className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-gray-300">Web3-Native Collaborative IDE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chat Interface */}
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">AI Companion</h2>
          <SimpleChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
            autoFocus={false}
            placeholder="Ask about the Singularity..."
            className="bg-transparent border-white/20"
          />
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>Aetherion — Pioneering the Quantum-Resistant Blockchain Ecosystem</p>
          <p className="mt-2 text-sm">© {new Date().getFullYear()} Aetherion. All rights reserved.</p>
        </div>
      </footer>
      
      {/* AIAssistant is now added globally in App.tsx */}
    </div>
  );
};

export default LandingPage;
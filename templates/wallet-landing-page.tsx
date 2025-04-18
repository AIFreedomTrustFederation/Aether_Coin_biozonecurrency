import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '../client/src/components/ui/button';
import { Wallet, Shield, Zap, ArrowRight } from 'lucide-react';
// Use lightweight logo for fast initial rendering
import LightweightLogo from '../client/src/components/common/LightweightLogo';

const WalletLandingPage: React.FC = () => {
  // Initialize with scroll position management
  useEffect(() => {
    // Set initial scroll position to top immediately
    if (typeof window !== 'undefined') {
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
  }, []);
  
  // Add preloading of important route resources  
  useEffect(() => {
    // Preload critical resources for routes users are likely to navigate to
    const preloadRoutes = () => {
      // Create link elements for preloading
      const preloadLinks = [
        '/wallet',
        '/dashboard',
        '/transactions',
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
        
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 neon-glow neon-pulse" data-text="Aetherion Wallet">
          Aetherion Wallet
        </h1>
        <p className="text-xl md:text-2xl text-center mb-8 max-w-3xl text-gray-300 neon-glow">
          Secure, Quantum-Resistant Digital Asset Management
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <Link href="/wallet">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg flex items-center neon-button-advanced">
              <Wallet className="mr-2 h-5 w-5" />
              Create Wallet
            </Button>
          </Link>
          <Link href="/wallet?tab=backup-restore">
            <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400/10 px-6 py-3 rounded-md text-lg flex items-center neon-border">
              <Shield className="mr-2 h-5 w-5" />
              Backup & Restore
            </Button>
          </Link>
          <Link href="/wallet?tab=web3-connect">
            <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400/10 px-6 py-3 rounded-md text-lg flex items-center neon-border">
              <Zap className="mr-2 h-5 w-5" />
              Connect External Wallet
            </Button>
          </Link>
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 w-full max-w-6xl">
          <div className="bg-white/5 p-6 rounded-lg backdrop-blur-sm">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quantum-Resistant Security</h3>
            <p className="text-gray-400">Your assets are protected against both current and future computational threats, including quantum attacks.</p>
          </div>
          
          <div className="bg-white/5 p-6 rounded-lg backdrop-blur-sm">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-4">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Multi-Asset Support</h3>
            <p className="text-gray-400">Manage multiple cryptocurrencies and digital assets in one secure, easy-to-use interface.</p>
          </div>
          
          <div className="bg-white/5 p-6 rounded-lg backdrop-blur-sm">
            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Seamless Transactions</h3>
            <p className="text-gray-400">Send and receive assets with confidence through our intuitive and secure transaction system.</p>
          </div>
        </div>
        
        {/* Getting Started Section */}
        <div className="w-full max-w-4xl bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">Getting Started is Easy</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Create Your Wallet</h3>
              <p className="text-gray-400">Set up a new quantum-resistant wallet in just a few clicks</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Secure Your Keys</h3>
              <p className="text-gray-400">Backup your wallet with our advanced security features</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Start Transacting</h3>
              <p className="text-gray-400">Send, receive, and manage your digital assets securely</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/wallet">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-md text-lg flex items-center mx-auto">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>Aetherion Wallet — Secure, Quantum-Resistant Digital Asset Management</p>
          <p className="mt-2 text-sm">© {new Date().getFullYear()} Aetherion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default WalletLandingPage;
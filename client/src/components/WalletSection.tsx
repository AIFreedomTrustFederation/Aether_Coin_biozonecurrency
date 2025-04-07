import React from 'react';
import { Wallet, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

/**
 * WalletSection component
 * Displays wallet features and benefits
 */
const WalletSection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-primary/5 to-primary/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Secure Wallet <span className="text-primary">Integration</span>
            </h2>
            <p className="text-lg mb-6 text-muted-foreground">
              Experience the next generation of blockchain wallet technology with
              seamless integration, quantum-resistant security, and intuitive user controls.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card/50">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Multi-Chain Support</h3>
                  <p className="text-sm text-muted-foreground">Connect to multiple blockchains seamlessly</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card/50">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Advanced Security</h3>
                  <p className="text-sm text-muted-foreground">Quantum-resistant encryption standards</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card/50">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Easy Transactions</h3>
                  <p className="text-sm text-muted-foreground">Send and receive with minimal steps</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card/50">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Asset Management</h3>
                  <p className="text-sm text-muted-foreground">Track and manage all your tokens easily</p>
                </div>
              </div>
            </div>
            
            <Link href="/wallet">
              <a className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors">
                Connect Your Wallet <ArrowRight className="h-4 w-4" />
              </a>
            </Link>
          </div>
          
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md aspect-square">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/30 rounded-2xl transform rotate-3"></div>
              <div className="absolute inset-0 bg-card border border-border rounded-2xl shadow-lg flex items-center justify-center p-8">
                <div className="w-full max-w-xs">
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <div className="p-4 bg-primary/10 rounded-full">
                        <Wallet className="h-10 w-10 text-primary" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 bg-muted rounded-full mx-auto"></div>
                      <div className="h-3 w-1/2 bg-muted/70 rounded-full mx-auto"></div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="h-12 bg-muted/50 rounded-lg w-full"></div>
                      <div className="h-12 bg-primary rounded-lg w-full flex items-center justify-center text-white font-medium">
                        Connect
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-16 bg-muted/30 rounded-lg"></div>
                      <div className="h-16 bg-muted/30 rounded-lg"></div>
                      <div className="h-16 bg-muted/30 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WalletSection;
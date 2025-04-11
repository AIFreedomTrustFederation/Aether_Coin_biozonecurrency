import React from 'react';
import WhitepaperBrowser from '../WhitepaperBrowser';

const WhitepaperPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary/5 py-12">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-4xl font-bold mb-4">Aetherion & FractalCoin Whitepaper</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A comprehensive documentation of the Aetherion ecosystem, FractalCoin tokenomics, 
            and the quantum-resistant blockchain architecture.
          </p>
        </div>
      </div>
      
      <WhitepaperBrowser />
    </div>
  );
};

export default WhitepaperPage;
import React from "react";
import { motion } from "framer-motion";

const AboutSection = () => {
  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 md:order-1"
          >
            <div className="relative">
              {/* Background shape */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl blur-2xl"></div>
              
              {/* Main content */}
              <div className="relative aspect-square bg-card rounded-lg overflow-hidden shadow-lg border border-border/40">
                <div className="absolute inset-0 bg-gradient-to-br from-background to-background/80 z-10"></div>
                
                {/* Sacred geometry pattern */}
                <div className="sacred-rotate absolute inset-0 flex items-center justify-center opacity-10">
                  <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M50,5 L95,50 L50,95 L5,50 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M26,26 L74,26 L74,74 L26,74 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M50,5 L50,95 M5,50 L95,50" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M26,26 L74,74 M26,74 L74,26" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </svg>
                </div>
                
                {/* Content overlay */}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/30 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center quantum-pulse">
                        <span className="text-primary-foreground font-bold">ATC</span>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">Aetherion Token Chain</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The economic backbone of the AetherCore ecosystem
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                    <div className="bg-background/80 rounded border border-border/40 p-3">
                      <div className="text-primary font-bold">∞</div>
                      <div className="text-xs text-muted-foreground">Unlimited Supply</div>
                    </div>
                    <div className="bg-background/80 rounded border border-border/40 p-3">
                      <div className="text-primary font-bold">BTC</div>
                      <div className="text-xs text-muted-foreground">Backed Scarcity</div>
                    </div>
                    <div className="bg-background/80 rounded border border-border/40 p-3">
                      <div className="text-primary font-bold">USDC</div>
                      <div className="text-xs text-muted-foreground">Stability Reserve</div>
                    </div>
                    <div className="bg-background/80 rounded border border-border/40 p-3">
                      <div className="text-primary font-bold">4</div>
                      <div className="text-xs text-muted-foreground">Token System</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 md:order-2"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              About AetherCore
            </h2>
            
            <div className="space-y-4 text-muted-foreground">
              <p>
                AetherCore represents a revolutionary approach to blockchain technology, 
                designed from the ground up to address the limitations of current systems 
                while preparing for the challenges of tomorrow.
              </p>
              
              <p>
                Our unique FractalChain architecture replaces traditional blockchain with 
                a more efficient and scalable structure, while our integration of quantum-resistant 
                cryptography ensures security against emerging computational threats.
              </p>
              
              <p>
                The ecosystem features four purpose-specific tokens operating within an 
                innovative economic framework that balances unlimited issuance with Bitcoin-backed 
                scarcity, creating a system built to support humanity's expansion beyond Earth.
              </p>
              
              <p>
                With the integration of autonomous economic bots, AetherCore is pushing the 
                boundaries of what's possible in decentralized systems, enabling new forms of 
                value creation and exchange that benefit both individuals and communities.
              </p>
            </div>
            
            <div className="mt-8">
              <a 
                href="#technology"
                className="px-6 py-3 rounded-md font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition"
              >
                Explore Our Technology
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
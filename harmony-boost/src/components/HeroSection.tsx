
import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0 bio-pattern opacity-40" />
      
      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold">
              <span className="gradient-text">Biozoe</span> Currency for a{" "}
              <span className="gradient-text">Sustainable</span> Future
            </h1>
            
            <p className="text-lg text-muted-foreground md:pr-10">
              <Link to="/tokenomics" className="text-forest-600 hover:underline">Aether Coin</Link> is a revolutionary biozoecurrency designed to protect and preserve our planet's vital ecological zones. Unlike traditional eco-cryptocurrencies, our approach focuses on uniting the physical and spiritual aspects of life.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button className="bg-forest-600 hover:bg-forest-700 text-white" size="lg">
                Get Started
              </Button>
              <Button variant="outline" size="lg" className="border-forest-300 text-forest-700" asChild>
                <Link to="/tokenomics">View Tokenomics</Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-8 pt-6">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-forest-700">5+</span>
                <span className="text-sm text-muted-foreground">Biozone Projects</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-forest-700">15K+</span>
                <span className="text-sm text-muted-foreground">Community Members</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-forest-700">3+</span>
                <span className="text-sm text-muted-foreground">Biozoe Currencies</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full h-[450px] rounded-xl overflow-hidden shadow-xl animate-float">
              <div className="absolute inset-0 bg-gradient-radial from-forest-300/20 to-forest-600/40 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-[url('/src/assets/earth-pattern.png')] opacity-30 mix-blend-overlay"></div>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1680582517398-7c44ef845681?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="AI technology visualization" 
                className="w-full h-full object-cover rounded-xl mix-blend-overlay opacity-90"
              />
              <div className="absolute inset-0 ecosystem-border rounded-xl"></div>
              
              <div className="absolute bottom-6 left-6 right-6 glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-forest-800/80">AetherCoin Wallet</p>
                    <p className="text-xl font-bold text-forest-800">
                      <Link to="/wallet" className="text-forest-600 hover:underline">Quantum Secure</Link> Technology
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-forest-100 rounded-full text-forest-800 text-sm font-medium">
                    Connect Wallet
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

export default HeroSection;

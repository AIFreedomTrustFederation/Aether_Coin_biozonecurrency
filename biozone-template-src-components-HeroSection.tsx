import React from "react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="py-20 md:py-28 overflow-hidden cosmic-shift">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center md:text-left"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="convergence-text">
                AetherCore
              </span>
              <span className="block mt-2 neon-glow blueshift">Quantum-Resistant Blockchain</span>
            </h1>
            
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto md:mx-0">
              Experience the next generation of blockchain technology with AetherCore's 
              quantum-resistant security, BioZoe integration, and autonomous bot framework.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a 
                href="#features"
                className="px-6 py-3 rounded-md font-medium bg-[hsl(var(--redshift))] text-white hover:bg-[hsl(var(--redshift)/90%)] transition fractal-border"
              >
                Explore Features
              </a>
              <a 
                href="#"
                className="px-6 py-3 rounded-md font-medium bg-[hsl(var(--blueshift))] text-white hover:bg-[hsl(var(--blueshift)/90%)] transition"
              >
                Learn More
              </a>
            </div>
          </motion.div>
          
          {/* Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mt-10 md:mt-0"
          >
            <div className="w-full aspect-square relative">
              {/* Redshift-Blueshift effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[hsl(var(--redshift)/5%)] via-transparent to-[hsl(var(--blueshift)/5%)] aether-shift"></div>
              
              {/* Outer rotating circle */}
              <div className="sacred-rotate absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 rounded-full border-2 border-[hsl(var(--redshift)/50%)] opacity-30"></div>
              </div>
              
              {/* Middle rotating circle (opposite direction) */}
              <div className="sacred-rotate absolute inset-0 flex items-center justify-center" style={{ animationDirection: 'reverse' }}>
                <div className="w-64 h-64 rounded-full border-2 border-[hsl(var(--blueshift)/50%)] opacity-30"></div>
              </div>
              
              {/* Inner rotating circle */}
              <div className="sacred-rotate absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border-2 border-[hsl(var(--greenshift)/50%)] opacity-40"></div>
              </div>
              
              {/* Center element */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="quantum-pulse w-32 h-32 rounded-full bg-gradient-to-br from-[hsl(var(--redshift))] via-[hsl(var(--greenshift))] to-[hsl(var(--blueshift))] flex items-center justify-center text-white font-bold">
                  <div className="text-center">
                    <span className="block text-sm">AetherCore</span>
                    <span className="block text-xs mt-1">Quantum Secured</span>
                  </div>
                </div>
              </div>
              
              {/* Floating particles */}
              <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-[hsl(var(--redshift))] opacity-80 quantum-pulse"></div>
              <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-[hsl(var(--blueshift))] opacity-70 quantum-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-1/4 right-1/3 w-5 h-5 rounded-full bg-[hsl(var(--greenshift))] opacity-60 quantum-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-[hsl(var(--greenshift))] opacity-90 quantum-pulse" style={{ animationDelay: '1.5s' }}></div>
              
              {/* Light rays */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <div className="w-full h-0.5 bg-[hsl(var(--redshift))] sacred-rotate" style={{ transformOrigin: 'center', animationDuration: '20s' }}></div>
                <div className="w-full h-0.5 bg-[hsl(var(--blueshift))] sacred-rotate" style={{ transformOrigin: 'center', animationDirection: 'reverse', animationDuration: '25s' }}></div>
                <div className="w-0.5 h-full bg-[hsl(var(--greenshift))] sacred-rotate" style={{ transformOrigin: 'center', animationDuration: '30s' }}></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
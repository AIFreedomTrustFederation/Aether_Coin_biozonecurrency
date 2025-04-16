import React from "react";
import { motion } from "framer-motion";
import ParticleBackground from "./ParticleBackground";

const HeroSection = () => {
  return (
    <section className="py-20 md:py-28 overflow-hidden relative">
      {/* Interactive Particle Background */}
      <div className="absolute inset-0 -z-10">
        <ParticleBackground colorTheme="cosmic" interactive={true} density={40} />
      </div>
      
      {/* Gradient overlay for better text contrast */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/80 to-background/50"></div>
      
      <div className="container mx-auto px-4 relative z-10">
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
            
            {/* Multiplanetary tagline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="mt-8 inline-block px-4 py-2 rounded-full bg-background/40 backdrop-blur-sm border border-border/40"
            >
              <span className="text-sm">Supporting humanity's </span>
              <span className="text-sm font-semibold neon-glow greenshift">multiplanetary expansion</span>
            </motion.div>
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
              
              {/* Center element - planetoid design */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="quantum-pulse w-32 h-32 rounded-full bg-gradient-to-br from-[hsl(var(--redshift)/90%)] via-[hsl(var(--greenshift)/80%)] to-[hsl(var(--blueshift)/90%)] flex items-center justify-center text-white font-bold relative overflow-hidden">
                  {/* Planetary surface texture */}
                  <div className="absolute inset-0 opacity-30 sacred-rotate" style={{ animationDuration: '180s' }}>
                    <svg viewBox="0 0 100 100" width="100%" height="100%">
                      <defs>
                        <pattern id="planetGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.2" />
                        </pattern>
                      </defs>
                      <circle cx="50" cy="50" r="50" fill="url(#planetGrid)" />
                      
                      {/* Continent-like shapes */}
                      <path d="M30,40 Q40,20 60,30 Q80,40 70,60 Q60,80 40,70 Q20,60 30,40 Z" fill="white" fillOpacity="0.2" />
                      <path d="M20,30 Q30,20 40,30 Q45,40 30,45 Q15,40 20,30 Z" fill="white" fillOpacity="0.15" />
                      <path d="M60,60 Q70,55 75,65 Q70,75 60,70 Q55,65 60,60 Z" fill="white" fillOpacity="0.15" />
                    </svg>
                  </div>
                  
                  <div className="text-center relative z-10">
                    <span className="block text-sm">AetherCore</span>
                    <span className="block text-xs mt-1">Quantum Secured</span>
                  </div>
                </div>
              </div>
              
              {/* Orbiting moons/satellites */}
              <div className="absolute inset-0 sacred-rotate" style={{ animationDuration: '15s' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[hsl(var(--redshift))] opacity-80 quantum-pulse"></div>
              </div>
              
              <div className="absolute inset-0 sacred-rotate" style={{ animationDuration: '25s', animationDirection: 'reverse' }}>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[hsl(var(--blueshift))] opacity-70 quantum-pulse"></div>
              </div>
              
              <div className="absolute inset-0 sacred-rotate" style={{ animationDuration: '20s' }}>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[hsl(var(--greenshift))] opacity-60 quantum-pulse"></div>
              </div>
              
              <div className="absolute inset-0 sacred-rotate" style={{ animationDuration: '30s', animationDirection: 'reverse' }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white opacity-90 quantum-pulse"></div>
              </div>
              
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
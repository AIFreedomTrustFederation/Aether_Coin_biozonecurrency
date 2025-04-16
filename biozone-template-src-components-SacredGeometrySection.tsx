import React from "react";
import { motion } from "framer-motion";

const SacredGeometrySection = () => {
  return (
    <section id="sacred-geometry" className="py-20 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="sacred-rotate" style={{ animationDuration: '120s' }}>
          <svg viewBox="0 0 1000 1000" width="100%" height="100%">
            {/* Flower of Life pattern */}
            <g fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="500" cy="500" r="300" />
              <circle cx="500" cy="200" r="300" />
              <circle cx="500" cy="800" r="300" />
              <circle cx="200" cy="500" r="300" />
              <circle cx="800" cy="500" r="300" />
              <circle cx="300" cy="300" r="300" />
              <circle cx="700" cy="300" r="300" />
              <circle cx="300" cy="700" r="300" />
              <circle cx="700" cy="700" r="300" />
              <circle cx="500" cy="500" r="490" />
            </g>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold neon-glow greenshift"
          >
            Sacred Geometry Integration
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            The universal patterns that connect spiritual principles to mathematical precision
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
          {/* Fibonacci Spiral */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-card/30 backdrop-blur-sm p-6 rounded-lg border border-border/50 group hover:border-[hsl(var(--redshift)/30%)] transition-all"
          >
            <div className="aspect-square relative mb-4 overflow-hidden rounded-lg">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full sacred-rotate" style={{ animationDuration: '60s' }}>
                  <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <path 
                      d="M50,5 A45,45 0 0,1 95,50 A45,45 0 0,1 50,95 A45,45 0 0,1 5,50 A45,45 0 0,1 50,5 Z" 
                      fill="none" 
                      stroke="hsl(var(--redshift)/50%)" 
                      strokeWidth="0.5"
                    />
                    <path 
                      d="M50,18 A32,32 0 0,1 82,50 A32,32 0 0,1 50,82 A32,32 0 0,1 18,50 A32,32 0 0,1 50,18 Z" 
                      fill="none" 
                      stroke="hsl(var(--redshift)/50%)" 
                      strokeWidth="0.5"
                    />
                    <path 
                      d="M50,26 A24,24 0 0,1 74,50 A24,24 0 0,1 50,74 A24,24 0 0,1 26,50 A24,24 0 0,1 50,26 Z" 
                      fill="none" 
                      stroke="hsl(var(--redshift)/50%)" 
                      strokeWidth="0.5"
                    />
                    <path 
                      d="M50,34 A16,16 0 0,1 66,50 A16,16 0 0,1 50,66 A16,16 0 0,1 34,50 A16,16 0 0,1 50,34 Z" 
                      fill="none" 
                      stroke="hsl(var(--redshift)/50%)" 
                      strokeWidth="0.5"
                    />
                    <path 
                      d="M50,42 A8,8 0 0,1 58,50 A8,8 0 0,1 50,58 A8,8 0 0,1 42,50 A8,8 0 0,1 50,42 Z" 
                      fill="none" 
                      stroke="hsl(var(--redshift)/50%)" 
                      strokeWidth="0.5"
                    />
                    
                    {/* Fibonacci spiral */}
                    <path 
                      d="M50,50 Q74,26 90,50 T50,90 T10,50 T50,10 T90,50" 
                      fill="none" 
                      stroke="hsl(var(--redshift))" 
                      strokeWidth="0.8"
                      className="group-hover:stroke-[hsl(var(--redshift))]"
                    />
                  </svg>
                </div>
                
                {/* Center element */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--redshift)/15%)] border border-[hsl(var(--redshift)/30%)] quantum-pulse"></div>
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-2 neon-glow redshift">Fibonacci Sequence</h3>
            <p className="text-muted-foreground">
              The divine proportion found throughout nature, representing the expansion phase in our economic model. Each number is the sum of the two preceding ones, creating infinite growth patterns.
            </p>
          </motion.div>
          
          {/* Metatron's Cube */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card/30 backdrop-blur-sm p-6 rounded-lg border border-border/50 group hover:border-[hsl(var(--greenshift)/30%)] transition-all"
          >
            <div className="aspect-square relative mb-4 overflow-hidden rounded-lg">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full sacred-rotate" style={{ animationDuration: '90s' }}>
                  <svg viewBox="0 0 100 100" width="100%" height="100%">
                    {/* Metatron's Cube */}
                    <g fill="none" stroke="hsl(var(--greenshift)/40%)">
                      {/* Center hexagon */}
                      <path d="M50,30 L70,40 L70,60 L50,70 L30,60 L30,40 Z" strokeWidth="0.5" />
                      
                      {/* Outer hexagon */}
                      <path d="M50,10 L85,30 L85,70 L50,90 L15,70 L15,30 Z" strokeWidth="0.5" />
                      
                      {/* Inner connections */}
                      <line x1="50" y1="30" x2="50" y2="10" strokeWidth="0.5" />
                      <line x1="70" y1="40" x2="85" y2="30" strokeWidth="0.5" />
                      <line x1="70" y1="60" x2="85" y2="70" strokeWidth="0.5" />
                      <line x1="50" y1="70" x2="50" y2="90" strokeWidth="0.5" />
                      <line x1="30" y1="60" x2="15" y2="70" strokeWidth="0.5" />
                      <line x1="30" y1="40" x2="15" y2="30" strokeWidth="0.5" />
                      
                      {/* Inner circles */}
                      <circle cx="50" cy="50" r="25" strokeWidth="0.8" className="group-hover:stroke-[hsl(var(--greenshift))]" />
                      <circle cx="50" cy="30" r="5" strokeWidth="0.5" />
                      <circle cx="70" cy="40" r="5" strokeWidth="0.5" />
                      <circle cx="70" cy="60" r="5" strokeWidth="0.5" />
                      <circle cx="50" cy="70" r="5" strokeWidth="0.5" />
                      <circle cx="30" cy="60" r="5" strokeWidth="0.5" />
                      <circle cx="30" cy="40" r="5" strokeWidth="0.5" />
                      
                      {/* Outer circles */}
                      <circle cx="50" cy="10" r="5" strokeWidth="0.5" />
                      <circle cx="85" cy="30" r="5" strokeWidth="0.5" />
                      <circle cx="85" cy="70" r="5" strokeWidth="0.5" />
                      <circle cx="50" cy="90" r="5" strokeWidth="0.5" />
                      <circle cx="15" cy="70" r="5" strokeWidth="0.5" />
                      <circle cx="15" cy="30" r="5" strokeWidth="0.5" />
                    </g>
                  </svg>
                </div>
                
                {/* Center element */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--greenshift)/15%)] border border-[hsl(var(--greenshift)/30%)] quantum-pulse"></div>
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-2 neon-glow greenshift">Metatron's Cube</h3>
            <p className="text-muted-foreground">
              Contains all the Platonic solids, representing the balance of forces in our economic system. This sacred geometry structure embodies the convergence of expansion and contraction.
            </p>
          </motion.div>
          
          {/* Torus Field */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-card/30 backdrop-blur-sm p-6 rounded-lg border border-border/50 group hover:border-[hsl(var(--blueshift)/30%)] transition-all"
          >
            <div className="aspect-square relative mb-4 overflow-hidden rounded-lg">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full sacred-rotate" style={{ animationDirection: 'reverse', animationDuration: '75s' }}>
                  <svg viewBox="0 0 100 100" width="100%" height="100%">
                    {/* Torus field approximation */}
                    <g fill="none" stroke="hsl(var(--blueshift)/40%)">
                      <ellipse cx="50" cy="50" rx="40" ry="40" strokeWidth="0.5" />
                      <ellipse cx="50" cy="50" rx="40" ry="15" strokeWidth="0.5" />
                      <ellipse cx="50" cy="50" rx="40" ry="20" strokeWidth="0.5" />
                      <ellipse cx="50" cy="50" rx="40" ry="25" strokeWidth="0.5" />
                      <ellipse cx="50" cy="50" rx="40" ry="30" strokeWidth="0.5" />
                      <ellipse cx="50" cy="50" rx="40" ry="35" strokeWidth="0.5" />
                      
                      <ellipse cx="50" cy="50" rx="15" ry="40" strokeWidth="0.5" />
                      <ellipse cx="50" cy="50" rx="20" ry="40" strokeWidth="0.5" />
                      <ellipse cx="50" cy="50" rx="25" ry="40" strokeWidth="0.5" />
                      <ellipse cx="50" cy="50" rx="30" ry="40" strokeWidth="0.5" />
                      <ellipse cx="50" cy="50" rx="35" ry="40" strokeWidth="0.5" />
                      
                      {/* Center torus */}
                      <ellipse cx="50" cy="50" rx="30" ry="10" strokeWidth="0.8" className="group-hover:stroke-[hsl(var(--blueshift))]" />
                    </g>
                  </svg>
                </div>
                
                {/* Center element */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--blueshift)/15%)] border border-[hsl(var(--blueshift)/30%)] quantum-pulse"></div>
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-2 neon-glow blueshift">Torus Field</h3>
            <p className="text-muted-foreground">
              Representing the contraction and conservation of energy in our system. The self-sustaining flow of the torus mirrors how our economic death cycles protect and preserve value.
            </p>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 max-w-3xl mx-auto text-center"
        >
          <p className="text-muted-foreground">
            The AetherCore system incorporates these sacred geometric principles to create a 
            harmonious economic framework that follows the same divine patterns found throughout 
            the cosmos, from the smallest cell to the largest galaxy.
          </p>
          
          <div className="mt-8">
            <a 
              href="#technology"
              className="px-6 py-3 rounded-md font-medium bg-[hsl(var(--greenshift))] text-white hover:bg-[hsl(var(--greenshift)/90%)] transition"
            >
              Explore Our Technology
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SacredGeometrySection;
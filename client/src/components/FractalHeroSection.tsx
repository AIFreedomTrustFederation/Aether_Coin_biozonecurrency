import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FractalHeroSection = () => {
  return (
    <section className="py-20 md:py-28 overflow-hidden relative">
      {/* Fractal/Mandelbrot set background pattern */}
      <div className="absolute inset-0 bg-black opacity-90 z-0"></div>
      
      {/* Animated fractal patterns */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="fractal-mandelbrot absolute top-0 left-0 w-full h-full"></div>
        </div>
      </div>
      
      {/* Red/Blue shift gradients */}
      <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-red-950 via-red-700 to-transparent opacity-40 z-0 redshift-animation"></div>
      <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-blue-950 via-blue-700 to-transparent opacity-40 z-0 blueshift-animation"></div>
      <div className="absolute top-0 left-0 right-0 mx-auto h-full w-1/3 bg-gradient-to-t from-transparent via-forest-600 to-transparent opacity-20 z-0 greenshift-pulse"></div>
      
      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-xl"
            >
              <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 text-white">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-forest-500 to-blue-400">
                  Fractal Economics
                </span> for Quantum Growth
              </h1>
              
              <p className="text-xl text-gray-300 mb-8">
                <span className="text-forest-400 font-medium">Aether Coin (ATC)</span> combines the mathematical perfection of fractal patterns with economic principles that scale infinitely—from quantum to cosmic—while <span className="text-gray-200 italic">biozoecurrency</span> reveals the spiritual dimensions within.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-red-600 via-forest-600 to-blue-600 hover:from-red-700 hover:via-forest-700 hover:to-blue-700 text-white border-none">
                  Explore Tokenomics
                </Button>
                <Button variant="outline" size="lg" className="border-forest-400 text-forest-400 hover:bg-forest-900/20">
                  <Link to="/whitepaper">View Whitepaper</Link>
                </Button>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center relative"
          >
            <div className="w-full max-w-md aspect-square relative">
              {/* Seed of Life Pattern */}
              <div className="absolute inset-0 seed-of-life opacity-70"></div>
              
              {/* Merkle Tree Growth Visualization */}
              <div className="absolute inset-0 merkle-tree-pattern opacity-40"></div>
              
              {/* Central Aether Coin */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-36 h-36 rounded-full bg-gradient-to-r from-red-500 via-forest-500 to-blue-500 flex items-center justify-center p-1">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-forest-500 to-blue-400">ATC</span>
                  </div>
                </div>
              </div>
              
              {/* Orbiting Particles */}
              <div className="absolute inset-0">
                <div className="w-full h-full orbit-particles"></div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Fractal Key Metrics */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-gradient-to-r from-red-900/50 to-red-900/30 backdrop-blur-sm rounded-lg p-6 border border-red-700/30"
          >
            <div className="text-xl font-bold text-gray-200 mb-1">Redshift Territory</div>
            <div className="text-3xl font-bold text-red-400 mb-2">21M</div>
            <div className="text-sm text-gray-400">Bitcoin-backed reserve for infinite expansion</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="bg-gradient-to-r from-red-900/30 to-forest-900/40 backdrop-blur-sm rounded-lg p-6 border border-forest-700/30"
          >
            <div className="text-xl font-bold text-gray-200 mb-1">Fractal Coefficient</div>
            <div className="text-3xl font-bold text-forest-400 mb-2">1.618</div>
            <div className="text-sm text-gray-400">Golden ratio expansion multiplier</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="bg-gradient-to-r from-forest-900/40 to-blue-900/30 backdrop-blur-sm rounded-lg p-6 border border-forest-700/30"
          >
            <div className="text-xl font-bold text-gray-200 mb-1">Merkle Depth</div>
            <div className="text-3xl font-bold text-forest-400 mb-2">256</div>
            <div className="text-sm text-gray-400">Quantum-secured transaction layers</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="bg-gradient-to-r from-blue-900/30 to-blue-900/50 backdrop-blur-sm rounded-lg p-6 border border-blue-700/30"
          >
            <div className="text-xl font-bold text-gray-200 mb-1">Blueshift Horizon</div>
            <div className="text-3xl font-bold text-blue-400 mb-2">∞</div>
            <div className="text-sm text-gray-400">Multiplanetary expansion capacity</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FractalHeroSection;
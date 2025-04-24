import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const SacredGeometrySection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-950 to-black text-white overflow-hidden relative">
      {/* Animated background patterns */}
      <div className="absolute inset-0 z-0 opacity-20 sacred-geometry-pattern"></div>
      
      <div className="container relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-forest-500 to-blue-400">
                Sacred Geometry 
              </span>
              of ATC Economics
            </h2>
            <p className="text-lg text-gray-400">
              The mathematical patterns that govern both universe formation and 
              <span className="text-forest-400 mx-1">Aether Coin's</span>
              economic system—revealing the unified field where science, spirituality and economics converge
            </p>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-red-950/80 to-red-900/20 backdrop-blur-sm border-red-900/30 overflow-hidden h-full">
              <CardContent className="p-0">
                <div className="pt-6 px-6 pb-0">
                  <div className="w-20 h-20 mx-auto rounded-full bg-red-900/30 border border-red-700/30 flex items-center justify-center mb-6 fibonacci-spiral overflow-hidden">
                    <div className="fibonacci-shape opacity-80"></div>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-forest-400">
                    Fibonacci Economics
                  </h3>
                  <p className="text-gray-400 mb-6 text-center">
                    ATC supply follows a Fibonacci sequence that mirrors natural growth patterns, ensuring balanced expansion without hyperinflation
                  </p>
                </div>
                <div className="p-6 bg-red-950/30 border-t border-red-900/30 flex justify-between items-center">
                  <div className="text-2xl font-bold text-red-400">φ</div>
                  <div className="text-sm text-gray-500">1, 1, 2, 3, 5, 8, 13, 21, 34...</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-forest-950/80 to-forest-900/20 backdrop-blur-sm border-forest-900/30 overflow-hidden h-full">
              <CardContent className="p-0">
                <div className="pt-6 px-6 pb-0">
                  <div className="w-20 h-20 mx-auto rounded-full bg-forest-900/30 border border-forest-700/30 flex items-center justify-center mb-6 merkle-root overflow-hidden">
                    <div className="merkle-root-shape opacity-80"></div>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-forest-400 to-forest-500">
                    Merkle-Tree Verification
                  </h3>
                  <p className="text-gray-400 mb-6 text-center">
                    Fractal cryptographic structures secure each ATC transaction through recursive mathematical proofs, maximizing security while minimizing data
                  </p>
                </div>
                <div className="p-6 bg-forest-950/30 border-t border-forest-900/30 flex justify-between items-center">
                  <div className="text-2xl font-bold text-forest-400">&#8704;</div>
                  <div className="text-sm text-gray-500">O(log n) verification complexity</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-blue-950/80 to-blue-900/20 backdrop-blur-sm border-blue-900/30 overflow-hidden h-full">
              <CardContent className="p-0">
                <div className="pt-6 px-6 pb-0">
                  <div className="w-20 h-20 mx-auto rounded-full bg-blue-900/30 border border-blue-700/30 flex items-center justify-center mb-6 mandelbrot-set overflow-hidden">
                    <div className="mandelbrot-shape opacity-80"></div>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-forest-400">
                    Mandelbrot Economics
                  </h3>
                  <p className="text-gray-400 mb-6 text-center">
                    Self-similar patterns scale infinitely, allowing <span className="italic">biozoecurrency</span> principles to manifest at every level from micro to macro economies
                  </p>
                </div>
                <div className="p-6 bg-blue-950/30 border-t border-blue-900/30 flex justify-between items-center">
                  <div className="text-2xl font-bold text-blue-400">z<sub>n+1</sub> = z<sub>n</sub><sup>2</sup>+c</div>
                  <div className="text-sm text-gray-500">Infinite recursive expansion</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative"
          >
            <div className="aspect-square w-full max-w-md mx-auto rounded-full border border-forest-800/30 p-1 relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-forest-900/20 to-blue-900/40"></div>
                <div className="absolute inset-0 torus-field opacity-30"></div>
                <div className="absolute inset-0 flower-of-life opacity-40"></div>
              </div>
              
              <div className="z-10 text-center p-8">
                <h3 className="text-2xl font-bold mb-4 text-forest-400">Divine Convergence</h3>
                <p className="text-gray-400 mb-6">
                  Where spiritual <span className="italic text-forest-300">βίος-ζωή</span> principles meet mathematical perfection, revealing the Kingdom economics hidden within fundamental universal structures
                </p>
                <Button className="bg-gradient-to-r from-red-600 via-forest-600 to-blue-600 border-none">
                  <Link to="/whitepaper">Explore Whitepaper</Link>
                </Button>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <h3 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-forest-500 to-blue-400">
              The Mathematics of Divine Expansion
            </h3>
            
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-red-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-200 mb-1">Redshift Economics</h4>
                  <p className="text-gray-400">
                    Using Bitcoin as the foundational scarcity, Aether Coin anchors to BTC backing while allowing infinite expansion—just as redshift in astronomy indicates expansion away from a fixed point
                  </p>
                </div>
              </li>
              
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-forest-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-3 h-3 bg-forest-500 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-200 mb-1">Green Shift Stabilization</h4>
                  <p className="text-gray-400">
                    The convergence point between expansion and stability, maintaining equilibrium through FractalCoin's toroidal economic flows that balance growth with sustainability
                  </p>
                </div>
              </li>
              
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-200 mb-1">Blueshift Recursion</h4>
                  <p className="text-gray-400">
                    Implementing recursive fractal patterns that enable the system to scale beyond planetary boundaries while maintaining mathematical harmony—mirroring how blueshift indicates cosmic contraction
                  </p>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SacredGeometrySection;
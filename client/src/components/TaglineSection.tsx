import React from "react";
import { motion } from "framer-motion";
import { Zap, Globe, Orbit, Infinity, Scale } from "lucide-react";

const TaglineSection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-black via-forest-950 to-black overflow-hidden relative">
      {/* Subtle animated background pattern */}
      <div className="absolute inset-0 tagline-pattern opacity-10"></div>
      
      {/* Animated light beams */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-red-500/0 via-forest-500/30 to-blue-500/0 transform -translate-y-1/2 light-beam-animation"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-blue-500/0 via-forest-400/20 to-red-500/0 transform -translate-y-1/2 light-beam-animation-reverse"></div>
      </div>
      
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="text-center mb-12"
        >
          <p className="text-lg md:text-xl lg:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-forest-300 to-blue-300 font-medium leading-relaxed">
            Welcome to <span className="font-bold text-white">AetherCore Technologies</span> by AI Freedom Trust, 
            where ancient wisdom and future innovation converge in the <span className="italic text-forest-300">Eternal Now</span>
          </p>
          
          <p className="mt-2 text-sm md:text-base text-gray-400 max-w-4xl mx-auto">
            Introducing <span className="text-forest-400 font-medium">biozoecurrency</span> — a revolutionary Fractalchain system that transcends traditional Blockchain limitations. 
            Our pioneering economic framework unites infinite potential with sustainable principles, 
            balancing technological advancement with timeless wisdom to create a harmonious financial ecosystem 
            designed for humanity's boundless future across the cosmos.
          </p>
        </motion.div>

        {/* Staggered Image Grid with Cosmic Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          {/* First Row - Staggered Layout */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center md:mt-20"
          >
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-forest-900 to-forest-700 p-0.5 shadow-glow-sm">
              <div className="h-full w-full rounded-full bg-gradient-to-br from-forest-800 to-forest-900 flex items-center justify-center">
                <Zap className="h-8 w-8 text-forest-400" />
              </div>
            </div>
            <h3 className="text-forest-400 font-medium mt-3 mb-1">Fractalchain Technology</h3>
            <p className="text-gray-400 text-sm text-center">
              Beyond blockchain - a self-replicating economic structure that mirrors cosmic patterns of growth
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col items-center md:mb-16"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-forest-500/20 to-water-500/20 rounded-2xl blur-xl"></div>
              <div className="h-60 w-full bg-gradient-to-br from-forest-900 to-forest-950 rounded-2xl relative overflow-hidden border border-forest-700/30">
                <div className="absolute inset-0 opacity-30 bg-[url('/src/assets/earth-pattern.png')] bg-cover"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-4 text-center">
                  <p className="text-forest-300 text-sm font-medium mb-1">πᾶς ἐν πᾶσιν</p>
                  <p className="text-xs text-gray-400">All in All - Universal Principle</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center md:mt-12"
          >
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-water-900 to-water-700 p-0.5 shadow-glow-sm">
              <div className="h-full w-full rounded-full bg-gradient-to-br from-water-800 to-water-900 flex items-center justify-center">
                <Globe className="h-8 w-8 text-water-400" />
              </div>
            </div>
            <h3 className="text-water-400 font-medium mt-3 mb-1">Biospheric Integration</h3>
            <p className="text-gray-400 text-sm text-center">
              Economic systems that respect and enhance planetary life systems across multiple worlds
            </p>
          </motion.div>

          {/* Second Row - Staggered Images */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col items-center md:mb-16"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-water-500/20 to-blue-500/20 rounded-2xl blur-xl"></div>
              <div className="h-60 w-full bg-gradient-to-br from-water-900 to-water-950 rounded-2xl relative overflow-hidden border border-water-700/30">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-water-500/20 via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-water-950 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-4 text-center">
                  <p className="text-water-300 text-sm font-medium mb-1">ζωή (zoē)</p>
                  <p className="text-xs text-gray-400">Divine Life Principle</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col items-center md:mt-24"
          >
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 p-0.5 shadow-glow-sm">
              <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-800 to-blue-900 flex items-center justify-center">
                <Infinity className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <h3 className="text-blue-400 font-medium mt-3 mb-1">Infinite Expansion</h3>
            <p className="text-gray-400 text-sm text-center">
              Backed by Bitcoin's scarcity while enabling unlimited growth for multiplanetary civilization
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col items-center md:mb-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-forest-500/20 rounded-2xl blur-xl"></div>
              <div className="h-60 w-full bg-gradient-to-br from-red-900 to-red-950 rounded-2xl relative overflow-hidden border border-red-700/30">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/20 via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-red-950 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-4 text-center">
                  <p className="text-red-300 text-sm font-medium mb-1">βίος (bios)</p>
                  <p className="text-xs text-gray-400">Material Life Principle</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default TaglineSection;
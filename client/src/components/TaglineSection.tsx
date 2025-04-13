import React from "react";
import { motion } from "framer-motion";

const TaglineSection = () => {
  return (
    <section className="py-6 bg-gradient-to-r from-black via-forest-950 to-black overflow-hidden relative">
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
          className="text-center"
        >
          <p className="text-lg md:text-xl lg:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-forest-300 to-blue-300 font-medium leading-relaxed">
            Welcome to <span className="font-bold text-white">AetherCore Technologies</span> by AI Freedom Trust, 
            where ancient wisdom and future innovation converge in the <span className="italic text-forest-300">Eternal Now</span>
          </p>
          
          <p className="mt-2 text-sm md:text-base text-gray-400 max-w-4xl mx-auto">
            Introducing <span className="text-forest-400 font-medium">biozoecurrency</span> — a revolutionary Fractalchain system that transcends traditional Blockchain limitations. 
            Our pioneering economic framework unites infinite potential with sustainable principles, 
            balancing technological advancement with timeless wisdom to create a harmonious financial ecosystem 
            designed for humanity's boundless future.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default TaglineSection;
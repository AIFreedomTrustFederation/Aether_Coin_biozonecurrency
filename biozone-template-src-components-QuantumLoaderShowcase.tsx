import React, { useState } from "react";
import { motion } from "framer-motion";
import QuantumLoader from "./QuantumLoader";
import { cn } from "../lib/utils";

const QuantumLoaderShowcase = () => {
  const [activeLoader, setActiveLoader] = useState<"orbital" | "pulse" | "convergence">("orbital");
  const [activeSize, setActiveSize] = useState<"small" | "medium" | "large">("medium");
  const [showPercentage, setShowPercentage] = useState(false);

  const loaderTypes = [
    { id: "orbital", name: "Orbital", description: "Particles orbit in perfect harmony" },
    { id: "pulse", name: "Pulse", description: "Expansion and contraction cycles" },
    { id: "convergence", name: "Convergence", description: "Elements unify at a central point" },
  ] as const;

  const sizes = [
    { id: "small", name: "Small" },
    { id: "medium", name: "Medium" },
    { id: "large", name: "Large" },
  ] as const;

  return (
    <section id="quantum-loader" className="py-20 bg-card/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold neon-glow blueshift"
          >
            Quantum Loading States
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Visualizing the cosmic principles in loading interactions
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Loader Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card/30 backdrop-blur-sm p-8 rounded-xl border border-border/40 flex items-center justify-center min-h-[300px]"
          >
            <QuantumLoader 
              type={activeLoader} 
              size={activeSize} 
              loaderText={`${activeLoader.charAt(0).toUpperCase() + activeLoader.slice(1)} Loading`}
              showPercentage={showPercentage}
            />
          </motion.div>
          
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-2xl font-medium mb-6 convergence-text">Loader Configuration</h3>
            
            <div className="space-y-8">
              {/* Loader Type Selection */}
              <div>
                <h4 className="text-lg font-medium mb-3">Loader Type:</h4>
                <div className="grid grid-cols-3 gap-3">
                  {loaderTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setActiveLoader(type.id)}
                      className={cn(
                        "py-2 px-3 rounded-md border transition-all",
                        "hover:border-primary",
                        activeLoader === type.id
                          ? "border-primary bg-primary/10"
                          : "border-border/40"
                      )}
                    >
                      <span className="block font-medium">{type.name}</span>
                      <span className="block text-xs text-muted-foreground mt-1">{type.description}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Size Selection */}
              <div>
                <h4 className="text-lg font-medium mb-3">Size:</h4>
                <div className="flex space-x-4">
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setActiveSize(size.id)}
                      className={cn(
                        "py-2 px-4 rounded-md border transition-all",
                        "hover:border-primary",
                        activeSize === size.id
                          ? "border-primary bg-primary/10"
                          : "border-border/40"
                      )}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Options */}
              <div>
                <h4 className="text-lg font-medium mb-3">Options:</h4>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPercentage}
                    onChange={() => setShowPercentage(!showPercentage)}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span>Show progress percentage</span>
                </label>
              </div>
              
              <div className="pt-4">
                <p className="text-muted-foreground">
                  These quantum loaders represent the cosmic principles of redshift, blueshift, and greenshift, 
                  visualizing the expansion, contraction, and convergence processes that drive the AetherCore system.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground max-w-3xl mx-auto">
            The loading states embody the philosophical framework of the AetherCore system, where opposing 
            cosmic forces interact and converge to create a harmonious balance.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default QuantumLoaderShowcase;
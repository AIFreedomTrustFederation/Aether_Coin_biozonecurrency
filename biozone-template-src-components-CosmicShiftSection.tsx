import React from "react";
import { motion } from "framer-motion";

const CosmicShiftSection = () => {
  return (
    <section id="cosmic-shift" className="py-20 bg-gradient-to-b from-background/90 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold convergence-text"
          >
            Cosmic Convergence
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            The AetherCore system balances opposing cosmic forces through the integration of
            redshift and blueshift principles, converging to a harmonious greenshift state.
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto aspect-[16/9] cosmic-shift rounded-xl overflow-hidden shadow-lg border border-border/20"
        >
          {/* Background stars */}
          <div className="absolute inset-0 bg-black">
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 2 + 1}px`,
                  height: `${Math.random() * 2 + 1}px`,
                  opacity: Math.random() * 0.7 + 0.3,
                  animation: `pulse ${Math.random() * 3 + 2}s infinite alternate`
                }}
              />
            ))}
          </div>
          
          {/* Cosmic visualization */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full max-w-2xl max-h-64 mx-auto">
              {/* Redshift sphere (left) */}
              <motion.div
                initial={{ x: -50, opacity: 0.5 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 rounded-full"
                style={{ 
                  background: "radial-gradient(circle, hsl(var(--redshift)) 0%, hsl(var(--redshift)/0) 70%)",
                  filter: "blur(5px)"
                }}
              />
              
              {/* Blueshift sphere (right) */}
              <motion.div
                initial={{ x: 50, opacity: 0.5 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 rounded-full"
                style={{ 
                  background: "radial-gradient(circle, hsl(var(--blueshift)) 0%, hsl(var(--blueshift)/0) 70%)",
                  filter: "blur(5px)"
                }}
              />
              
              {/* Greenshift sphere (center - appears as convergence) */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 rounded-full z-10"
                style={{ 
                  background: "radial-gradient(circle, hsl(var(--greenshift)) 0%, hsl(var(--greenshift)/0) 70%)",
                  filter: "blur(4px)"
                }}
              />
              
              {/* Connection lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <motion.path
                  d="M20,50 L80,50"
                  stroke="white"
                  strokeWidth="0.2"
                  strokeDasharray="1 2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 0.3 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.8 }}
                />
                <motion.path
                  d="M20,50 C40,70 60,30 80,50"
                  stroke="white"
                  strokeWidth="0.3"
                  strokeDasharray="1 2"
                  fill="none"
                  initial={{ opacity: 0, pathLength: 0 }}
                  whileInView={{ opacity: 0.4, pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, delay: 1 }}
                />
              </svg>
              
              {/* Labels */}
              <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white text-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="neon-glow redshift text-sm md:text-base font-medium"
                >
                  Redshift
                </motion.div>
              </div>
              
              <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white text-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="neon-glow blueshift text-sm md:text-base font-medium"
                >
                  Blueshift
                </motion.div>
              </div>
              
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 1.5 }}
                  className="neon-glow greenshift text-sm md:text-base font-medium mt-8"
                >
                  Convergence
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Information overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-black/0 p-4 md:p-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 1.8 }}
              className="text-center text-white"
            >
              <p className="text-sm md:text-base">
                BioZoe currency embodies this cosmic balance, creating a sustainable economic system
              </p>
            </motion.div>
          </div>
        </motion.div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-5 bg-[hsl(var(--redshift)/10%)] rounded-lg border border-[hsl(var(--redshift)/20%)]"
          >
            <h3 className="text-lg font-semibold neon-glow redshift mb-2">Expansion Phase</h3>
            <p className="text-muted-foreground text-sm">
              Represents the Bitcoin-backed infinite token issuance model that enables continuous economic expansion
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="p-5 bg-[hsl(var(--blueshift)/10%)] rounded-lg border border-[hsl(var(--blueshift)/20%)]"
          >
            <h3 className="text-lg font-semibold neon-glow blueshift mb-2">Contraction Phase</h3>
            <p className="text-muted-foreground text-sm">
              Embodies the death cycle protected by USDC reserves to safeguard against market volatility
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="p-5 bg-[hsl(var(--greenshift)/10%)] rounded-lg border border-[hsl(var(--greenshift)/20%)]"
          >
            <h3 className="text-lg font-semibold neon-glow greenshift mb-2">Equilibrium State</h3>
            <p className="text-muted-foreground text-sm">
              The resurrection cycle where balance is restored, creating a sustainable economic framework
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CosmicShiftSection;
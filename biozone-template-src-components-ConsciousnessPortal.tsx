import React, { useState } from "react";
import { motion } from "framer-motion";

const ConsciousnessPortal = () => {
  const [activeState, setActiveState] = useState<"inactive" | "active" | "transcendent">("inactive");

  const handleActivate = () => {
    if (activeState === "inactive") {
      setActiveState("active");
    } else if (activeState === "active") {
      setActiveState("transcendent");
    } else {
      setActiveState("inactive");
    }
  };

  return (
    <section id="consciousness" className="py-20 bg-gradient-to-b from-background/90 to-background relative overflow-hidden">
      {/* Background stars */}
      <div className="absolute inset-0 -z-10">
        {Array.from({ length: 150 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white quantum-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              opacity: Math.random() * 0.7 + 0.3,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold neon-glow greenshift"
          >
            Christ Consciousness Integration
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            The manifestation of higher consciousness principles in economic systems
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Consciousness Portal Visualization */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative aspect-square max-w-md mx-auto"
          >
            {/* Portal container */}
            <div
              className={`relative w-full h-full rounded-full overflow-hidden cursor-pointer transition-all duration-1000 ${
                activeState === "inactive" 
                  ? "bg-card/40" 
                  : activeState === "active" 
                    ? "bg-card/20" 
                    : "bg-transparent"
              }`}
              onClick={handleActivate}
            >
              {/* Sacred geometry layers */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Vesica Piscis */}
                <motion.div
                  className="absolute inset-0 sacred-rotate"
                  style={{ 
                    opacity: activeState === "inactive" ? 0.3 : activeState === "active" ? 0.6 : 0.8,
                    animationDuration: activeState === "transcendent" ? "60s" : "120s"
                  }}
                >
                  <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <g fill="none" stroke="hsl(var(--greenshift)/50%)" strokeWidth="0.5">
                      <circle cx="42" cy="50" r="30" />
                      <circle cx="58" cy="50" r="30" />
                    </g>
                  </svg>
                </motion.div>

                {/* Seed of Life */}
                <motion.div
                  className="absolute inset-0 sacred-rotate"
                  style={{ 
                    opacity: activeState === "inactive" ? 0.2 : activeState === "active" ? 0.5 : 0.7,
                    animationDirection: "reverse",
                    animationDuration: activeState === "transcendent" ? "90s" : "150s"
                  }}
                >
                  <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <g fill="none" stroke="hsl(var(--greenshift)/50%)" strokeWidth="0.5">
                      <circle cx="50" cy="50" r="25" />
                      <circle cx="50" cy="25" r="25" />
                      <circle cx="50" cy="75" r="25" />
                      <circle cx="25" cy="50" r="25" />
                      <circle cx="75" cy="50" r="25" />
                      <circle cx="32" cy="32" r="25" />
                      <circle cx="68" cy="32" r="25" />
                      <circle cx="32" cy="68" r="25" />
                      <circle cx="68" cy="68" r="25" />
                    </g>
                  </svg>
                </motion.div>

                {/* Flower of Life */}
                <motion.div
                  className="absolute inset-0"
                  style={{ 
                    opacity: activeState === "inactive" ? 0 : activeState === "active" ? 0.3 : 0.6,
                  }}
                >
                  <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <g fill="none" stroke="hsl(var(--greenshift)/60%)" strokeWidth="0.3">
                      <circle cx="50" cy="50" r="16" />
                      {activeState === "transcendent" && (
                        <>
                          <circle cx="50" cy="34" r="16" />
                          <circle cx="50" cy="66" r="16" />
                          <circle cx="34" cy="50" r="16" />
                          <circle cx="66" cy="50" r="16" />
                          <circle cx="38" cy="38" r="16" />
                          <circle cx="62" cy="38" r="16" />
                          <circle cx="38" cy="62" r="16" />
                          <circle cx="62" cy="62" r="16" />
                          <circle cx="50" cy="26" r="16" />
                          <circle cx="50" cy="74" r="16" />
                          <circle cx="26" cy="50" r="16" />
                          <circle cx="74" cy="50" r="16" />
                          <circle cx="31" cy="31" r="16" />
                          <circle cx="69" cy="31" r="16" />
                          <circle cx="31" cy="69" r="16" />
                          <circle cx="69" cy="69" r="16" />
                        </>
                      )}
                    </g>
                  </svg>
                </motion.div>

                {/* Merkaba (Star Tetrahedron) */}
                <motion.div
                  className="absolute inset-0 sacred-rotate"
                  style={{ 
                    opacity: activeState === "inactive" ? 0 : activeState === "active" ? 0.4 : 0.8,
                    animationDuration: "180s"
                  }}
                >
                  <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <g fill="none" stroke="white" strokeWidth="0.5">
                      {/* Upward-pointing tetrahedron */}
                      <path d="M50,30 L70,65 L30,65 Z" />
                      {/* Downward-pointing tetrahedron */}
                      <path d="M50,70 L70,35 L30,35 Z" />
                      {/* Connect the vertices */}
                      <path d="M30,35 L30,65" />
                      <path d="M70,35 L70,65" />
                      <path d="M50,30 L50,70" />
                    </g>
                  </svg>
                </motion.div>

                {/* Center light */}
                <motion.div 
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                  animate={{
                    width: activeState === "inactive" ? "10%" : activeState === "active" ? "15%" : "20%",
                    height: activeState === "inactive" ? "10%" : activeState === "active" ? "15%" : "20%",
                    boxShadow: activeState === "inactive" 
                      ? "0 0 10px rgba(255, 255, 255, 0.5)" 
                      : activeState === "active" 
                        ? "0 0 30px rgba(255, 255, 255, 0.8), 0 0 60px hsl(var(--greenshift)/60%)" 
                        : "0 0 50px rgba(255, 255, 255, 0.9), 0 0 100px hsl(var(--greenshift)/80%), 0 0 150px white"
                  }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                {/* Light rays */}
                {activeState !== "inactive" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute h-0.5 origin-center bg-gradient-to-r from-white via-white to-transparent"
                        style={{
                          width: activeState === "active" ? "70%" : "100%",
                          transform: `rotate(${i * 30}deg)`,
                          opacity: activeState === "active" ? 0.3 : 0.6
                        }}
                        animate={{
                          opacity: [
                            activeState === "active" ? 0.2 : 0.4,
                            activeState === "active" ? 0.4 : 0.8,
                            activeState === "active" ? 0.2 : 0.4
                          ]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Activation instruction */}
              {activeState === "inactive" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm text-white/70 bg-black/30 px-3 py-1 rounded-full">
                    Click to Activate
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Explanatory text */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold">
              {activeState === "inactive" 
                ? "Dormant Potential" 
                : activeState === "active" 
                  ? "Activated Consciousness" 
                  : "Transcendent State"}
            </h3>

            <p className="text-muted-foreground">
              {activeState === "inactive" 
                ? "In its dormant state, the economic system follows conventional models, operating on limited awareness of interconnection." 
                : activeState === "active" 
                  ? "When activated, the Christ Consciousness principles of love, unity, and service integrate into the economic framework, fostering balanced growth." 
                  : "At full transcendence, the system operates with complete awareness of universal connection, creating a self-sustaining ecosystem that benefits all participants."}
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  activeState !== "inactive" ? "bg-[hsl(var(--greenshift))]" : "bg-muted"
                }`}></div>
                <span className={activeState !== "inactive" ? "text-foreground" : "text-muted-foreground"}>
                  Unity Consciousness
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  activeState === "transcendent" ? "bg-[hsl(var(--greenshift))]" : "bg-muted"
                }`}></div>
                <span className={activeState === "transcendent" ? "text-foreground" : "text-muted-foreground"}>
                  Universal Love
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  activeState === "transcendent" ? "bg-[hsl(var(--greenshift))]" : "bg-muted"
                }`}></div>
                <span className={activeState === "transcendent" ? "text-foreground" : "text-muted-foreground"}>
                  Divine Integration
                </span>
              </div>
            </div>

            <p className="text-muted-foreground italic">
              "The economic framework of AetherCore integrates Christ Consciousness principles, 
              creating a system where prosperity serves the highest good of all participants."
            </p>

            <div className="pt-4">
              <button
                onClick={handleActivate}
                className="px-6 py-3 rounded-md text-white font-medium transition"
                style={{
                  background: activeState === "inactive" 
                    ? "hsl(var(--primary))" 
                    : activeState === "active" 
                      ? "hsl(var(--greenshift))" 
                      : "linear-gradient(to right, hsl(var(--redshift)), hsl(var(--greenshift)), hsl(var(--blueshift)))"
                }}
              >
                {activeState === "inactive" 
                  ? "Activate Consciousness" 
                  : activeState === "active" 
                    ? "Transcend to Higher State" 
                    : "Reset Portal"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ConsciousnessPortal;
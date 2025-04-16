import React from "react";
import { motion } from "framer-motion";
import { Shield, Cpu, Bot, RefreshCw, Zap, Lock } from "lucide-react";
import { cn } from "../lib/utils";

const features = [
  {
    icon: <Shield className="h-8 w-8 text-primary" />,
    title: "Quantum-Resistant Security",
    description: "Post-quantum cryptographic algorithms that protect against future quantum computing threats."
  },
  {
    icon: <Cpu className="h-8 w-8 text-primary" />,
    title: "FractalChain Architecture",
    description: "Revolutionary chain structure that enables efficient scaling and improved consensus mechanisms."
  },
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: "Autonomous Bot Framework",
    description: "Advanced AI-driven bots that facilitate economic activities and self-fund operations."
  },
  {
    icon: <RefreshCw className="h-8 w-8 text-primary" />,
    title: "Death & Resurrection Cycles",
    description: "Market volatility protection through innovative reserve mechanisms and USDC integration."
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: "Multiplanetary Expansion",
    description: "Economic framework designed to support humanity's expansion beyond Earth."
  },
  {
    icon: <Lock className="h-8 w-8 text-primary" />,
    title: "AetherSphere Security",
    description: "Zero-trust decentralized security framework with continuous identity verification."
  }
];

const FeatureSection = () => {
  return (
    <section id="features" className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold"
          >
            Key Features
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Discover the innovative technologies powering the AetherCore ecosystem
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className={cn(
                "p-6 rounded-lg border border-border/40",
                "bg-card/80 backdrop-blur-sm",
                "hover:shadow-md hover:border-primary/40 transition"
              )}
            >
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
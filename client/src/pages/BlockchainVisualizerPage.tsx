import React from 'react';
import { Helmet } from 'react-helmet';
import ConceptVisualizer from '@/components/blockchain/ConceptVisualizer';
import { motion } from 'framer-motion';

const BlockchainVisualizerPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Blockchain Visualizer | Aetherion</title>
        <meta name="description" content="Interactive visualization of blockchain concepts like consensus mechanisms, smart contracts, quantum security, and fractal sharding in Singularity Coin." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Interactive Blockchain Concept Visualizer</h1>
            <p className="text-muted-foreground mt-2">
              Explore the key concepts behind Singularity Coin and understand how our quantum-secure blockchain works
            </p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <ConceptVisualizer />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-semibold mb-4">Understanding the Core Technology</h2>
          <p className="mb-4">
            Singularity Coin is built on a foundation of advanced blockchain technologies that go beyond
            traditional blockchain design. Our visualizer helps demonstrate these complex concepts in an
            accessible way.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-2">Quantum Security First</h3>
              <p className="text-sm">
                Our blockchain uses post-quantum cryptographic algorithms that are resistant to attacks 
                from both classical and quantum computers, ensuring your assets remain secure in the 
                quantum computing era.
              </p>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-2">Fractal Recursive Scaling</h3>
              <p className="text-sm">
                Unlike traditional blockchain sharding, our fractal recursive approach allows for
                unlimited scaling while maintaining security properties across all layers, enabling
                higher transaction throughput without compromising decentralization.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default BlockchainVisualizerPage;
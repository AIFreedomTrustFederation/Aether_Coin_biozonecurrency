import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NodeMarketplace from "@/components/NodeMarketplace";
import { Helmet } from "react-helmet";

/**
 * NodeMarketplace Page
 * 
 * This page provides the interface for deploying SaaS applications on the
 * FractalCoin node network and earning rewards through resource contributions.
 */
const NodeMarketplacePage: React.FC = () => {
  return (
    <main className="min-h-screen flex flex-col">
      <Helmet>
        <title>FractalCoin Node Marketplace | Aetherion</title>
        <meta 
          name="description" 
          content="Deploy your SaaS applications on our secure, decentralized node network. Earn rewards in Filecoin, FractalCoin, and AICoin as the network expands."
        />
      </Helmet>
      
      <Navbar />
      
      <div className="flex-grow">
        <NodeMarketplace />
      </div>
      
      <Footer />
    </main>
  );
};

export default NodeMarketplacePage;
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NodeMarketplaceComponent from "@/components/NodeMarketplace";

/**
 * NodeMarketplace Page
 * 
 * This page provides the interface for deploying SaaS applications on the
 * FractalCoin node network and earning rewards through resource contributions.
 */
const NodeMarketplace: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <NodeMarketplaceComponent />
      </main>
      
      <Footer />
    </div>
  );
};

export default NodeMarketplace;
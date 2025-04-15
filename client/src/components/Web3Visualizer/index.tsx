import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Network, 
  Database, 
  Lock, 
  Box, 
  Dna, 
  Atom
} from "lucide-react";
import BlockchainVisualizer from "./BlockchainVisualizer";
import SmartContractVisualizer from "./SmartContractVisualizer";
import ZeroKnowledgeVisualizer from "./ZeroKnowledgeVisualizer";
import ConsensusVisualizer from "./ConsensusVisualizer";

/**
 * Web3Visualizer - An interactive tool for visualizing Web3 concepts
 * 
 * This component provides interactive visualizations for key blockchain
 * and Web3 concepts to help users understand the underlying technology.
 */
const Web3Visualizer = () => {
  const [activeTab, setActiveTab] = useState("blockchain");
  
  // Visualizations for different concepts
  const visualizations = [
    {
      id: "blockchain",
      title: "Blockchain Structure",
      description: "Explore how blocks form a chain with cryptographic links",
      icon: <Box className="h-5 w-5" />,
      component: <BlockchainVisualizer />
    },
    {
      id: "smart-contracts",
      title: "Smart Contracts",
      description: "Visualize how smart contracts execute on the blockchain",
      icon: <Database className="h-5 w-5" />,
      component: <SmartContractVisualizer />
    },
    {
      id: "zero-knowledge",
      title: "Zero-Knowledge Proofs",
      description: "See how you can prove knowledge without revealing information",
      icon: <Lock className="h-5 w-5" />,
      component: <ZeroKnowledgeVisualizer />
    },
    {
      id: "consensus",
      title: "Consensus Mechanisms",
      description: "Understand how nodes reach agreement in a decentralized network",
      icon: <Network className="h-5 w-5" />,
      component: <ConsensusVisualizer />
    }
  ];
  
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center p-1 px-3 mb-4 border border-forest-200 rounded-full bg-forest-50 dark:bg-forest-900/30">
            <Atom className="w-4 h-4 mr-2 text-forest-600 dark:text-forest-400" />
            <span className="text-xs font-medium text-forest-600 dark:text-forest-400">Interactive Learning</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Visualize <span className="gradient-text">Web3 Concepts</span>
          </h2>
          <p className="text-muted-foreground">
            Explore the fundamental technologies behind blockchain and Web3 through
            interactive visualizations that make complex concepts easy to understand.
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <Card className="border-forest-100 dark:border-gray-800">
            <CardHeader className="bg-forest-50 dark:bg-gray-800/50 border-b border-forest-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Web3 Concept Visualizer</CardTitle>
                  <CardDescription>Select a concept to explore interactively</CardDescription>
                </div>
                <Dna className="h-8 w-8 text-forest-600 dark:text-forest-400" />
              </div>
            </CardHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="px-6 pt-6">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {visualizations.map(vis => (
                    <TabsTrigger 
                      key={vis.id}
                      value={vis.id}
                      className="flex items-center gap-2"
                    >
                      {vis.icon}
                      <span className="hidden md:inline">{vis.title}</span>
                      <span className="md:hidden">{vis.id.split("-")[0]}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              <CardContent className="p-6">
                {visualizations.map(vis => (
                  <TabsContent key={vis.id} value={vis.id} className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-medium">{vis.title}</h3>
                        <p className="text-muted-foreground">{vis.description}</p>
                      </div>
                    </div>
                    
                    {/* Visualization area */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-2 md:p-4 min-h-[400px] flex items-center justify-center">
                      {vis.component}
                    </div>
                    
                    {/* Controls */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button variant="outline" size="sm">
                        Reset
                      </Button>
                      <Button variant="outline" size="sm">
                        Step Forward
                      </Button>
                      <Button variant="outline" size="sm">
                        Auto-Play
                      </Button>
                      <Button variant="outline" size="sm">
                        Detailed Explanation
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </CardContent>
            </Tabs>
          </Card>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-4">
              These visualizations are designed to help you understand the core concepts 
              behind decentralized technologies that power the Aetherion ecosystem. 
              For more detailed information, check out our documentation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Web3Visualizer;
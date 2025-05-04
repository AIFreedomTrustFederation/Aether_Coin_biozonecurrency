import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, Database, Network, Lock, Server, Share2, 
  Cpu, LineChart, BarChart2, Layers, Fingerprint,
  Leaf, Zap, CircleDashed
} from "lucide-react";

interface TechnologyCard {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface TechnologyCategory {
  id: string;
  name: string;
  description: string;
  technologies: TechnologyCard[];
}

const technologies: TechnologyCategory[] = [
  {
    id: "core",
    name: "Core Blockchain Technology",
    description: "Fundamental blockchain systems powering our ecosystem",
    technologies: [
      {
        title: "Quantum Resistance",
        description: "Post-quantum cryptographic algorithms that secure our blockchain against quantum computing attacks.",
        icon: <Shield className="h-10 w-10 text-forest-600" />
      },
      {
        title: "Biozoe Validation",
        description: "Ecological validation mechanisms that tie cryptocurrency operations to real-world environmental impact.",
        icon: <Leaf className="h-10 w-10 text-forest-600" />
      },
      {
        title: "Fractal Economics",
        description: "Mathematical models based on fractal geometry that create natural scaling patterns for sustainable growth.",
        icon: <CircleDashed className="h-10 w-10 text-forest-600" />
      },
      {
        title: "Breath Authentication",
        description: "Revolutionary biometric authentication using breath patterns for secure wallet access.",
        icon: <Fingerprint className="h-10 w-10 text-forest-600" />
      }
    ]
  },
  {
    id: "infrastructure",
    name: "Blockchain Infrastructure",
    description: "Robust systems supporting our blockchain ecosystem",
    technologies: [
      {
        title: "Validator Network",
        description: "Distributed validator infrastructure designed to secure transactions with consensus mechanisms.",
        icon: <Cpu className="h-10 w-10 text-forest-600" />
      },
      {
        title: "Fractal Storage",
        description: "Decentralized storage solutions optimized for blockchain data with fractal compression.",
        icon: <Database className="h-10 w-10 text-forest-600" />
      },
      {
        title: "Chain API Gateway",
        description: "Unified API interface for seamless integration of our blockchain services into third-party applications.",
        icon: <Server className="h-10 w-10 text-forest-600" />
      },
      {
        title: "Smart Contract Platform",
        description: "Advanced smart contract execution environment with quantum-resistant security features.",
        icon: <Layers className="h-10 w-10 text-forest-600" />
      }
    ]
  },
  {
    id: "advanced",
    name: "Advanced Capabilities",
    description: "Cutting-edge blockchain features and ecosystem capabilities",
    technologies: [
      {
        title: "Cross-Chain Integration",
        description: "Communication protocols enabling secure interaction between different blockchain ecosystems.",
        icon: <Network className="h-10 w-10 text-forest-600" />
      },
      {
        title: "Tokenomics Dashboard",
        description: "Visual analytics platform providing transparent insights into cryptocurrency economics and performance.",
        icon: <BarChart2 className="h-10 w-10 text-forest-600" />
      },
      {
        title: "Zero-Knowledge Proofs",
        description: "Cryptographic methods allowing transaction verification without revealing sensitive information.",
        icon: <Lock className="h-10 w-10 text-forest-600" />
      },
      {
        title: "Lightning Network",
        description: "Layer-2 scaling solution providing near-instant transactions with minimal fees.",
        icon: <Zap className="h-10 w-10 text-forest-600" />
      }
    ]
  }
];

const TechnologyPage = () => {
  return (
    <div className="container py-12">
      <div className="space-y-6 mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold">
          <span className="gradient-text">Quantum-Resistant</span> Blockchain Technology
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Explore the advanced blockchain technologies and infrastructure that power the Aetherion ecosystem. We're committed to developing and deploying quantum-resistant, ecologically-focused solutions that are both secure and sustainable.
        </p>
      </div>
      
      <Tabs defaultValue="core" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3">
          {technologies.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {technologies.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-2xl font-display font-bold mb-2">{category.name}</h2>
              <p className="text-muted-foreground">{category.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {category.technologies.map((tech, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                    {tech.icon}
                    <div>
                      <CardTitle>{tech.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{tech.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="mt-16 pt-8 border-t">
        <h2 className="text-2xl font-display font-bold mb-4 text-center">Our Technology Principles</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="text-center space-y-4">
            <div className="mx-auto bg-forest-100 text-forest-700 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold">Quantum-Resistant</h3>
            <p className="text-muted-foreground">
              We design all our blockchain technologies to withstand attacks from quantum computers, ensuring long-term security.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="mx-auto bg-forest-100 text-forest-700 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Leaf className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold">Ecologically Sound</h3>
            <p className="text-muted-foreground">
              Our biozoe currencies directly impact environmental preservation, making every transaction contribute to planetary health and spiritual well-being.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="mx-auto bg-forest-100 text-forest-700 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <CircleDashed className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold">Fractal Economics</h3>
            <p className="text-muted-foreground">
              We embrace natural scaling patterns found in fractal mathematics, creating sustainable growth that mirrors nature's own design.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnologyPage;
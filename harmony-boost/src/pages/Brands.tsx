import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

interface BrandCard {
  name: string;
  description: string;
  subdomain: string;
  technologies: string[];
  imageUrl: string;
}

const brands: BrandCard[] = [
  {
    name: "Aether Coin",
    description: "A biozoecurrency designed to protect and preserve our planet's vital ecological zones through blockchain technology",
    subdomain: "atc.aifreedomtrust.com",
    technologies: ["Blockchain", "Quantum Resistance", "Ecological Conservation"],
    imageUrl: "https://images.unsplash.com/photo-1516918656725-e9b3ae9ee7a4?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Fractal Coin",
    description: "A recursive fractal-based currency system that scales according to natural growth patterns",
    subdomain: "fractalcoin.aifreedomtrust.com",
    technologies: ["Fractal Economics", "Recursive Tokenomics", "Natural Scaling"],
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Biozone Currency",
    description: "The inverse of traditional eco-cryptocurrencies, focusing on direct ecological impact through token transactions",
    subdomain: "biozone.aifreedomtrust.com",
    technologies: ["Biozone Protection", "Ecological Impact", "Sustainable Finance"],
    imageUrl: "https://images.unsplash.com/photo-1586974710160-55f48f417990?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Aetherion Wallet",
    description: "Quantum-resistant wallet for securely storing and managing your Aether, Fractal, and Biozone coins",
    subdomain: "wallet.aifreedomtrust.com",
    technologies: ["Quantum Security", "Multi-coin Support", "Decentralized Storage"],
    imageUrl: "https://images.unsplash.com/photo-1566401920284-acd2a35ade6e?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Aetherion DApp",
    description: "Decentralized application for interacting with the Aetherion blockchain ecosystem",
    subdomain: "dapp.aifreedomtrust.com",
    technologies: ["Decentralized Applications", "Smart Contracts", "Web3 Integration"],
    imageUrl: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Quantum Validator",
    description: "Quantum-secure validation network for the Aetherion blockchain ecosystem",
    subdomain: "validator.aifreedomtrust.com",
    technologies: ["Quantum Cryptography", "Validator Network", "Post-Quantum Security"],
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Fractal Reserve",
    description: "Revolutionary backing mechanism for cryptocurrencies based on fractal mathematics and natural scaling",
    subdomain: "reserve.aifreedomtrust.com",
    technologies: ["Fractal Economics", "Reserve Management", "Algorithmic Stability"],
    imageUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Harmony Boost",
    description: "Platform for harmonizing the various technologies within the Aetherion ecosystem",
    subdomain: "harmony.aifreedomtrust.com",
    technologies: ["Cross-chain Integration", "Ecosystem Harmony", "Interoperability"],
    imageUrl: "https://images.unsplash.com/photo-1511376777868-611b54f68947?auto=format&fit=crop&w=800&q=80"
  }
];

const BrandsPage = () => {
  return (
    <div className="container py-12">
      <div className="space-y-6 mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold">
          <span className="gradient-text">Aetherion</span> Ecosystem
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Explore our quantum-resistant blockchain ecosystem built around biozoecurrencies. Each platform operates on its own subdomain and provides specialized services within the Aetherion network.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="h-48 overflow-hidden">
              <img 
                src={brand.imageUrl} 
                alt={brand.name} 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <CardHeader>
              <CardTitle>{brand.name}</CardTitle>
              <CardDescription>
                <a 
                  href={`https://${brand.subdomain}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-forest-600 hover:underline flex items-center"
                >
                  {brand.subdomain} <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{brand.description}</p>
              <div className="flex flex-wrap gap-2">
                {brand.technologies.map((tech, techIndex) => (
                  <span 
                    key={techIndex}
                    className="px-2 py-1 bg-forest-100 text-forest-700 rounded-full text-xs font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <a 
                  href={`https://${brand.subdomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  Visit Site <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-display font-bold mb-4">Want to participate in the Aetherion Ecosystem?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          If you're interested in becoming a validator, developer, or ecosystem partner in the Aetherion network, we'd love to hear from you.
        </p>
        <Button className="bg-forest-600 hover:bg-forest-700">
          Join the Network
        </Button>
      </div>
    </div>
  );
};

export default BrandsPage;
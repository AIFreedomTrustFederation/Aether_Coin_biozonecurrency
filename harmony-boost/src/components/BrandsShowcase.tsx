import React from "react";
import { motion } from "framer-motion";
import { subdomainLinks } from "./EcosystemLinks";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface BrandCardProps {
  brand: {
    name: string;
    subdomain: string;
    path: string;
    icon: React.ReactNode;
    description?: string;
    tagline?: string;
    color?: string;
  };
  index: number;
}

const BrandCard: React.FC<BrandCardProps> = ({ brand, index }) => {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={variants}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden border-t-4" style={{ borderTopColor: brand.color || "#3b82f6" }}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {brand.icon}
              <CardTitle>{brand.name}</CardTitle>
            </div>
          </div>
          {brand.tagline && (
            <CardDescription>{brand.tagline}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-muted-foreground">
            {brand.description || `Visit the ${brand.name} portal for the full experience.`}
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full gap-2" variant="outline">
            <a
              href={`https://${brand.subdomain}${brand.path}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit {brand.name} <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

// Enhanced brand information
const enhancedBrands = [
  {
    ...subdomainLinks[0], // Aether Coin
    description: "The quantum-resistant utility token powering the next generation of secure blockchain applications.",
    tagline: "Quantum-secure blockchain platform",
    color: "#38a169",
  },
  {
    ...subdomainLinks[1], // FractalCoin
    description: "Fractal-based economic scaling for sustainable growth and wealth creation through recursive systems.",
    tagline: "Fractal economics for exponential growth",
    color: "#8b5cf6",
  },
  {
    ...subdomainLinks[4], // Biozoe Portal
    description: "Explore the integration of temporal life (βίος) and eternal spirit (ζωή) through consciousness technology.",
    tagline: "Where biology meets spiritual technology",
    color: "#ec4899",
  },
  {
    ...subdomainLinks[2], // Quantum Wallet
    description: "Securely store and manage your Aetherion ecosystem assets with quantum-resistant encryption.",
    tagline: "Your secure gateway to the Aetherion ecosystem",
    color: "#3b82f6",
  },
  {
    ...subdomainLinks[3], // AetherDApp
    description: "Build and deploy decentralized applications on the quantum-secure Aetherion blockchain.",
    tagline: "Decentralized applications with quantum security",
    color: "#f59e0b",
  },
  {
    ...subdomainLinks[5], // AI Freedom Trust
    description: "The organization behind the Aetherion ecosystem, dedicated to building ethical AI and blockchain technology.",
    tagline: "Building ethical technology for humanity",
    color: "#6366f1",
  },
];

const BrandsShowcase: React.FC = () => {
  return (
    <section className="py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
            AI Freedom Trust <span className="gradient-text">Ecosystem</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our family of brands working together to build the future of secure, ethical blockchain and AI technology.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enhancedBrands.map((brand, index) => (
            <BrandCard key={index} brand={brand} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsShowcase;
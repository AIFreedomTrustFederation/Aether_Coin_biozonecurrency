import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Sparkles, Database, Brain, Shield, Code, Globe, ExternalLink, Coins } from 'lucide-react';
import { SiEthereum } from 'react-icons/si';
import { subdomainLinks } from './EcosystemLinks';

// Brand card interface
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

// Brand card component
const BrandCard: React.FC<BrandCardProps> = ({ brand, index }) => {
  const delay = `delay-${(index % 5) * 100}`;
  const brandColor = brand.color || 'bg-forest-600';
  const hoverColor = brand.color?.replace('bg-', 'hover:bg-').replace('-600', '-700') || 'hover:bg-forest-700';
  
  const getSubdomainUrl = () => {
    // Find the matching subdomain link by name
    const subdomainLink = subdomainLinks.find(link => 
      link.name.toLowerCase() === brand.name.toLowerCase()
    );
    
    // Return the URL if found, otherwise construct one from the subdomain
    return subdomainLink?.url || `https://${brand.subdomain}.aifreedomtrust.com`;
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-2 border-border hover:border-forest-200/30">
      <CardHeader className={`${brandColor} text-white p-5`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {brand.icon}
            <CardTitle className="text-xl font-display">
              {brand.name}
            </CardTitle>
          </div>
        </div>
        {brand.tagline && (
          <CardDescription className="text-white/80 mt-1">
            {brand.tagline}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-5">
        <p className="text-muted-foreground">
          {brand.description || 'A component of the Aetherion ecosystem that embodies the principles of quantum consciousness.'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between p-5 pt-0">
        <Button variant="outline" asChild>
          <Link to={brand.path}>
            Learn More
          </Link>
        </Button>
        <Button asChild className={`${brandColor} ${hoverColor}`}>
          <a href={getSubdomainUrl()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <span>Visit Site</span>
            <ExternalLink size={16} />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export const BrandsShowcase: React.FC = () => {
  // Brand data
  const brands = [
    {
      name: "Aether Coin",
      subdomain: "atc",
      path: "/tokenomics",
      icon: <Leaf className="h-5 w-5" />,
      tagline: "Quantum-resistant utility token",
      description: "A revolutionary cryptocurrency designed with quantum-resistant algorithms to ensure long-term security and stability in the post-quantum computing era.",
      color: "bg-forest-600"
    },
    {
      name: "FractalCoin",
      subdomain: "fractalcoin",
      path: "/aicon",
      icon: <Coins className="h-5 w-5" />,
      tagline: "Fractal-based economic scaling",
      description: "An innovative token that implements fractal mathematics to create a self-sustaining economic system with built-in mechanisms for value preservation and growth.",
      color: "bg-blue-600"
    },
    {
      name: "AetherCore",
      subdomain: "aethercore",
      path: "/technology",
      icon: <Database className="h-5 w-5" />,
      tagline: "Core blockchain infrastructure",
      description: "The fundamental infrastructure layer that powers all Aetherion ecosystem applications with high throughput, minimal latency, and quantum-secure transactions.",
      color: "bg-purple-600"
    },
    {
      name: "Biozoe",
      subdomain: "biozoe",
      path: "/api",
      icon: <SiEthereum className="h-5 w-5" />,
      tagline: "Temporal life & eternal spirit",
      description: "Integrating βίος (temporal life) and ζωή (eternal spirit) principles into blockchain applications that bridge technological advancement with spiritual consciousness.",
      color: "bg-emerald-600"
    },
    {
      name: "AI Freedom Trust",
      subdomain: "ai",
      path: "/brands",
      icon: <Brain className="h-5 w-5" />,
      tagline: "AI for freedom & truth",
      description: "An artificial intelligence framework designed to operate with complete transparency and ethical foundations, prioritizing individual sovereignty and truth.",
      color: "bg-amber-600"
    },
    {
      name: "Quantum Shield",
      subdomain: "shield",
      path: "/security",
      icon: <Shield className="h-5 w-5" />,
      tagline: "Quantum security platform",
      description: "Next-generation security solutions that leverage quantum mechanics principles to provide unbreakable encryption and protection for digital assets.",
      color: "bg-red-600"
    },
    {
      name: "Developer Hub",
      subdomain: "dev",
      path: "/developers",
      icon: <Code className="h-5 w-5" />,
      tagline: "Tools & documentation",
      description: "Comprehensive resources for developers to build applications on the Aetherion ecosystem, including SDKs, APIs, documentation, and development tools.",
      color: "bg-cyan-600"
    },
    {
      name: "Main Website",
      subdomain: "www",
      path: "/",
      icon: <Globe className="h-5 w-5" />,
      tagline: "Organization homepage",
      description: "The central hub for all AI Freedom Trust projects, providing an overview of our mission, vision, and the interconnected ecosystem of brands.",
      color: "bg-indigo-600"
    }
  ];

  return (
    <div className="container py-12">
      <div className="space-y-4 text-center mb-10">
        <h2 className="text-3xl font-bold font-display">Our Brand Ecosystem</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore the interconnected brands that make up the Aetherion quantum blockchain ecosystem, each with its own unique purpose and contribution to our mission.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {brands.map((brand, index) => (
          <BrandCard key={brand.subdomain} brand={brand} index={index} />
        ))}
      </div>
    </div>
  );
};

export default BrandsShowcase;
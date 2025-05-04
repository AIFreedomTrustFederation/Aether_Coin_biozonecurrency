import React from "react";
import { 
  Leaf, Wallet, Code, Layers, LifeBuoy, Building, ExternalLink 
} from "lucide-react";

// Define subdomain links for the Aetherion ecosystem
export const subdomainLinks = [
  { name: "Aether Coin", subdomain: "atc.aifreedomtrust.com", path: "/", icon: <Leaf className="h-5 w-5" /> },
  { name: "FractalCoin", subdomain: "fractalcoin.aifreedomtrust.com", path: "/", icon: <Layers className="h-5 w-5" /> },
  { name: "Quantum Wallet", subdomain: "atc.aifreedomtrust.com", path: "/wallet", icon: <Wallet className="h-5 w-5" /> },
  { name: "AetherDApp", subdomain: "atc.aifreedomtrust.com", path: "/dapp", icon: <Code className="h-5 w-5" /> },
  { name: "Biozoe Portal", subdomain: "biozoe.aifreedomtrust.com", path: "/", icon: <LifeBuoy className="h-5 w-5" /> },
  { name: "AI Freedom Trust", subdomain: "ai.aifreedomtrust.com", path: "/", icon: <Building className="h-5 w-5" /> },
];

interface EcosystemLinkProps {
  link: {
    name: string;
    subdomain: string;
    path: string;
    icon: React.ReactNode;
  };
  className?: string;
}

export const EcosystemLink: React.FC<EcosystemLinkProps> = ({ link, className = "" }) => {
  return (
    <a 
      href={`https://${link.subdomain}${link.path}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-between ${className}`}
    >
      <span className="flex items-center gap-2">
        {link.icon}
        {link.name}
      </span>
      <ExternalLink className="h-3 w-3 text-muted-foreground" />
    </a>
  );
};

interface EcosystemLinksGridProps {
  className?: string;
  itemClassName?: string;
  columns?: number;
}

export const EcosystemLinksGrid: React.FC<EcosystemLinksGridProps> = ({ 
  className = "", 
  itemClassName = "px-3 py-2 text-sm rounded-md hover:bg-accent", 
  columns = 2 
}) => {
  return (
    <div className={`grid gap-2 ${columns === 1 ? "" : "lg:grid-cols-2"} ${className}`}>
      {subdomainLinks.map((link, index) => (
        <EcosystemLink 
          key={index} 
          link={link} 
          className={itemClassName}
        />
      ))}
    </div>
  );
};

export default EcosystemLinksGrid;
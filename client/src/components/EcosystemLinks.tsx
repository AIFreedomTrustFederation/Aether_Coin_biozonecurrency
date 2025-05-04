import React from 'react';
import { ExternalLink, Globe, Code, Leaf, Coins, Brain, Shield, Database } from 'lucide-react';
import { SiEthereum } from 'react-icons/si';

// Type definitions
export interface SubdomainLink {
  name: string;
  url: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// Define all the subdomain links with their details
export const subdomainLinks: SubdomainLink[] = [
  {
    name: 'Aether Coin',
    url: 'https://atc.aifreedomtrust.com',
    description: 'Quantum-resistant cryptocurrency',
    icon: <Leaf size={16} />,
    color: 'text-green-500'
  },
  {
    name: 'FractalCoin',
    url: 'https://fractalcoin.aifreedomtrust.com',
    description: 'Fractal-based economic scaling',
    icon: <Coins size={16} />,
    color: 'text-blue-500'
  },
  {
    name: 'AetherCore',
    url: 'https://aethercore.aifreedomtrust.com',
    description: 'Core blockchain technology',
    icon: <Database size={16} />,
    color: 'text-purple-500'
  },
  {
    name: 'Biozoe',
    url: 'https://biozoe.aifreedomtrust.com',
    description: 'Temporal life & eternal spirit',
    icon: <SiEthereum size={16} />,
    color: 'text-emerald-500'
  },
  {
    name: 'AI Freedom Trust',
    url: 'https://ai.aifreedomtrust.com',
    description: 'AI for freedom & truth',
    icon: <Brain size={16} />,
    color: 'text-amber-500'
  },
  {
    name: 'Quantum Shield',
    url: 'https://shield.aifreedomtrust.com',
    description: 'Quantum security platform',
    icon: <Shield size={16} />,
    color: 'text-red-500'
  },
  {
    name: 'Developer Hub',
    url: 'https://dev.aifreedomtrust.com',
    description: 'Tools & documentation',
    icon: <Code size={16} />,
    color: 'text-cyan-500'
  },
  {
    name: 'Main Website',
    url: 'https://aifreedomtrust.com',
    description: 'Organization homepage',
    icon: <Globe size={16} />,
    color: 'text-indigo-500'
  }
];

interface EcosystemLinksGridProps {
  columns?: number;
  className?: string;
  itemClassName?: string;
  showIcons?: boolean;
}

export const EcosystemLinksGrid: React.FC<EcosystemLinksGridProps> = ({
  columns = 2,
  className = '',
  itemClassName = '',
  showIcons = true
}) => {
  const gridClass = columns === 1 
    ? 'grid grid-cols-1' 
    : columns === 3 
      ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3' 
      : 'grid grid-cols-1 sm:grid-cols-2 gap-3';

  return (
    <div className={`${gridClass} ${className}`}>
      {subdomainLinks.map((link, index) => (
        <a 
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center ${itemClassName}`}
        >
          {showIcons && (
            <span className={`${link.color} mr-2`}>
              {link.icon}
            </span>
          )}
          <span>{link.name}</span>
          {showIcons && <ExternalLink className="ml-1 h-3 w-3 opacity-70" />}
        </a>
      ))}
    </div>
  );
};
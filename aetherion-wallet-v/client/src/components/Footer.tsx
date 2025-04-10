import React from 'react';
import { Link } from 'wouter';
import { 
  Shield, Github, Zap, FileText, Database, Bot, Cpu,
  Smartphone, Info, Blocks, Coins
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Footer links grouped by categories
const footerLinks = [
  {
    category: "Blockchain",
    links: [
      { name: "Blockchain Explorer", path: "/blockchain-explorer", icon: <Database className="h-4 w-4" /> },
      { name: "Blockchain Dashboard", path: "/blockchain-dashboard", icon: <Blocks className="h-4 w-4" /> },
      { name: "Fractal Explorer", path: "/fractal-explorer", icon: <Cpu className="h-4 w-4" /> },
      { name: "Blockchain Visualizer", path: "/blockchain-visualizer", icon: <Database className="h-4 w-4" /> },
    ]
  },
  {
    category: "Resources",
    links: [
      { name: "Whitepaper", path: "/whitepaper", icon: <FileText className="h-4 w-4" /> },
      { name: "About", path: "/about", icon: <Info className="h-4 w-4" /> },
      { name: "ICO", path: "/ico", icon: <Coins className="h-4 w-4" /> },
      { name: "Singularity", path: "/singularity", icon: <Zap className="h-4 w-4" /> },
    ]
  },
  {
    category: "Other",
    links: [
      { name: "Mysterion AI", path: "/ai-assistant", icon: <Bot className="h-4 w-4" /> },
      { name: "AI Assistant Demo", path: "/ai-assistant-onboarding", icon: <Bot className="h-4 w-4" /> },
      { name: "Mobile Features", path: "/mobile-feature", icon: <Smartphone className="h-4 w-4" /> },
      { name: "Security", path: "/security", icon: <Shield className="h-4 w-4" /> },
    ]
  }
];

const Footer: React.FC = () => {
  return (
    <footer className="bg-background border-t mt-auto py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 mr-2 text-primary" />
              <h2 className="text-xl font-bold">Aetherion</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Pioneering quantum-resistant blockchain technology with advanced AI integration
              and secure decentralized financial solutions.
            </p>
            <div className="flex space-x-2">
              <Button size="icon" variant="ghost">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </Button>
              <Button size="icon" variant="ghost">
                <Zap className="h-4 w-4" />
                <span className="sr-only">Discord</span>
              </Button>
              <Button size="icon" variant="ghost">
                <Database className="h-4 w-4" />
                <span className="sr-only">Explorer</span>
              </Button>
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((group) => (
            <div key={group.category} className="space-y-3">
              <h3 className="font-medium text-sm">{group.category}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.path}>
                    <Link href={link.path}>
                      <a className="text-sm text-muted-foreground hover:text-foreground flex items-center">
                        {link.icon}
                        <span className="ml-2">{link.name}</span>
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground mb-2 sm:mb-0">
            &copy; {new Date().getFullYear()} Aetherion. All rights reserved.
          </p>
          <div className="flex space-x-4 text-xs text-muted-foreground">
            <Link href="/terms">
              <a className="hover:text-foreground">Terms of Service</a>
            </Link>
            <Link href="/privacy">
              <a className="hover:text-foreground">Privacy Policy</a>
            </Link>
            <Link href="/contact">
              <a className="hover:text-foreground">Contact Us</a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
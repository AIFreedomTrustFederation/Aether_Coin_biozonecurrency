import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { 
  Leaf, Wallet, ExternalLink, Menu, X, Home, Coins, FileText, 
  BookOpen, Code, Building
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { subdomainLinks, EcosystemLinksGrid } from "@/components/EcosystemLinks";

const Navbar = () => {
  // State for mobile menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2 mr-8">
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-forest-600" />
            <span className="text-xl font-display font-semibold text-forest-800">Aether Coin</span>
          </Link>
        </div>
        
        {/* Mobile hamburger menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" className="p-0 h-10 w-10 rounded-full">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[350px]">
            <div className="flex flex-col gap-4 py-4">
              <div className="px-4 mb-2">
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                  <Leaf className="h-5 w-5 text-forest-600 mr-2" />
                  Aether Ecosystem
                </h2>
                <p className="text-sm text-muted-foreground">Navigate the Aetherion blockchain ecosystem</p>
              </div>
              
              <div className="px-2">
                <div className="text-sm font-medium px-4 py-2">Main Navigation</div>
                <nav className="flex flex-col gap-1">
                  <Link to="/" className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg hover:bg-muted">
                    <Home className="h-4 w-4" /> Home
                  </Link>
                  <Link to="/tokenomics" className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg hover:bg-muted">
                    <Coins className="h-4 w-4" /> Tokenomics
                  </Link>
                  <Link to="/wallet" className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg hover:bg-muted">
                    <Wallet className="h-4 w-4" /> Wallet
                  </Link>
                  <Link to="/dapp" className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg hover:bg-muted">
                    <Code className="h-4 w-4" /> DApp
                  </Link>
                  <Link to="/api" className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg hover:bg-muted">
                    <FileText className="h-4 w-4" /> API
                  </Link>
                  <Link to="/brands" className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg hover:bg-muted">
                    <Building className="h-4 w-4" /> Brands
                  </Link>
                  <Link to="/technology" className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg hover:bg-muted">
                    <BookOpen className="h-4 w-4" /> Technology
                  </Link>
                </nav>
              </div>
              
              <div className="px-2 pt-4 border-t">
                <div className="text-sm font-medium px-4 py-2">Ecosystem Subdomains</div>
                <EcosystemLinksGrid 
                  columns={1}
                  className="px-2"
                  itemClassName="px-4 py-2 text-sm rounded-lg hover:bg-muted"
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Button variant="link" asChild>
                  <Link to="/">Home</Link>
                </Button>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Ecosystem</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 md:w-[500px] lg:w-[600px]">
                  <div className="px-2 mb-2">
                    <h4 className="font-medium text-sm">Aetherion Ecosystem Tokens</h4>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    <NavigationMenuLink asChild>
                      <Link to="/tokenomics" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none flex items-center">
                          <Leaf className="h-4 w-4 mr-2 text-forest-600" />
                          Aether Coin (ATC)
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
                          The quantum-resistant utility token for the Aetherion blockchain
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link to="/aicon" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none flex items-center">
                          <Coins className="h-4 w-4 mr-2 text-forest-600" />
                          FractalCoin (FRC)
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
                          Fractal-based economic scaling for sustainable growth
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                  
                  <div className="px-2 mt-3 pt-3 border-t">
                    <h4 className="font-medium text-sm mb-2">Ecosystem Subdomains</h4>
                    <EcosystemLinksGrid 
                      columns={2}
                      itemClassName="px-3 py-2 text-sm rounded-md hover:bg-accent"
                    />
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Button variant="link" asChild>
                  <Link to="/tokenomics">Tokenomics</Link>
                </Button>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Button variant="link" asChild>
                  <Link to="/aicon">AICoin</Link>
                </Button>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Button variant="link" asChild>
                  <Link to="/wallet">
                    <Wallet className="mr-2 h-4 w-4" />
                    Wallet
                  </Link>
                </Button>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Button variant="link" asChild>
                  <Link to="/dapp" className="flex items-center">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    DApp
                  </Link>
                </Button>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Button variant="link" asChild>
                  <a href="https://atc.aifreedomtrust.com/dapp" target="_blank" rel="noopener noreferrer" className="flex items-center">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    DApp (External)
                  </a>
                </Button>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Button variant="link" asChild>
                  <Link to="/api">API</Link>
                </Button>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Button 
                  variant="link"
                  onClick={() => {
                    toast.info("About page coming soon");
                  }}
                >
                  About
                </Button>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Legal</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 w-[200px]">
                  <NavigationMenuLink asChild>
                    <Link to="/terms-of-service" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none">Terms of Service</div>
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link to="/privacy-policy" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none">Privacy Policy</div>
                    </Link>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        
        <div className="ml-auto flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              toast.info("Sign in functionality coming soon");
            }}
          >
            Sign In
          </Button>
          <Button 
            size="sm" 
            className="bg-forest-600 hover:bg-forest-700"
            onClick={() => {
              toast.info("Wallet connection coming soon");
            }}
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

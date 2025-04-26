import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Leaf, Wallet, ExternalLink, Globe, Shield, Award, Menu, X, Server, LayoutGrid, Bot, ScrollText, Code, BarChart, BarChart2, LineChart, Smile } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Define our navigation items to avoid repetition
const navItems = [
  { href: "/", label: "Home", icon: null },
  { href: "/tokenomics", label: "Tokenomics", icon: null },
  { href: "/aicon", label: "AICoin", icon: null },
  { href: "/wallet", label: "Wallet", icon: <Wallet className="mr-2 h-5 w-5" /> },
  { href: "/dapp", label: "DApp", icon: <ExternalLink className="mr-2 h-5 w-5" /> },
  { href: "/domains", label: "Domains", icon: <Globe className="mr-2 h-5 w-5" /> },
  { href: "/node-marketplace", label: "Node Marketplace", icon: <Server className="mr-2 h-5 w-5 text-forest-600" /> },
  { href: "/achievements", label: "Achievements", icon: <Award className="mr-2 h-5 w-5 text-amber-600" /> },
  { href: "/aethercore-trust", label: "AetherCore.trust", icon: <Globe className="mr-2 h-5 w-5 text-primary" /> },
  { href: "/aethercore-browser", label: "HTTQS Browser", icon: <Shield className="mr-2 h-5 w-5 text-blue-600" /> },
  { href: "/api", label: "API", icon: null },
  { href: "/enumerator", label: "Enumerator App", icon: <LayoutGrid className="mr-2 h-5 w-5 text-purple-600" /> },
  { href: "/bot-simulation", label: "Bot Simulation", icon: <Bot className="mr-2 h-5 w-5 text-indigo-600" /> },
  { href: "/aifreedomtrust", label: "AI Freedom Trust", icon: <Globe className="mr-2 h-5 w-5 text-green-600" /> },
  { href: "/scroll-keeper", label: "Scroll Keeper Dashboard", icon: <ScrollText className="mr-2 h-5 w-5 text-blue-600" /> },
  { href: "/codestar", label: "CodeStar IDE", icon: <Code className="mr-2 h-5 w-5 text-cyan-600" /> },
  { href: "/code-mood-meter", label: "Code Mood Meter", icon: <BarChart className="mr-2 h-5 w-5 text-orange-600" /> },
  { href: "/productivity", label: "Developer Productivity", icon: <LineChart className="mr-2 h-5 w-5 text-purple-500" /> },
];

// Legal items
const legalItems = [
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/privacy-policy", label: "Privacy Policy" },
];

// Ecosystem items
const ecosystemItems = [
  { 
    href: "/tokenomics", 
    label: "Aether Coin (FTC)",
    description: "Rewards for providing storage resources to our decentralized network"
  },
  { 
    href: "/aicon", 
    label: "AICoin (ICON)",
    description: "Rewards for contributing processing power to train our AI models"
  },
  {
    href: "/aifreedomtrust",
    label: "AI Freedom Trust",
    description: "The 1000-year irrevocable trust that governs the biozoecurrency ecosystem"
  },
];

const Navbar = () => {
  // State for the mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2 mr-4 md:mr-8">
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-forest-600" />
            <span className="text-lg md:text-xl font-display font-semibold text-forest-800">Aether Coin</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navItems.slice(0, 3).map((item, index) => (
              <NavigationMenuItem key={index}>
                <NavigationMenuLink asChild>
                  <Button variant="link" asChild>
                    <Link to={item.href} className="flex items-center">
                      {item.icon}
                      {item.label}
                    </Link>
                  </Button>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}

            <NavigationMenuItem>
              <NavigationMenuTrigger>Ecosystem</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                  {ecosystemItems.map((item, index) => (
                    <NavigationMenuLink key={index} asChild>
                      <Link to={item.href} className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">{item.label}</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          {item.description}
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {navItems.slice(3, 7).map((item, index) => (
              <NavigationMenuItem key={index + 3}>
                <NavigationMenuLink asChild>
                  <Button variant="link" asChild>
                    <Link to={item.href} className="flex items-center">
                      {item.icon}
                      {item.label}
                    </Link>
                  </Button>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
            
            <NavigationMenuItem>
              <NavigationMenuTrigger>More</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                  {navItems.slice(7).map((item, index) => (
                    <NavigationMenuLink key={index + 7} asChild>
                      <Link to={item.href} className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="flex items-center text-sm font-medium leading-none">
                          {item.icon}
                          {item.label}
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  ))}
                  <NavigationMenuLink asChild>
                    <Link to="/about" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <div className="text-sm font-medium leading-none">About</div>
                    </Link>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Legal</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 w-[200px]">
                  {legalItems.map((item, index) => (
                    <NavigationMenuLink key={index} asChild>
                      <Link to={item.href} className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">{item.label}</div>
                      </Link>
                    </NavigationMenuLink>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        
        {/* Mobile Navigation Button */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85%] sm:w-[350px] pr-0">
            <div className="flex flex-col h-full">
              <div className="px-2 pt-4 pb-8 border-b">
                <Link to="/" className="flex items-center gap-2 mb-6" onClick={() => setMobileMenuOpen(false)}>
                  <Leaf className="h-6 w-6 text-forest-600" />
                  <span className="text-xl font-display font-semibold text-forest-800">Aether Coin</span>
                </Link>
                
                <div className="grid grid-cols-2 gap-2">
                  <SheetClose asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        toast.info("Sign in functionality coming soon");
                      }}
                    >
                      Sign In
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button 
                      size="sm" 
                      className="bg-forest-600 hover:bg-forest-700"
                      onClick={() => {
                        toast.info("Wallet connection coming soon");
                      }}
                    >
                      Connect Wallet
                    </Button>
                  </SheetClose>
                </div>
              </div>
              
              <div className="py-4 flex-1 overflow-y-auto">
                <div className="flex flex-col space-y-1">
                  {navItems.map((item, index) => (
                    <SheetClose key={index} asChild>
                      <Link 
                        to={item.href}
                        className="flex items-center py-2 px-4 hover:bg-accent rounded-md"
                      >
                        {item.icon}
                        <span className="text-base">{item.label}</span>
                      </Link>
                    </SheetClose>
                  ))}
                  
                  <SheetClose asChild>
                    <Link 
                      to="/about"
                      className="flex items-center py-2 px-4 hover:bg-accent rounded-md"
                    >
                      <span className="text-base">About</span>
                    </Link>
                  </SheetClose>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <p className="px-4 mb-2 text-sm font-medium text-muted-foreground">Legal</p>
                  {legalItems.map((item, index) => (
                    <SheetClose key={index} asChild>
                      <Link 
                        to={item.href}
                        className="flex items-center py-2 px-4 hover:bg-accent rounded-md"
                      >
                        <span className="text-base">{item.label}</span>
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                toast.info("Sign in functionality coming soon");
              }}
            >
              Sign In
            </Button>
          </div>
          <Button 
            size="sm" 
            className="bg-forest-600 hover:bg-forest-700 hidden md:flex"
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

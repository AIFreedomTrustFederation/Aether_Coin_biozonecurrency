import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Server, Home, Code, Cpu, Shield, Database, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home", icon: <Home className="h-5 w-5 mr-2" /> },
    { href: "/brands", label: "Brands", icon: <Server className="h-5 w-5 mr-2" /> },
    { href: "/code-mood-meter", label: "Code Mood", icon: <Code className="h-5 w-5 mr-2" /> },
    { href: "/productivity", label: "Productivity", icon: <Cpu className="h-5 w-5 mr-2" /> },
  ];
  
  const externalLinks = [
    { href: "https://atc.aifreedomtrust.com", label: "ATC Main Site", icon: <Home className="h-5 w-5 mr-2" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0a1a35]">
      {/* Header */}
      <header className="bg-[#0a1a35] sticky top-0 z-50 border-b border-[#1a2a45]">
        <div className="container mx-auto flex justify-between items-center h-16 px-4">
          <Link href="/" className="font-bold text-xl flex items-center text-[#41e0fd]">
            <span className="bg-gradient-to-r from-[#41e0fd] to-[#9b83fc] bg-clip-text text-transparent text-2xl">
              Aether_Coin CodeStar
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Button 
                key={item.href} 
                variant={location === item.href ? "default" : "ghost"}
                asChild
                size="sm"
                className={location === item.href ? "bg-[#2a3a55] hover:bg-[#2a3a55]" : "text-[#41e0fd] hover:bg-[#1a2a45]"}
              >
                <Link href={item.href} className="flex items-center">
                  {item.icon}
                  {item.label}
                </Link>
              </Button>
            ))}
            
            {/* External links for desktop */}
            {externalLinks.map((item) => (
              <Button 
                key={item.href} 
                variant="ghost"
                asChild
                size="sm"
                className="text-[#41e0fd] hover:bg-[#1a2a45]"
              >
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  {item.icon}
                  {item.label}
                </a>
              </Button>
            ))}
          </nav>

          {/* Mobile Navigation - Hamburger Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-[#41e0fd] hover:bg-[#1a2a45]"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-[#0a1a35] border-[#1a2a45]">
              <div className="flex flex-col space-y-2 mt-8">
                {navItems.map((item) => (
                  <Button 
                    key={item.href} 
                    variant={location === item.href ? "default" : "ghost"}
                    asChild
                    size="lg"
                    className={`justify-start ${location === item.href ? "bg-[#2a3a55] hover:bg-[#2a3a55]" : "text-[#41e0fd] hover:bg-[#1a2a45]"}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href={item.href} className="flex items-center">
                      {item.icon}
                      {item.label}
                    </Link>
                  </Button>
                ))}
                
                {externalLinks.length > 0 && (
                  <>
                    <div className="my-2 border-t border-[#1a2a45] pt-2">
                      <h3 className="text-sm font-medium text-gray-400 px-4 mb-1">External Links</h3>
                    </div>
                    
                    {externalLinks.map((item) => (
                      <Button 
                        key={item.href} 
                        variant="ghost"
                        asChild
                        size="lg"
                        className="justify-start text-[#41e0fd] hover:bg-[#1a2a45]"
                        onClick={() => setIsOpen(false)}
                      >
                        <a href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center">
                          {item.icon}
                          {item.label}
                        </a>
                      </Button>
                    ))}
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#061525] py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-3 text-[#41e0fd]">Aether_Coin CodeStar</h3>
              <p className="text-sm text-gray-300">
                Welcome to the CodeStar development environment powered by Aether_Coin blockchain technology.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3 text-[#41e0fd]">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/code-mood-meter">Code Complexity Analysis</Link></li>
                <li><Link href="/productivity">Productivity Dashboard</Link></li>
                <li><Link href="/brands">Brand Showcase</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3 text-[#41e0fd]">Connect</h3>
              <p className="text-sm text-gray-300 mb-4">
                Stay updated with our latest innovations and research.
              </p>
              <div className="flex space-x-3">
                <a href="https://atc.aifreedomtrust.com" className="text-[#41e0fd] hover:text-[#9b83fc]">
                  ATC Main Site
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#1a2a45] text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} Aether_Coin CodeStar Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
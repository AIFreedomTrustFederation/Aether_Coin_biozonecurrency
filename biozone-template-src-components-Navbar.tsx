import React, { useState } from "react";
import { useTheme } from "./theme-provider";
import { Menu, X, Moon, Sun } from "lucide-react";
import { cn } from "../lib/utils";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-quantum-light to-aether-dark flex items-center justify-center text-white font-bold text-lg mr-2">
                A
              </div>
              <span className="text-xl font-bold text-foreground">AetherCore</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-foreground hover:text-primary transition">Home</a>
            <a href="#features" className="text-foreground hover:text-primary transition">Features</a>
            <a href="#about" className="text-foreground hover:text-primary transition">About</a>
            <a href="#cosmic-shift" className="convergence-text hover:opacity-80 transition">Cosmic Shift</a>
            <a href="#sacred-geometry" className="text-foreground hover:text-primary transition">Sacred Geometry</a>
            <a href="#technology" className="text-foreground hover:text-primary transition">Technology</a>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted transition"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <a 
              href="#"
              className={cn(
                "px-4 py-2 rounded-md font-medium",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 transition"
              )}
            >
              Launch App
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted transition"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-border/40">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <a 
              href="#" 
              className="text-foreground hover:text-primary transition py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </a>
            <a 
              href="#features" 
              className="text-foreground hover:text-primary transition py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#about" 
              className="text-foreground hover:text-primary transition py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
            <a 
              href="#cosmic-shift" 
              className="convergence-text py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Cosmic Shift
            </a>
            <a 
              href="#sacred-geometry" 
              className="text-foreground hover:text-primary transition py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Sacred Geometry
            </a>
            <a 
              href="#technology" 
              className="text-foreground hover:text-primary transition py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Technology
            </a>
            <a 
              href="#"
              className={cn(
                "px-4 py-2 rounded-md font-medium text-center",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 transition"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              Launch App
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
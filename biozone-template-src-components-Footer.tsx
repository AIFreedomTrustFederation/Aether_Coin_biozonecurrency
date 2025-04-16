import React from "react";
import { Github, Twitter, Globe, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 bg-card/30 border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-quantum-light to-aether-dark flex items-center justify-center text-white font-bold text-lg mr-2">
                A
              </div>
              <span className="text-xl font-bold">AetherCore</span>
            </div>
            <p className="mt-4 text-muted-foreground">
              Advanced autonomous economic bot platform with quantum-resistant security.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <Github size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <Globe size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition">Documentation</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition">Whitepaper</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition">API Reference</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition">GitHub</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Technology</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition">FractalChain</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition">AetherSphere</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition">Bot Framework</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition">BioZoe Currency</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition">Discord</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition">Twitter</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition">Telegram</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition">Blog</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/40 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AetherCore. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 mt-4 md:mt-0 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition">Cookie Policy</a>
          </div>
        </div>
        
        <div className="text-center mt-8 text-sm text-muted-foreground flex items-center justify-center">
          <span>Made with</span>
          <Heart className="h-4 w-4 mx-1 text-red-500" />
          <span>for humanity's multiplanetary future</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
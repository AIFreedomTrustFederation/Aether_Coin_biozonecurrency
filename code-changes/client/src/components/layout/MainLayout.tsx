import { FC, ReactNode, useState } from 'react';
import { Link } from 'wouter';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileMenu, { MobileMenuTrigger } from './MobileMenu';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Main layout component for the application
 * Includes header, navigation, and responsive mobile menu
 */
const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const openMobileMenu = () => setMobileMenuOpen(true);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-background border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">Aether Coin</span>
            </a>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/wallet">
              <a className="text-foreground/70 hover:text-foreground transition-colors">Wallet</a>
            </Link>
            <Link href="/network/status">
              <a className="text-foreground/70 hover:text-foreground transition-colors">Network</a>
            </Link>
            <Link href="/docs">
              <a className="text-foreground/70 hover:text-foreground transition-colors">Documentation</a>
            </Link>
            <Link href="/community">
              <a className="text-foreground/70 hover:text-foreground transition-colors">Community</a>
            </Link>
          </nav>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Link href="/signin">
              <a className="hidden md:inline-flex hover:text-primary transition-colors">
                Sign In
              </a>
            </Link>
            
            <Link href="/wallet/connect">
              <a className="hidden md:inline-flex px-4 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors">
                Connect Wallet
              </a>
            </Link>
            
            {/* Mobile Menu Trigger */}
            <MobileMenuTrigger onClick={openMobileMenu} />
          </div>
        </div>
      </header>
      
      {/* Mobile Menu */}
      {isMobile && (
        <MobileMenu 
          isOpen={mobileMenuOpen} 
          onClose={closeMobileMenu} 
        />
      )}
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t bg-muted/40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Aetherion. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="/privacy">
                <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </Link>
              <Link href="/terms">
                <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
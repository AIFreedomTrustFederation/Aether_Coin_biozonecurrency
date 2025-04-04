import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Touchable } from '@/components/ui/touchable';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  X,
  Home,
  Wallet,
  BarChart3,
  Scroll,
  FileCode2,
  FolderKanban,
  Settings,
  CreditCard,
  ArrowUpDown,
} from 'lucide-react';

interface FloatingNavProps {
  routes: {
    path: string;
    label: string;
  }[];
  className?: string;
}

const FloatingNav: React.FC<FloatingNavProps> = ({ routes, className }) => {
  const [location, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Get icon for route
  const getRouteIcon = (path: string) => {
    switch (path) {
      case '/':
        return <Home className="w-5 h-5" />;
      case '/assets':
        return <Wallet className="w-5 h-5" />;
      case '/transactions':
        return <BarChart3 className="w-5 h-5" />;
      case '/contracts':
        return <FileCode2 className="w-5 h-5" />;
      case '/fractal-explorer':
        return <FolderKanban className="w-5 h-5" />;
      case '/whitepaper':
        return <Scroll className="w-5 h-5" />;
      case '/settings':
        return <Settings className="w-5 h-5" />;
      case '/payments':
        return <CreditCard className="w-5 h-5" />;
      default:
        return <ArrowUpDown className="w-5 h-5" />;
    }
  };

  return (
    <>
      {/* Main floating button */}
      <Touchable
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center z-50 shadow-lg",
          "bg-primary text-primary-foreground",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
        scale={0.9}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Touchable>

      {/* Navigation menu dropdown */}
      <AnimatePresence mode="sync">
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-24 right-6 z-50 w-56 rounded-lg bg-background shadow-lg overflow-hidden"
            >
              <div className="p-2">
                {routes.map((route, index) => (
                  <Link
                    key={route.path}
                    href={route.path}
                    onClick={() => setIsOpen(false)}
                  >
                    <div 
                      className={cn(
                        "flex items-center space-x-2 p-3 rounded-md cursor-pointer transition-colors",
                        location === route.path
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent text-foreground"
                      )}
                    >
                      {getRouteIcon(route.path)}
                      <span className="font-medium">{route.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingNav;

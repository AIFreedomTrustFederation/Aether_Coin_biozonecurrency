import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import GestureNavigation from './GestureNavigation';
import FloatingNav from './FloatingNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGestureContext } from '@/contexts/gesture-context';
import { cn } from '@/lib/utils';

// Define the routes configuration for the navigation
export const appRoutes = [
  { path: '/', label: 'Dashboard' },
  { path: '/assets', label: 'Assets' },
  { path: '/transactions', label: 'Transactions' },
  { path: '/contracts', label: 'Contracts' },
  { path: '/fractal-explorer', label: 'Fractal Explorer' },
  { path: '/whitepaper', label: 'Whitepaper' },
];

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  const isMobile = useIsMobile();
  const [location] = useLocation();
  const { enableGestures, disableGestures } = useGestureContext();
  const [pageTitle, setPageTitle] = useState('Dashboard');

  // Update page title based on current route
  useEffect(() => {
    const currentRoute = appRoutes.find(route => route.path === location);
    if (currentRoute) {
      setPageTitle(currentRoute.label);
    }
  }, [location]);

  // Determine if we should enable gestures for this page
  useEffect(() => {
    // Disable gestures on specific pages where they might interfere
    // Like the fractal explorer where we want to interact with the canvas
    if (location === '/fractal-explorer') {
      disableGestures();
    } else {
      enableGestures();
    }
  }, [location, enableGestures, disableGestures]);

  return (
    <div className={cn("main-layout h-full w-full flex flex-col", className)}>
      {/* Header with page title */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border/40 px-4 py-3 z-10">
        <h1 className="text-xl font-bold text-foreground">{pageTitle}</h1>
      </header>

      {/* Main content area with gesture navigation */}
      <main className="flex-1 relative">
        {isMobile ? (
          <GestureNavigation
            routes={appRoutes}
            className="w-full h-full"
          >
            {children}
          </GestureNavigation>
        ) : (
          <div className="w-full h-full overflow-auto">{children}</div>
        )}
      </main>

      {/* Floating navigation on mobile */}
      {isMobile && <FloatingNav routes={appRoutes} />}

      {/* Footer with navigation on non-mobile */}
      {!isMobile && (
        <footer className="bg-background/80 backdrop-blur-sm border-t border-border/40 px-4 py-2">
          <nav className="flex justify-around">
            {appRoutes.map((route) => (
              <a
                key={route.path}
                href={route.path}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  location === route.path
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                )}
              >
                {route.label}
              </a>
            ))}
          </nav>
        </footer>
      )}
    </div>
  );
};

export default MainLayout;
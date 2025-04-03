import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Route } from 'wouter';
import { cn } from '@/lib/utils';

interface AnimatedRouteProps {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  animationDirection?: 'left' | 'right' | 'up' | 'down';
  className?: string;
}

export const AnimatedRoute: React.FC<AnimatedRouteProps> = ({
  path,
  component: Component,
  exact = true,
  animationDirection = 'right',
  className,
}) => {
  // Track if this route is active
  const [location] = useLocation();
  const isActive = exact ? location === path : location.startsWith(path);
  
  // Configure animations based on direction
  const getAnimations = () => {
    switch (animationDirection) {
      case 'left':
        return {
          initial: { opacity: 0, x: '-100%' },
          in: { opacity: 1, x: 0 },
          out: { opacity: 0, x: '100%' },
        };
      case 'up':
        return {
          initial: { opacity: 0, y: '-100%' },
          in: { opacity: 1, y: 0 },
          out: { opacity: 0, y: '100%' },
        };
      case 'down':
        return {
          initial: { opacity: 0, y: '100%' },
          in: { opacity: 1, y: 0 },
          out: { opacity: 0, y: '-100%' },
        };
      case 'right':
      default:
        return {
          initial: { opacity: 0, x: '100%' },
          in: { opacity: 1, x: 0 },
          out: { opacity: 0, x: '-100%' },
        };
    }
  };

  const animations = getAnimations();

  return (
    <Route path={path}>
      {(params) => (
        <motion.div
          className={cn("animated-route-container w-full h-full", className)}
          initial="initial"
          animate="in"
          exit="out"
          variants={animations}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
        >
          <Component {...params} />
        </motion.div>
      )}
    </Route>
  );
};

interface AnimatedRoutesProps {
  routes: {
    path: string;
    component: React.ComponentType<any>;
    exact?: boolean;
  }[];
  className?: string;
}

export const AnimatedRoutes: React.FC<AnimatedRoutesProps> = ({ 
  routes,
  className 
}) => {
  const [location] = useLocation();
  const [prevLocation, setPrevLocation] = useState(location);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right'>('right');

  // Determine animation direction based on route index
  useEffect(() => {
    if (location !== prevLocation) {
      const prevIndex = routes.findIndex(route => 
        (route.exact ? prevLocation === route.path : prevLocation.startsWith(route.path))
      );
      
      const currentIndex = routes.findIndex(route => 
        (route.exact ? location === route.path : location.startsWith(route.path))
      );

      if (prevIndex !== -1 && currentIndex !== -1) {
        setTransitionDirection(currentIndex > prevIndex ? 'right' : 'left');
      }
      
      setPrevLocation(location);
    }
  }, [location, prevLocation, routes]);

  return (
    <div className={cn("animated-routes-container w-full h-full bg-background relative", className)}>
      <AnimatePresence initial={false}>
        {routes.map((route) => {
          const isMatch = location === route.path || 
            (!route.exact && location.startsWith(route.path));
          
          if (!isMatch) return null;
          
          return (
            <Route key={route.path} path={route.path}>
              {(params) => (
                <motion.div
                  key={route.path}
                  className="w-full h-full bg-background"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <route.component {...params} />
                </motion.div>
              )}
            </Route>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
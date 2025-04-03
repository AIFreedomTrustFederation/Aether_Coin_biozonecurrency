import React from 'react';
import { Route, Switch } from 'wouter';

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
  return (
    <div className={`animated-routes-container w-full h-full ${className || ''}`}>
      <Switch>
        {routes.map((route) => (
          <Route 
            key={route.path} 
            path={route.path} 
            component={route.component}
          />
        ))}
      </Switch>
    </div>
  );
};

// Keep this export to maintain compatibility with existing code
export const AnimatedRoute = Route;
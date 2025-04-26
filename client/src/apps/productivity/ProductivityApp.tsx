import React from 'react';
import { Route, Switch } from 'wouter';
import ProductivityDashboardDetailed from '@/pages/ProductivityDashboardDetailed';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Zap, ChevronLeft, BrainCircuit } from 'lucide-react';

/**
 * Productivity App
 * 
 * A micro-frontend app for tracking and optimizing developer productivity.
 * Provides insights, time tracking, and performance analytics.
 */
const ProductivityApp: React.FC = () => {
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <Switch>
        <Route path="/productivity">
          <ProductivityDashboardDetailed />
        </Route>
        
        <Route path="/productivity/insights">
          <Alert className="mb-4">
            <Zap className="h-5 w-5" />
            <AlertTitle>Coming Soon</AlertTitle>
            <AlertDescription>
              Advanced insights and recommendations are under development.
            </AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Route>
        
        <Route>
          {/* Default route - redirect to main dashboard */}
          <ProductivityDashboardDetailed />
        </Route>
      </Switch>
    </div>
  );
};

export default ProductivityApp;
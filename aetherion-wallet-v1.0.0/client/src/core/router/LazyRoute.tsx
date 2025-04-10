import { Suspense, lazy, ComponentType, LazyExoticComponent } from 'react';
import { Route } from 'wouter';
import { Loader2 } from 'lucide-react';

interface LazyRouteProps {
  path: string;
  component: LazyExoticComponent<ComponentType<any>>;
}

// Fallback loading component for Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[70vh] w-full">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading module...</p>
    </div>
  </div>
);

/**
 * LazyRoute component for code-splitting at route level
 * Wraps the lazy-loaded component with Suspense and provides a loading fallback
 */
export const LazyRoute = ({ path, component: Component }: LazyRouteProps) => {
  return (
    <Route path={path}>
      {(params) => (
        <Suspense fallback={<LoadingFallback />}>
          <Component {...params} />
        </Suspense>
      )}
    </Route>
  );
};

/**
 * Helper function to create a lazy-loaded route component
 * @param importFn - Dynamic import function returning the component
 * @returns Lazy component with proper typing
 */
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): LazyExoticComponent<T> => {
  return lazy(importFn);
};
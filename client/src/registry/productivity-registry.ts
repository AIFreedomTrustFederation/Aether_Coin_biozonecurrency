import { lazy } from 'react';
import { AppRegistry } from './AppRegistry';

/**
 * Register Productivity Dashboard App
 * 
 * This extension adds the Developer Productivity Dashboard app to the AppRegistry
 */
export function registerProductivityApp() {
  // Developer Productivity Dashboard
  AppRegistry.registerApp({
    id: 'productivity',
    name: 'Developer Productivity',
    description: 'Track and optimize your development workflow',
    icon: 'brain-circuit',
    component: lazy(() => import('../apps/productivity/ProductivityApp')),
    visible: true
  });
  
  console.log('[Productivity] Registered Developer Productivity Dashboard app');
}

// Register the app immediately
registerProductivityApp();
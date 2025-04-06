import React from 'react';
import { Route, Switch } from 'wouter';
import AISettings from './components/AISettings';

// Component for AI Assistant routing
export function AIAssistantRouter() {
  return (
    <Switch>
      <Route path="/ai/settings" component={AISettings} />
    </Switch>
  );
}

// Export the component as default
export default AIAssistantRouter;
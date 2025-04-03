import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import DevToolsToggle from "@/components/layout/DevToolsToggle";
import Dashboard from "@/pages/Dashboard";
import Assets from "@/pages/Assets";
import Transactions from "@/pages/Transactions";
import Contracts from "@/pages/Contracts";
import WhitePaper from "@/pages/WhitePaper";
import FractalExplorer from "@/pages/FractalExplorer";
import Payments from "@/pages/Payments";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import { GestureProvider } from "@/contexts/gesture-context";
import MainLayout from "@/components/layout/MainLayout";

function Router() {
  return (
    <div className="relative w-full h-full">
      <MainLayout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/assets" component={Assets} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/contracts" component={Contracts} />
          <Route path="/payments" component={Payments} />
          <Route path="/settings" component={Settings} />
          <Route path="/whitepaper" component={WhitePaper} />
          <Route path="/fractal-explorer" component={FractalExplorer} />
          <Route component={NotFound} />
        </Switch>
      </MainLayout>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureProvider>
        <div className="app-container w-full h-full bg-background">
          <Router />
          <Toaster />
          <DevToolsToggle />
        </div>
      </GestureProvider>
    </QueryClientProvider>
  );
}

export default App;

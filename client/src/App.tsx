import { Route } from "wouter";
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
import { AnimatedRoutes } from "@/components/layout/AnimatedRoute";
import { GestureProvider } from "@/contexts/gesture-context";
import MainLayout from "@/components/layout/MainLayout";

// Define routes for the application
const routes = [
  {
    path: "/",
    component: Dashboard,
    exact: true,
  },
  {
    path: "/assets",
    component: Assets,
    exact: true,
  },
  {
    path: "/transactions",
    component: Transactions,
    exact: true,
  },
  {
    path: "/contracts",
    component: Contracts,
    exact: true,
  },
  {
    path: "/payments",
    component: Payments,
    exact: true,
  },
  {
    path: "/settings",
    component: Settings,
    exact: true,
  },
  {
    path: "/whitepaper",
    component: WhitePaper,
    exact: true,
  },
  {
    path: "/fractal-explorer",
    component: FractalExplorer,
    exact: true,
  },
  // Not found route must be last
  {
    path: "/:rest*",
    component: NotFound,
    exact: false,
  },
];

function Router() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <MainLayout>
        <AnimatedRoutes routes={routes} />
      </MainLayout>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureProvider>
        <div className="app-container w-full h-full">
          <Router />
          <Toaster />
          <DevToolsToggle />
        </div>
      </GestureProvider>
    </QueryClientProvider>
  );
}

export default App;

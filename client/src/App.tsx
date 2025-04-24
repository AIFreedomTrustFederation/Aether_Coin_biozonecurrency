
import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { QuantumDomainProvider } from "./contexts/QuantumDomainContext";
import { ZeroTrustProvider } from "./contexts/ZeroTrustContext";
import { QuantumLoader } from "@/components/ui/quantum-loader";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const Tokenomics = lazy(() => import("./pages/Tokenomics"));
const Aicon = lazy(() => import("./pages/Aicon"));
const Wallet = lazy(() => import("./pages/Wallet"));
const DApp = lazy(() => import("./pages/DApp"));
const About = lazy(() => import("./pages/About"));
const Domains = lazy(() => import("./pages/Domains"));
const Achievements = lazy(() => import("./pages/Achievements"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Api = lazy(() => import("./pages/Api"));
const AetherCoreTrust = lazy(() => import("./pages/hosting/AetherCoreTrust"));
const AetherCoreBrowser = lazy(() => import("./pages/AetherCoreBrowser"));
const NodeMarketplace = lazy(() => import("./pages/NodeMarketplace"));
const DnsManager = lazy(() => import("./pages/DnsManager"));
const CodeStarPage = lazy(() => import("./pages/CodeStarPage"));
const ScrollKeeperPage = lazy(() => import("./pages/ScrollKeeperPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Enhanced Quantum loading fallback component
const QuantumPageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center">
    <QuantumLoader 
      size="lg" 
      variant="dual" 
      showLabel 
      labelText="Initializing Quantum Domain..." 
    />
    <p className="text-gray-400 text-sm mt-8 max-w-md text-center">
      Establishing secure connection to the panentheistic economic framework...
    </p>
  </div>
);

// Import our Enumerator page
const EnumeratorPage = lazy(() => import("./pages/Enumerator"));

// Import Bot Simulation page
const BotSimulationPage = lazy(() => import("./pages/BotSimulation"));

// Create a simple landing page component for AI Freedom Trust
const AIFreedomTrustRedirect = () => {
  // Simple component that immediately redirects via meta refresh
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <QuantumLoader 
        size="lg" 
        variant="dual" 
        showLabel 
        labelText="Redirecting to AI Freedom Trust..." 
      />
      <script dangerouslySetInnerHTML={{ 
        __html: `
          setTimeout(function() {
            window.location.href = '/aifreedomtrust';
          }, 1500);
        `
      }} />
    </div>
  );
};

// App structure with Wouter for routing
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ZeroTrustProvider>
        <QuantumDomainProvider>
          <Suspense fallback={<QuantumPageLoader />}>
            <Switch>
              <Route path="/" component={Index} />
              <Route path="/tokenomics" component={Tokenomics} />
              <Route path="/aicon" component={Aicon} />
              <Route path="/wallet" component={Wallet} />
              <Route path="/dapp" component={DApp} />
              <Route path="/about" component={About} />
              <Route path="/domains" component={Domains} />
              <Route path="/achievements" component={Achievements} />
              <Route path="/terms-of-service" component={TermsOfService} />
              <Route path="/privacy-policy" component={PrivacyPolicy} />
              <Route path="/api" component={Api} />
              <Route path="/aethercore-trust" component={AetherCoreTrust} />
              <Route path="/aethercore-browser" component={AetherCoreBrowser} />
              <Route path="/node-marketplace" component={NodeMarketplace} />
              <Route path="/dns-manager" component={DnsManager} />
              <Route path="/codestar" component={CodeStarPage} />
              <Route path="/scroll-keeper" component={ScrollKeeperPage} />
              
              {/* Route to simplified Enumerator page */}
              <Route path="/enumerator" component={EnumeratorPage} />
              
              {/* Route to Bot Simulation Dashboard */}
              <Route path="/bot-simulation" component={BotSimulationPage} />
              
              {/* Route to AI Freedom Trust landing page */}
              <Route path="/aifreedomtrust" component={AIFreedomTrustRedirect} />
              
              {/* Catch-all route for 404 */}
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </QuantumDomainProvider>
      </ZeroTrustProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

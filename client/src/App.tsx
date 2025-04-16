
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QuantumDomainProvider } from "./contexts/QuantumDomainContext";
import { ZeroTrustProvider } from "./contexts/ZeroTrustContext";
import { QuantumLoader } from "@/components/ui/quantum-loader";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const Tokenomics = lazy(() => import("./pages/Tokenomics"));
const Aicon = lazy(() => import("./pages/Aicon"));
const Wallet = lazy(() => import("./pages/Wallet"));
const DApp = lazy(() => import("./pages/DApp"));
const Domains = lazy(() => import("./pages/Domains"));
const Achievements = lazy(() => import("./pages/Achievements"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Api = lazy(() => import("./pages/Api"));
const AetherCoreTrust = lazy(() => import("./pages/hosting/AetherCoreTrust"));
const AetherCoreBrowser = lazy(() => import("./pages/AetherCoreBrowser"));
const NodeMarketplace = lazy(() => import("./pages/NodeMarketplace"));
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

// Original App structure with updated Enumerator page
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ZeroTrustProvider>
        <QuantumDomainProvider>
          <BrowserRouter>
            <Suspense fallback={<QuantumPageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/tokenomics" element={<Tokenomics />} />
                <Route path="/aicon" element={<Aicon />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/dapp" element={<DApp />} />
                <Route path="/domains" element={<Domains />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/api" element={<Api />} />
                <Route path="/aethercore-trust" element={<AetherCoreTrust />} />
                <Route path="/aethercore-browser" element={<AetherCoreBrowser />} />
                <Route path="/node-marketplace" element={<NodeMarketplace />} />
                
                {/* Route to simplified Enumerator page */}
                <Route path="/enumerator" element={<EnumeratorPage />} />
                
                {/* Route to Bot Simulation Dashboard */}
                <Route path="/bot-simulation" element={<BotSimulationPage />} />
                
                {/* Catch-all route for 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </QuantumDomainProvider>
      </ZeroTrustProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


import { Suspense, lazy } from "react";
import { QuantumDomainProvider } from "./contexts/QuantumDomainContext";
import { ZeroTrustProvider } from "./contexts/ZeroTrustContext";
import { QuantumLoader } from "@/components/ui/quantum-loader";
import MainAppRouter from "./MainAppRouter";

// Import existing pages for use in landing pages and marketing
const Index = lazy(() => import("./pages/Index"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));

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

/**
 * Root App Component
 * 
 * This component now uses the MainAppRouter which implements the 
 * Enumerator-like architecture with micro-frontends.
 */
const App = () => (
  <ZeroTrustProvider>
    <QuantumDomainProvider>
      <Suspense fallback={<QuantumPageLoader />}>
        <MainAppRouter />
      </Suspense>
    </QuantumDomainProvider>
  </ZeroTrustProvider>
);

export default App;

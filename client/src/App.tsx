
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { QuantumDomainProvider } from "./contexts/QuantumDomainContext";

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
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 text-forest-600 animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <QuantumDomainProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </QuantumDomainProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

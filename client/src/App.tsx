import { useState, useEffect, lazy, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { LiveModeProvider } from "./contexts/LiveModeContext";
import { LiveModeIndicator } from "@/components/ui/LiveModeIndicator";
import ResourceHints from "./components/ResourceHints";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Menu, X, Home, Layout, Wallet, Lock, Shield, Settings, AlertTriangle, ChevronRight, 
  BarChart3, Eye, Cpu, Bell, Zap, Coins, FileText, Database, Bot, TestTube, Blocks,
  Smartphone, Lightbulb, CreditCard, Info, Palette, Loader2
} from "lucide-react";

// Loading screen component for lazy-loaded routes
const LoadingScreen = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[70vh]">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
);

// Import landing page for fast initial load
import LandingPage from "./pages/LandingPage";

// Lazy load all other components
const AIAssistant = lazy(() => import("./modules/ai-assistant/components/AIAssistant").then(m => ({ default: m.AIAssistant })));
const AISettings = lazy(() => import("./modules/ai-assistant/components/AISettings"));
const Dashboard = lazy(() => import("@/components/Dashboard"));
const SecurityPage = lazy(() => import("./pages/SecurityPage").then(m => ({ default: m.SecurityPage })));
const SingularityCoinPage = lazy(() => import("./pages/SingularityCoinPage"));
const ICOPage = lazy(() => import("./pages/ICOPage"));
const WhitepaperPage = lazy(() => import("./pages/WhitepaperPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const AdminPortal = lazy(() => import("./pages/AdminPortal"));

// Lazy load new personalization pages
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const BlockchainVisualizerPage = lazy(() => import("./pages/BlockchainVisualizerPage"));
const BlockchainDashboardPage = lazy(() => import("./pages/BlockchainDashboardPage"));
const BlockchainExplorer = lazy(() => import("./pages/BlockchainExplorer"));
const WalletPage = lazy(() => import("./pages/WalletPage"));
const MysterionAIPage = lazy(() => import("./pages/MysterionAIPage"));
const AIAssistantOnboarding = lazy(() => import("./pages/AIAssistantOnboarding"));
const OnboardingPage = lazy(() => import("./pages/Onboarding"));
const TestPage = lazy(() => import("./pages/TestPage"));
const DappBuilder = lazy(() => import("./pages/DappBuilder"));
const FractalExplorer = lazy(() => import("./pages/FractalExplorer"));
const PaymentPage = lazy(() => import("./pages/PaymentPage").then(m => ({ default: m.PaymentPage })));
const TransactionsPage = lazy(() => import("./pages/TransactionsPage"));
const BridgePage = lazy(() => import("./pages/BridgePage"));
const BridgeTestPage = lazy(() => import("./pages/BridgeTestPage"));

// Lazy load Mobile Features Demo
const MobileFeatureDemo = lazy(() => import("@/components/mobile/MobileFeatureDemo"));
const EscrowPage = lazy(() => import("./pages/Escrow"));
const ThemePage = lazy(() => import("./pages/Theme"));
const BottomNavigation = lazy(() => import("@/components/mobile/BottomNavigation"));

// Define navigation items for both mobile and desktop
const navigationItems = [
  { name: "Dashboard", path: "/dashboard", icon: <Layout className="h-5 w-5" /> },
  { name: "Wallet", path: "/wallet", icon: <Wallet className="h-5 w-5" /> },
  { name: "Payment", path: "/payment", icon: <CreditCard className="h-5 w-5" /> },
  { name: "Transactions", path: "/transactions", icon: <BarChart3 className="h-5 w-5" /> },
  { name: "Bridge", path: "/bridge", icon: <ChevronRight className="h-5 w-5 rotate-90" /> },
  { name: "Bridge Test", path: "/bridge-test", icon: <TestTube className="h-5 w-5" /> },
  { name: "Escrow", path: "/escrow", icon: <Shield className="h-5 w-5" /> },
  { name: "Blockchain Explorer", path: "/blockchain-explorer", icon: <Database className="h-5 w-5" /> },
  { name: "Blockchain Dashboard", path: "/blockchain-dashboard", icon: <Blocks className="h-5 w-5" /> },
  { name: "Singularity", path: "/singularity", icon: <Zap className="h-5 w-5" /> },
  { name: "ICO", path: "/ico", icon: <Coins className="h-5 w-5" /> },
  { name: "Whitepaper", path: "/whitepaper", icon: <FileText className="h-5 w-5" /> },
  { name: "About", path: "/about", icon: <Info className="h-5 w-5" /> },
  { name: "Fractal Explorer", path: "/fractal-explorer", icon: <Cpu className="h-5 w-5" /> },
  { name: "Blockchain Visualizer", path: "/blockchain-visualizer", icon: <Database className="h-5 w-5" /> },
  { name: "Mysterion AI", path: "/ai-assistant", icon: <Bot className="h-5 w-5" /> },
  { name: "AI Assistant Demo", path: "/ai-assistant-onboarding", icon: <Lightbulb className="h-5 w-5" /> },
  { name: "Mobile Features", path: "/mobile-feature", icon: <Smartphone className="h-5 w-5" /> },
  { name: "Security", path: "/security", icon: <Shield className="h-5 w-5" /> },
  { name: "Settings", path: "/settings", icon: <Settings className="h-5 w-5" /> },
  { name: "Test Mode", path: "/test", icon: <TestTube className="h-5 w-5" /> },
];

// Simple page components for now
const SimpleSettings = () => (
  <div className="p-4 container mx-auto max-w-4xl">
    <h1 className="text-2xl font-bold mb-4">Settings</h1>
    <div className="grid gap-4 mt-4">
      <div className="bg-card p-4 rounded-lg border">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-medium">Notification Settings</h2>
        </div>
        <p className="text-muted-foreground mb-2">Configure how and when you receive notifications</p>
        <div className="space-y-2 mt-4">
          <div className="flex justify-between items-center p-2 rounded hover:bg-muted/50">
            <label htmlFor="email-notif" className="cursor-pointer">Email Notifications</label>
            <div className="form-control">
              <input type="checkbox" id="email-notif" className="checkbox checkbox-primary" defaultChecked />
            </div>
          </div>
          <div className="flex justify-between items-center p-2 rounded hover:bg-muted/50">
            <label htmlFor="sms-notif" className="cursor-pointer">SMS Notifications</label>
            <div className="form-control">
              <input type="checkbox" id="sms-notif" className="checkbox checkbox-primary" />
            </div>
          </div>
          <div className="flex justify-between items-center p-2 rounded hover:bg-muted/50">
            <label htmlFor="matrix-notif" className="cursor-pointer">Matrix Notifications</label>
            <div className="form-control">
              <input type="checkbox" id="matrix-notif" className="checkbox checkbox-primary" defaultChecked />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-card p-4 rounded-lg border">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-medium">Security Settings</h2>
        </div>
        <p className="text-muted-foreground mb-2">Manage your security preferences</p>
        <div className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Button variant="outline" size="sm">Enable</Button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Trusted Devices</h3>
              <p className="text-sm text-muted-foreground">Manage your trusted devices</p>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">API Access</h3>
              <p className="text-sm text-muted-foreground">Manage API keys and permissions</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SimpleWallet = () => (
  <div className="p-4 container mx-auto max-w-4xl">
    <h1 className="text-2xl font-bold mb-4">Wallet</h1>
    
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div className="bg-card p-4 rounded-lg border col-span-full lg:col-span-2">
        <h2 className="text-xl font-medium mb-2">Balance Overview</h2>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mt-4">
          <div>
            <p className="text-muted-foreground text-sm">Current Balance</p>
            <p className="text-3xl font-bold">$15,557.00</p>
            <div className="flex items-center text-green-500 text-sm mt-1">
              <BarChart3 className="h-4 w-4 mr-1" />
              <span>+12.5% this month</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Send</Button>
            <Button size="sm" variant="outline">Receive</Button>
            <Button size="sm" variant="default">Swap</Button>
          </div>
        </div>
      </div>
      
      <div className="bg-card p-4 rounded-lg border">
        <h2 className="text-xl font-medium mb-2">Security Status</h2>
        <div className="mt-2">
          <div className="relative h-24 w-24 flex items-center justify-center rounded-full bg-muted">
            <div className="absolute inset-0">
              <svg viewBox="0 0 100 100" className="h-full w-full transform rotate-90">
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="10" 
                  strokeDasharray="283" 
                  strokeDashoffset="28.3"
                  className="text-green-500" 
                />
              </svg>
            </div>
            <span className="relative text-xl font-bold">90%</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Your wallet is well-protected</p>
          <Button variant="link" className="p-0 mt-2 h-auto" size="sm">
            View Details <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
    
    <div className="mt-4 bg-card p-4 rounded-lg border">
      <h2 className="text-xl font-medium mb-4">Recent Transactions</h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-2 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 text-green-700 p-2 rounded-full">
              <ChevronRight className="h-4 w-4 rotate-180" />
            </div>
            <div>
              <p className="font-medium">Received ETH</p>
              <p className="text-sm text-muted-foreground">April 3, 2025</p>
            </div>
          </div>
          <p className="font-medium text-green-600">+0.45 ETH</p>
        </div>
        <div className="flex justify-between items-center p-2 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 text-red-700 p-2 rounded-full">
              <ChevronRight className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">Sent USDC</p>
              <p className="text-sm text-muted-foreground">April 2, 2025</p>
            </div>
          </div>
          <p className="font-medium text-red-600">-250.00 USDC</p>
        </div>
        <div className="flex justify-between items-center p-2">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
              <Eye className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">Staked SING</p>
              <p className="text-sm text-muted-foreground">April 1, 2025</p>
            </div>
          </div>
          <p className="font-medium">500 SING</p>
        </div>
      </div>
      <div className="mt-4 text-center">
        <Link href="/transactions">
          <Button variant="outline" size="sm">View All Transactions</Button>
        </Link>
      </div>
    </div>
  </div>
);

const SimpleFractalExplorer = () => (
  <div className="p-4 container mx-auto max-w-4xl">
    <h1 className="text-2xl font-bold mb-4">Fractal Explorer</h1>
    
    <div className="bg-card p-6 rounded-lg border mb-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-xl font-medium">Quantum Security Visualization</h2>
          <p className="text-muted-foreground mt-1">Explore the fractal security architecture</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">2D View</Button>
          <Button variant="outline" size="sm">3D View</Button>
          <Button variant="default" size="sm">Simulation</Button>
        </div>
      </div>
      
      <div className="mt-6 bg-black/10 dark:bg-white/5 rounded-lg h-64 flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-16 w-16 text-muted-foreground opacity-30" />
          <p className="mt-4 text-muted-foreground">Fractal security visualization coming soon</p>
          <Button variant="outline" className="mt-4">Launch Demo</Button>
        </div>
      </div>
    </div>
    
    <div className="grid gap-4 md:grid-cols-2">
      <div className="bg-card p-4 rounded-lg border">
        <h2 className="text-xl font-medium mb-2">Layer 1 Security</h2>
        <p className="text-muted-foreground">CRYSTAL-Kyber algorithm status</p>
        <div className="flex items-center gap-2 mt-3">
          <div className="w-full bg-muted rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '92%' }}></div>
          </div>
          <span className="text-green-500 font-medium">92%</span>
        </div>
        <p className="text-sm mt-2">Active security protocols: <span className="font-medium">12/12</span></p>
      </div>
      
      <div className="bg-card p-4 rounded-lg border">
        <h2 className="text-xl font-medium mb-2">Layer 2 Wrapper</h2>
        <p className="text-muted-foreground">SPHINCS+ algorithm status</p>
        <div className="flex items-center gap-2 mt-3">
          <div className="w-full bg-muted rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '88%' }}></div>
          </div>
          <span className="text-green-500 font-medium">88%</span>
        </div>
        <p className="text-sm mt-2">Quantum-resistant encryption: <span className="font-medium">Active</span></p>
      </div>
    </div>
  </div>
);

const SimpleNotFound = () => (
  <div className="p-4 flex flex-col items-center justify-center min-h-[70vh]">
    <Shield className="h-16 w-16 text-muted-foreground mb-4" />
    <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
    <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist or has been moved.</p>
    <Link href="/">
      <Button>Back to Home</Button>
    </Link>
  </div>
);

/**
 * MobileNav component that slides in from the side
 */
const MobileNav = ({ isOpen, onClose, currentPath }: { 
  isOpen: boolean; 
  onClose: () => void;
  currentPath: string;
}) => {
  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Mobile menu panel */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-background z-50 shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b shrink-0">
          <Link href="/" onClick={onClose}>
            <h1 className="font-bold text-xl">Aetherion</h1>
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="p-3 overflow-y-auto flex-grow">
          <Link href="/" onClick={onClose}>
            <div className={`flex items-center gap-3 p-3 rounded-md mb-1 ${
              currentPath === '/' ? 'bg-muted font-medium' : 'hover:bg-muted/50'
            }`}>
              <Home className="h-5 w-5" />
              <span>Home</span>
            </div>
          </Link>
          
          {navigationItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              onClick={onClose}
            >
              <div className={`flex items-center gap-3 p-3 rounded-md mb-1 ${
                currentPath === item.path ? 'bg-muted font-medium' : 'hover:bg-muted/50'
              }`}>
                {item.icon}
                <span>{item.name}</span>
              </div>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t shrink-0">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Quantum-Secured</span>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Main App component with routes
 */
function App() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Set up event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LiveModeProvider>
        {/* Add resource hints for faster page loading */}
        <ResourceHints />
        <div className={`app-container w-full h-full ${isMobile ? 'pb-16' : ''}`}>
        {/* Top Navigation Bar */}
        <header className="flex justify-between items-center p-2 sm:p-4 bg-background border-b fixed top-0 left-0 right-0 z-30">
          <div className="flex items-center">
            {/* Mobile menu button */}
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            
            <Link href="/">
              <h1 className="font-bold text-xl cursor-pointer">Aetherion</h1>
            </Link>
            
            <div className="ml-4">
              <LiveModeIndicator variant="button" showToggle={true} />
            </div>
          </div>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="flex space-x-2">
              {navigationItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <Button 
                    variant={location === item.path ? "default" : "ghost"} 
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Button>
                </Link>
              ))}
            </nav>
          )}
        </header>
        
        {/* Mobile Navigation */}
        <MobileNav 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)}
          currentPath={location}
        />
        
        {/* Main Content */}
        <main className="pt-[60px] min-h-[calc(100%-60px)] overflow-auto">
          <Switch>
            {/* Landing page loads directly (not lazy-loaded) for fast initial display */}
            <Route path="/" component={LandingPage} />
            
            {/* All other routes use Suspense with lazy loading for better performance */}
            <Route path="/dashboard">
              <Suspense fallback={<LoadingScreen message="Loading dashboard..." />}>
                <DashboardPage />
              </Suspense>
            </Route>
            <Route path="/wallet">
              <Suspense fallback={<LoadingScreen message="Loading wallet..." />}>
                <WalletPage />
              </Suspense>
            </Route>
            <Route path="/fractal-explorer">
              <Suspense fallback={<LoadingScreen message="Loading fractal explorer..." />}>
                <FractalExplorer />
              </Suspense>
            </Route>
            <Route path="/blockchain-explorer">
              <Suspense fallback={<LoadingScreen message="Loading blockchain explorer..." />}>
                <BlockchainExplorer />
              </Suspense>
            </Route>
            <Route path="/ai-assistant-onboarding">
              <Suspense fallback={<LoadingScreen message="Loading AI assistant onboarding..." />}>
                <AIAssistantOnboarding />
              </Suspense>
            </Route>
            <Route path="/security">
              <Suspense fallback={<LoadingScreen message="Loading security page..." />}>
                <SecurityPage />
              </Suspense>
            </Route>
            <Route path="/singularity">
              <Suspense fallback={<LoadingScreen message="Loading singularity coin..." />}>
                <SingularityCoinPage />
              </Suspense>
            </Route>
            <Route path="/ico">
              <Suspense fallback={<LoadingScreen message="Loading ICO page..." />}>
                <ICOPage />
              </Suspense>
            </Route>
            <Route path="/whitepaper">
              <Suspense fallback={<LoadingScreen message="Loading whitepaper..." />}>
                <WhitepaperPage />
              </Suspense>
            </Route>
            <Route path="/about">
              <Suspense fallback={<LoadingScreen message="Loading about page..." />}>
                <AboutPage />
              </Suspense>
            </Route>
            <Route path="/blockchain-visualizer">
              <Suspense fallback={<LoadingScreen message="Loading blockchain visualizer..." />}>
                <BlockchainVisualizerPage />
              </Suspense>
            </Route>
            <Route path="/blockchain-dashboard">
              <Suspense fallback={<LoadingScreen message="Loading blockchain dashboard..." />}>
                <BlockchainDashboardPage />
              </Suspense>
            </Route>
            <Route path="/settings">
              <Suspense fallback={<LoadingScreen message="Loading settings..." />}>
                <SettingsPage />
              </Suspense>
            </Route>
            <Route path="/ai-assistant">
              <Suspense fallback={<LoadingScreen message="Loading AI assistant..." />}>
                <MysterionAIPage />
              </Suspense>
            </Route>
            <Route path="/ai/settings">
              <Suspense fallback={<LoadingScreen message="Loading AI settings..." />}>
                <AISettings />
              </Suspense>
            </Route>
            <Route path="/mobile-features">
              <Suspense fallback={<LoadingScreen message="Loading mobile features..." />}>
                <MobileFeatureDemo />
              </Suspense>
            </Route>
            <Route path="/mobile-feature">
              <Suspense fallback={<LoadingScreen message="Loading mobile features..." />}>
                <MobileFeatureDemo />
              </Suspense>
            </Route>
            <Route path="/admin">
              <Suspense fallback={<LoadingScreen message="Loading admin portal..." />}>
                <AdminPortal />
              </Suspense>
            </Route>
            <Route path="/legacy-dashboard">
              <Suspense fallback={<LoadingScreen message="Loading legacy dashboard..." />}>
                <Dashboard />
              </Suspense>
            </Route>
            <Route path="/onboarding">
              <Suspense fallback={<LoadingScreen message="Loading onboarding..." />}>
                <OnboardingPage />
              </Suspense>
            </Route>
            <Route path="/test">
              <Suspense fallback={<LoadingScreen message="Loading test page..." />}>
                <TestPage />
              </Suspense>
            </Route>
            <Route path="/escrow">
              <Suspense fallback={<LoadingScreen message="Loading escrow page..." />}>
                <EscrowPage />
              </Suspense>
            </Route>
            <Route path="/payment">
              <Suspense fallback={<LoadingScreen message="Loading payment page..." />}>
                <PaymentPage />
              </Suspense>
            </Route>
            <Route path="/transactions">
              <Suspense fallback={<LoadingScreen message="Loading transactions..." />}>
                <TransactionsPage />
              </Suspense>
            </Route>
            <Route path="/bridge">
              <Suspense fallback={<LoadingScreen message="Loading bridge..." />}>
                <BridgePage />
              </Suspense>
            </Route>
            <Route path="/bridge-test">
              <Suspense fallback={<LoadingScreen message="Loading bridge test..." />}>
                <BridgeTestPage />
              </Suspense>
            </Route>
            
            <Route path="/theme">
              <Suspense fallback={<LoadingScreen message="Loading theme settings..." />}>
                <ThemePage />
              </Suspense>
            </Route>
            <Route>
              <SimpleNotFound />
            </Route>
          </Switch>
        </main>
        
        <Toaster />
        
        {/* Add mobile bottom navigation for small screens */}
        {isMobile && (
          <BottomNavigation />
        )}
        
        {/* Add floating Mysterion AI Assistant to all pages except the AI Assistant page itself */}
        {location !== '/ai-assistant' && (
          <AIAssistant userId={1} />
        )}
      </div>
      </LiveModeProvider>
    </QueryClientProvider>
  );
}

export default App;
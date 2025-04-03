import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import AIAssistantDemo from "./pages/AIAssistantDemo";
import LandingPage from "./pages/LandingPage";
import Dashboard from "@/components/Dashboard";

// Create page components
const SimpleDashboard = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
    <div className="bg-card p-4 rounded-lg border mb-4">
      <h2 className="text-xl mb-2">Wallet Balance</h2>
      <p className="text-2xl font-bold">$15,557.00</p>
    </div>
    <div className="flex space-x-2 mt-4">
      <Link href="/settings">
        <Button>Go to Settings</Button>
      </Link>
      <Link href="/assets">
        <Button variant="outline">View Assets</Button>
      </Link>
      <Link href="/ai-assistant">
        <Button variant="outline">AI Assistant</Button>
      </Link>
    </div>
  </div>
);

const SimpleSettings = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold mb-4">Settings</h1>
    <div className="bg-card p-4 rounded-lg border mb-4">
      <h2 className="text-xl mb-2">Notification Settings</h2>
      <p>Configure your notification preferences</p>
    </div>
    <div className="mt-4">
      <Link href="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  </div>
);

const SimpleAssets = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold mb-4">Assets</h1>
    <div className="bg-card p-4 rounded-lg border mb-4">
      <h2 className="text-xl mb-2">Your Assets</h2>
      <p>Bitcoin: 0.35000000 BTC</p>
      <p>Ethereum: 1.50000000 ETH</p>
    </div>
    <div className="mt-4">
      <Link href="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  </div>
);

const SimpleNotFound = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
    <div className="mt-4">
      <Link href="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container w-full h-full">
        <div className="flex justify-between items-center p-4 bg-background border-b fixed top-0 left-0 right-0 z-50">
          <Link href="/">
            <h1 className="font-bold text-xl cursor-pointer">Aetherion</h1>
          </Link>
          <div className="flex space-x-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link href="/ai-assistant">
              <Button variant="ghost" size="sm">AI Assistant</Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="sm">Settings</Button>
            </Link>
          </div>
        </div>
        
        <main className="pt-[60px] h-[calc(100%-60px)] overflow-auto">
          <Switch>
            <Route path="/" component={LandingPage} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/settings" component={SimpleSettings} />
            <Route path="/assets" component={SimpleAssets} />
            <Route path="/ai-assistant" component={AIAssistantDemo} />
            <Route component={SimpleNotFound} />
          </Switch>
        </main>
        
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;

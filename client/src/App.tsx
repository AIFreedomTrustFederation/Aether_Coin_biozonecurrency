import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import AIAssistantDemo from "./pages/AIAssistantDemo";

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
        <Button>Back to Dashboard</Button>
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
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  </div>
);

const SimpleNotFound = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
    <div className="mt-4">
      <Link href="/">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container w-full h-full bg-background">
        <header className="bg-background border-b p-4 flex justify-between items-center">
          <h1 className="font-bold text-xl">Aetherion UI Wallet</h1>
          <div className="flex space-x-2">
            <Link href="/ai-assistant">
              <Button variant="ghost" size="sm">AI Assistant</Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="sm">Settings</Button>
            </Link>
          </div>
        </header>
        
        <main className="h-[calc(100%-4rem)] overflow-auto">
          <Switch>
            <Route path="/" component={SimpleDashboard} />
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

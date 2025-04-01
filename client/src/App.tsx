import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/Dashboard";
import Assets from "@/pages/Assets";
import Transactions from "@/pages/Transactions";
import Contracts from "@/pages/Contracts";
import WhitePaper from "@/pages/WhitePaper";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/assets" component={Assets} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/contracts" component={Contracts} />
      <Route path="/whitepaper" component={WhitePaper} />
      {/* Add more routes as needed */}
      {/* <Route path="/defi" component={DeFi} /> */}
      {/* <Route path="/nfts" component={NFTs} /> */}
      {/* <Route path="/settings" component={Settings} /> */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

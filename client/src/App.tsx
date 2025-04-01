import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      {/* Add more routes as needed */}
      {/* <Route path="/assets" component={Assets} /> */}
      {/* <Route path="/transactions" component={Transactions} /> */}
      {/* <Route path="/defi" component={DeFi} /> */}
      {/* <Route path="/nfts" component={NFTs} /> */}
      {/* <Route path="/contracts" component={SmartContractPage} /> */}
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

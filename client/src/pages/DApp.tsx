
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QuantumLoader } from "@/components/ui/quantum-loader";
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowLeft,
  ExternalLink,
  Github,
  LockKeyhole,
  Settings,
  User,
  Server
} from "lucide-react";

// Service worker registration status
enum ServiceStatus {
  UNREGISTERED = 'unregistered',
  PENDING = 'pending',
  REGISTERED = 'registered',
  FAILED = 'failed'
}

// SaaS service tier options
const serviceTiers = [
  {
    name: "Free",
    description: "Basic access to AetherCore DApp features",
    price: "$0",
    features: [
      "Limited token management",
      "Basic portfolio tracking",
      "Single node operation",
      "Community support"
    ],
    recommended: false
  },
  {
    name: "Standard",
    description: "Enhanced features for active ecosystem participants",
    price: "$24.99",
    billingPeriod: "per month",
    features: [
      "Full token management suite",
      "Advanced portfolio analytics",
      "Multiple node operation",
      "Priority support",
      "API access"
    ],
    recommended: true
  },
  {
    name: "Enterprise",
    description: "Complete solution for institutional users",
    price: "Custom",
    features: [
      "Unlimited token management",
      "Institutional-grade analytics",
      "Unlimited node operation",
      "Dedicated support team",
      "Full API access with higher rate limits",
      "Custom integration support"
    ],
    recommended: false
  }
];

// Features offered by the SaaS platform
const saasFeatures = [
  {
    title: "Secure Access",
    description: "Zero-trust security model with quantum-resistant encryption",
    icon: LockKeyhole
  },
  {
    title: "Cloud-Based",
    description: "Access your wallet and portfolio from any device, anywhere",
    icon: ExternalLink
  },
  {
    title: "User Management",
    description: "Create and manage multiple user accounts with different permission levels",
    icon: User
  },
  {
    title: "Node Hosting",
    description: "Operate nodes in our secure cloud environment without hardware requirements",
    icon: Server
  },
  {
    title: "Advanced Configuration",
    description: "Customize your DApp experience with powerful configuration options",
    icon: Settings
  },
  {
    title: "Enterprise Integration",
    description: "Connect with popular enterprise systems through our API",
    icon: ExternalLink
  }
];

// Main DApp component - SaaS landing page
const DApp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<ServiceStatus>(ServiceStatus.UNREGISTERED);
  const [selectedTier, setSelectedTier] = useState(1); // Default to Standard tier
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState({
    email: "",
    password: ""
  });

  // Simulate service worker registration
  useEffect(() => {
    setServiceWorkerStatus(ServiceStatus.PENDING);
    
    const timer = setTimeout(() => {
      // For demo purposes, we're simulating a successful registration
      setServiceWorkerStatus(ServiceStatus.REGISTERED);
      setLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      toast({
        title: "Login Successful",
        description: "Welcome to AetherCore DApp SaaS Platform!",
        variant: "default",
      });
      setLoading(false);
      // In a real implementation, this would navigate to the authenticated dashboard
    }, 1500);
  };

  const handleSignUp = (tierIndex: number) => {
    setSelectedTier(tierIndex);
    setShowLoginForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <QuantumLoader 
          size="lg" 
          variant="dual" 
          showLabel 
          labelText="Initializing AetherCore SaaS Platform..." 
        />
        <p className="text-gray-400 text-sm mt-8 max-w-md text-center">
          {serviceWorkerStatus === ServiceStatus.PENDING 
            ? "Establishing secure connection to the AetherCore SaaS environment..." 
            : "Connection established! Loading application..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <Navbar />
      
      <main className="flex-grow container py-8">
        {/* Hero Section */}
        <section className="py-12 md:py-20">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2 space-y-6">
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-forest-600 hover:bg-forest-700">AetherCore</Badge>
                <Badge className="bg-water-600 hover:bg-water-700">Decentralized</Badge>
                <Badge variant="outline" className="text-forest-700 border-forest-300">
                  SaaS Platform
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold">
                AetherCore <span className="gradient-text">DApp</span> as a Service
              </h1>
              
              <p className="text-lg text-muted-foreground">
                Access the complete AetherCore ecosystem through our cloud-based SaaS platform. 
                Manage tokens, stake assets, earn rewards, and participate in the Kingdom Economics 
                Framework without the complexity of self-hosting.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="bg-forest-600 hover:bg-forest-700"
                  onClick={() => setShowLoginForm(true)}
                >
                  Get Started
                </Button>
                <a 
                  href="https://github.com/AIFreedomTrustFederation/Aether_Coin_biozonecurrency" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="gap-2">
                    <Github className="h-4 w-4" />
                    View on GitHub
                  </Button>
                </a>
              </div>
            </div>
            
            <div className="md:w-1/2 relative">
              <div className="relative z-10 shadow-xl rounded-xl overflow-hidden border border-forest-200 dark:border-gray-700">
                <img 
                  src="https://images.unsplash.com/photo-1642781564668-3e44d5283bd3?q=80&w=1000&auto=format&fit=crop"
                  alt="AetherCore DApp Dashboard" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <h3 className="font-medium text-lg">Enterprise-Grade Dashboard</h3>
                    <p className="text-sm opacity-80">Secure, scalable, and feature-rich</p>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-8 -right-8 w-64 h-64 bg-forest-300/20 dark:bg-forest-900/20 rounded-full filter blur-3xl"></div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-water-300/20 dark:bg-water-900/20 rounded-full filter blur-3xl"></div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4">
              Enterprise Features, <span className="gradient-text">Cloud Delivery</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our SaaS platform delivers all the power of the AetherCore DApp ecosystem with the 
              convenience and reliability of cloud-based delivery.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {saasFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-forest-100 dark:border-gray-700 transition-all hover:shadow-md">
                  <CardHeader>
                    <div className="bg-forest-100 dark:bg-forest-900/40 p-3 w-fit rounded-lg text-forest-600 dark:text-forest-400 mb-3">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
        
        {/* Pricing Section */}
        <section className="py-12" id="pricing">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4">
              Simple, <span className="gradient-text">Transparent</span> Pricing
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that works best for your needs. All plans include our core SaaS features 
              with different levels of access and support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {serviceTiers.map((tier, index) => (
              <Card 
                key={index} 
                className={`border ${tier.recommended 
                  ? 'border-forest-400 dark:border-forest-600 shadow-lg' 
                  : 'border-gray-200 dark:border-gray-700'}`}
              >
                {tier.recommended && (
                  <div className="bg-forest-600 text-white text-center py-1 text-sm font-medium">
                    Recommended
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-3xl font-bold">{tier.price}</span>
                    {tier.billingPeriod && (
                      <span className="text-muted-foreground ml-1">{tier.billingPeriod}</span>
                    )}
                  </div>
                  
                  <ul className="space-y-2">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-forest-600 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${tier.recommended 
                      ? 'bg-forest-600 hover:bg-forest-700' 
                      : 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600'}`}
                    onClick={() => handleSignUp(index)}
                  >
                    {index === 2 ? "Contact Sales" : "Get Started"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16">
          <Card className="border-forest-100 dark:border-gray-700 bg-gradient-to-r from-forest-50 to-water-50 dark:from-forest-900/30 dark:to-water-900/30">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="space-y-4 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-display font-bold">
                    Ready to get started with AetherCore DApp?
                  </h3>
                  <p className="text-muted-foreground max-w-xl">
                    Join thousands of users already managing their tokens and participating in the AetherCore ecosystem 
                    through our secure SaaS platform.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="bg-forest-600 hover:bg-forest-700"
                    onClick={() => setShowLoginForm(true)}
                  >
                    Sign Up Now
                  </Button>
                  <Button variant="outline">
                    Schedule Demo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      
      {/* Login/Signup Dialog */}
      <Dialog open={showLoginForm} onOpenChange={setShowLoginForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Access AetherCore SaaS Platform</DialogTitle>
            <DialogDescription>
              Enter your credentials to access the platform or create a new account.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleLogin} className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input 
                id="email" 
                type="email" 
                value={loginCredentials.email}
                onChange={(e) => setLoginCredentials({...loginCredentials, email: e.target.value})}
                placeholder="your.email@example.com" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input 
                id="password" 
                type="password" 
                value={loginCredentials.password}
                onChange={(e) => setLoginCredentials({...loginCredentials, password: e.target.value})}
                placeholder="••••••••" 
                required 
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              Selected plan: <span className="font-medium">{serviceTiers[selectedTier].name}</span>
              {serviceTiers[selectedTier].price !== "Custom" && (
                <span> - {serviceTiers[selectedTier].price}{serviceTiers[selectedTier].billingPeriod ? ` ${serviceTiers[selectedTier].billingPeriod}` : ""}</span>
              )}
            </div>
            
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
              <Button variant="outline" type="button" onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <Button type="submit" className="bg-forest-600 hover:bg-forest-700">
                Login / Sign Up
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default DApp;

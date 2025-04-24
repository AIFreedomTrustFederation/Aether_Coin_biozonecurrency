import React, { useEffect, useState } from "react";
import { ScrollText, ArrowUpRight, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QuantumLoader } from "@/components/ui/quantum-loader";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ScrollKeeperPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleOpenApp = () => {
    window.open("https://scroll-keeper.aifreedomtrust.com", "_blank");
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-950 to-indigo-950">
        <QuantumLoader 
          size="lg" 
          variant="cosmos" 
          showLabel 
          labelText="Initializing Scroll Keeper..." 
        />
        <p className="text-blue-300 text-sm mt-8 max-w-md text-center">
          Connecting to the Scroll Keeper Dashboard...
        </p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-blue-950">
      <Navbar />
      
      <main className="flex-grow container py-12 md:py-20">
        <div className="w-full flex justify-start mb-6">
          <Button 
            asChild
            variant="outline"
            className="flex items-center gap-2"
          >
            <Link to="/">
              <Home className="h-4 w-4" />
              <span>Return to Homepage</span>
            </Link>
          </Button>
        </div>
      
        <div className="flex flex-col items-center text-center mb-16">
          <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-6">
            <ScrollText className="h-10 w-10 text-blue-600" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Scroll Keeper <span className="text-blue-600">Dashboard</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl">
            Access the Scroll Keeper application, a powerful real-time dashboard for monitoring
            and managing data across the Aetherion network.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="border-blue-100 dark:border-blue-800/50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <CardTitle>Launch Scroll Keeper Dashboard</CardTitle>
              <CardDescription>
                Click the button below to open the Scroll Keeper application in a new window
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-blue-100 dark:border-blue-800/50 shadow-lg mb-8">
                  <div className="h-8 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center px-3">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="w-full h-56 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded flex items-center justify-center">
                      <div className="text-center">
                        <ScrollText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-blue-700 dark:text-blue-400">Scroll Keeper Dashboard</h3>
                        <p className="text-sm text-muted-foreground mt-2">Real-time data management platform</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-6 py-6 h-auto font-medium"
                  onClick={handleOpenApp}
                >
                  <span>Launch Scroll Keeper Dashboard</span>
                  <ArrowUpRight className="ml-2 h-5 w-5" />
                </Button>
                
                <p className="text-sm text-muted-foreground mt-4">
                  The application will open in a new browser window
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 flex justify-center gap-4">
              <Button 
                variant="outline" 
                className="border-blue-300 dark:border-blue-700"
                onClick={() => window.history.back()}
              >
                Return to Previous Page
              </Button>
              <Button 
                asChild
                className="bg-forest-600 hover:bg-forest-700"
              >
                <Link to="/">
                  Return to Homepage
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-blue-100 dark:border-blue-800/50">
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <span>Real-time data monitoring and visualization</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <span>Network performance analysis and optimization</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <span>Resource allocation and management tools</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <span>Customizable dashboard with widget support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-blue-100 dark:border-blue-800/50">
              <CardHeader>
                <CardTitle>System Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <span>Modern web browser (Chrome, Firefox, Safari, Edge)</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <span>JavaScript enabled for interactive features</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <span>Internet connection for real-time updates</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <span>Minimum screen resolution of 1280x720</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ScrollKeeperPage;
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuantumLoader } from "@/components/ui/quantum-loader";
import { Network, Database, CloudUpload, Banknote, RotateCw } from "lucide-react";

type ApiOperation = {
  key: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  duration: number;
  loaderVariant: "forest" | "water" | "dual" | "cosmos";
};

const QuantumLoadingDemo: React.FC = () => {
  const [inlineLoading, setInlineLoading] = useState<string | null>(null);
  const [showFullscreenLoader, setShowFullscreenLoader] = useState(false);
  
  const apiOperations: ApiOperation[] = [
    {
      key: "transaction",
      name: "Process Transaction",
      description: "Simulate a FractalChain transaction processing cycle",
      icon: <Banknote className="h-5 w-5" />,
      duration: 3500,
      loaderVariant: "dual"
    },
    {
      key: "fetch-data",
      name: "Fetch Quantum Data",
      description: "Retrieve data from quantum-secure storage",
      icon: <Database className="h-5 w-5" />,
      duration: 4500,
      loaderVariant: "water"
    },
    {
      key: "consensus",
      name: "Reach Consensus",
      description: "Perform a πᾶς ἐν πᾶσιν consensus operation",
      icon: <RotateCw className="h-5 w-5" />,
      duration: 5000,
      loaderVariant: "forest"
    },
    {
      key: "multiplanetary",
      name: "Multiplanetary Sync",
      description: "Synchronize with Mars node infrastructure",
      icon: <Network className="h-5 w-5" />,
      duration: 6000,
      loaderVariant: "cosmos"
    }
  ];
  
  const simulateApiCall = (operation: ApiOperation) => {
    // Set inline loading for this specific card
    setInlineLoading(operation.key);
    
    // Simulate API call duration
    setTimeout(() => {
      setInlineLoading(null);
    }, operation.duration);
  };
  
  const simulateFullscreenLoading = () => {
    setShowFullscreenLoader(true);
    
    setTimeout(() => {
      setShowFullscreenLoader(false);
    }, 4000);
  };
  
  return (
    <section className="py-12 bg-muted/50 relative">
      {/* Fullscreen loader overlay */}
      {showFullscreenLoader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center">
            <QuantumLoader 
              size="lg" 
              variant="dual" 
              showLabel
              labelText="Performing quantum operations..."
            />
          </div>
        </div>
      )}
      
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Quantum-Inspired <span className="gradient-text">Loading States</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Integrate these loading animations throughout your application to represent
            quantum-inspired processing operations
          </p>
        </div>
        
        {/* Enhanced mobile-responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
          {apiOperations.map((operation) => (
            <Card key={operation.key} className="relative overflow-hidden flex flex-col h-full">
              <CardHeader className="pb-2 md:pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-muted flex items-center justify-center">
                    {operation.icon}
                  </div>
                  <CardTitle className="text-base md:text-lg">{operation.name}</CardTitle>
                </div>
                <CardDescription className="mt-2 text-sm md:text-base">
                  {operation.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 mt-auto">
                {inlineLoading === operation.key ? (
                  <div className="flex justify-center py-3">
                    <QuantumLoader 
                      size="sm" 
                      variant={operation.loaderVariant} 
                      showLabel={false}
                    />
                  </div>
                ) : (
                  <Button 
                    onClick={() => simulateApiCall(operation)}
                    variant="outline" 
                    className="w-full h-10 md:h-11 rounded-md"
                    size="lg"
                  >
                    Simulate Operation
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={simulateFullscreenLoading} 
            disabled={showFullscreenLoader}
            className="bg-gradient-to-r from-forest-600 to-water-600 hover:from-forest-700 hover:to-water-700 px-5 py-6 h-auto text-base"
            size="lg"
          >
            <CloudUpload className="mr-2 h-5 w-5" />
            Simulate Fullscreen Loading
          </Button>
        </div>
      </div>
    </section>
  );
};

export default QuantumLoadingDemo;
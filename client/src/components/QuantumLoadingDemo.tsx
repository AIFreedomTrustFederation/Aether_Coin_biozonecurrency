import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoading } from "@/contexts/LoadingContext";
import { QuantumLoader } from "@/components/ui/quantum-loader";
import { NetworkIcon, Database, CloudUpload, Banknote, RotateCw } from "lucide-react";

type ApiOperation = {
  key: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  duration: number;
  loaderVariant: "forest" | "water" | "dual" | "cosmos";
};

const QuantumLoadingDemo: React.FC = () => {
  const { startLoading, endLoading, isLoading } = useLoading();
  const [inlineLoading, setInlineLoading] = useState<string | null>(null);
  
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
      icon: <NetworkIcon className="h-5 w-5" />,
      duration: 6000,
      loaderVariant: "cosmos"
    }
  ];
  
  const simulateApiCall = (operation: ApiOperation) => {
    // Set inline loading for this specific card
    setInlineLoading(operation.key);
    
    // For fullscreen loading, uncomment this line:
    // startLoading(operation.key, `${operation.name} in progress...`);
    
    // Simulate API call duration
    setTimeout(() => {
      setInlineLoading(null);
      // For fullscreen loading, uncomment this line:
      // endLoading(operation.key);
    }, operation.duration);
  };
  
  const simulateFullscreenLoading = () => {
    startLoading("fullscreen-demo", "Performing quantum operations...");
    
    setTimeout(() => {
      endLoading("fullscreen-demo");
    }, 4000);
  };
  
  return (
    <section className="py-12 bg-muted/50">
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {apiOperations.map((operation) => (
            <Card key={operation.key} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {operation.icon}
                    <CardTitle className="text-base">{operation.name}</CardTitle>
                  </div>
                </div>
                <CardDescription>{operation.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {inlineLoading === operation.key ? (
                  <div className="flex justify-center py-2">
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
                    className="w-full"
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
            disabled={isLoading("fullscreen-demo")}
            className="bg-gradient-to-r from-forest-600 to-water-600 hover:from-forest-700 hover:to-water-700"
          >
            <CloudUpload className="mr-2 h-4 w-4" />
            Simulate Fullscreen Loading
          </Button>
        </div>
      </div>
    </section>
  );
};

export default QuantumLoadingDemo;
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Server, Cpu, HardDrive, Wifi } from "lucide-react";
import DeploymentModal from "./DeploymentModal";

interface NodeServiceProcessorProps {
  initialServiceType?: string;
}

/**
 * NodeServiceProcessor Component
 * 
 * Handles the process of deploying SaaS applications and services
 * on the FractalCoin node network.
 */
const NodeServiceProcessor: React.FC<NodeServiceProcessorProps> = ({
  initialServiceType = "webapp"
}) => {
  // State for deployment configuration
  const [serviceName, setServiceName] = useState("");
  const [serviceType, setServiceType] = useState(initialServiceType);
  const [resourceTier, setResourceTier] = useState("standard");
  const [estimatedPrice, setEstimatedPrice] = useState(45);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Toast notification
  const { toast } = useToast();
  
  // Resource tier price mapping
  const resourceTierPrices = {
    basic: 25,
    standard: 45,
    premium: 85,
    enterprise: 160,
    quantum: 300
  };
  
  // Resource tier mapping to level (1-5)
  const resourceTierLevels = {
    basic: 1,
    standard: 2,
    premium: 3,
    enterprise: 4,
    quantum: 5
  };
  
  // Handle resource tier selection
  const handleTierChange = (value: string) => {
    setResourceTier(value);
    setEstimatedPrice(resourceTierPrices[value as keyof typeof resourceTierPrices] || 45);
  };
  
  // Handle deployment submission
  const handleDeploy = () => {
    if (!serviceName.trim()) {
      toast({
        title: "Service name required",
        description: "Please provide a name for your service",
        variant: "destructive"
      });
      return;
    }
    
    // Open deployment modal
    setModalOpen(true);
  };
  
  // Handle deployment completion
  const handleDeploymentComplete = () => {
    // Reset form
    setServiceName("");
    setResourceTier("standard");
    setEstimatedPrice(45);
    
    // Show success message
    toast({
      title: "Deployment complete",
      description: "Your service is now running on the FractalCoin network",
      variant: "default"
    });
  };
  
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Deploy a Service</CardTitle>
          <CardDescription>
            Deploy your application on the FractalCoin decentralized node network
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service Configuration */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service-name">Service Name</Label>
              <Input
                id="service-name"
                placeholder="My Application"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                A unique name for your service that will be displayed in your dashboard
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service-type">Service Type</Label>
              <Select
                value={serviceType}
                onValueChange={setServiceType}
              >
                <SelectTrigger id="service-type">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webapp">
                    <div className="flex items-center">
                      <Server className="h-4 w-4 mr-2" />
                      <span>Web Application</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="api">
                    <div className="flex items-center">
                      <Wifi className="h-4 w-4 mr-2" />
                      <span>API Service</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ml">
                    <div className="flex items-center">
                      <Cpu className="h-4 w-4 mr-2" />
                      <span>ML/AI Model</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="storage">
                    <div className="flex items-center">
                      <HardDrive className="h-4 w-4 mr-2" />
                      <span>Storage Solution</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The type of service you want to deploy on the network
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="resource-tier">Resource Tier</Label>
              <Select
                value={resourceTier}
                onValueChange={handleTierChange}
              >
                <SelectTrigger id="resource-tier">
                  <SelectValue placeholder="Select resource tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (2 vCPUs, 4GB RAM)</SelectItem>
                  <SelectItem value="standard">Standard (4 vCPUs, 8GB RAM)</SelectItem>
                  <SelectItem value="premium">Premium (8 vCPUs, 16GB RAM)</SelectItem>
                  <SelectItem value="enterprise">Enterprise (16 vCPUs, 32GB RAM)</SelectItem>
                  <SelectItem value="quantum">Quantum (32 vCPUs, 64GB RAM)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose the resources your service needs
              </p>
            </div>
          </div>
          
          {/* Pricing Summary */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="font-medium">Estimated Price</h4>
                <p className="text-xs text-muted-foreground">Monthly subscription</p>
              </div>
              <div className="text-2xl font-bold">${estimatedPrice}</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Base price</span>
                <span>${estimatedPrice * 0.8}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Network fee</span>
                <span>${estimatedPrice * 0.15}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Security premium</span>
                <span>${estimatedPrice * 0.05}</span>
              </div>
              <div className="pt-2 border-t mt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>${estimatedPrice}</span>
              </div>
            </div>
          </div>
          
          {/* Deployment Action */}
          <Button 
            onClick={handleDeploy} 
            className="w-full bg-forest-600 hover:bg-forest-700"
          >
            Deploy Now
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            By deploying, you agree to our terms of service and acceptable use policy
          </p>
        </CardContent>
      </Card>
      
      {/* Deployment Modal */}
      <DeploymentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        deploymentName={serviceName}
        deploymentType={serviceType}
        resourceLevel={resourceTierLevels[resourceTier as keyof typeof resourceTierLevels] || 2}
        price={estimatedPrice}
        onDeploymentComplete={handleDeploymentComplete}
      />
    </>
  );
};

export default NodeServiceProcessor;
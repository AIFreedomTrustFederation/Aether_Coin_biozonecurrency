import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Server, Shield, Check, Loader2, Globe, Database, HardDrive, Wifi, Cpu } from "lucide-react";

interface DeploymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deploymentName: string;
  deploymentType: string;
  resourceLevel: number;
  price: number;
  onDeploymentComplete?: () => void;
}

/**
 * DeploymentModal Component
 * 
 * This modal handles the confirmation and processing of SaaS deployments on the
 * FractalCoin node network.
 */
const DeploymentModal: React.FC<DeploymentModalProps> = ({
  open,
  onOpenChange,
  deploymentName,
  deploymentType,
  resourceLevel,
  price,
  onDeploymentComplete
}) => {
  // Deployment processing states
  const [step, setStep] = useState<'confirmation' | 'processing' | 'complete'>('confirmation');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'crypto'>('crypto');
  const [deploymentKey, setDeploymentKey] = useState("");
  
  // Toast for notifications
  const { toast } = useToast();
  
  // Handle payment and deployment process
  const handleDeploy = () => {
    setIsProcessing(true);
    setStep('processing');
    
    // Simulate payment and deployment process
    setTimeout(() => {
      // Generate a random deployment key
      const randomKey = 'fc-' + Math.random().toString(36).substring(2, 10);
      setDeploymentKey(randomKey);
      
      setIsProcessing(false);
      setStep('complete');
      
      // Show success toast
      toast({
        title: "Deployment successful",
        description: `Your application "${deploymentName}" has been deployed`,
        variant: "default"
      });
    }, 3000);
  };
  
  // Handle close and completion
  const handleClose = () => {
    if (step === 'complete' && onDeploymentComplete) {
      onDeploymentComplete();
    }
    
    // Reset state for next open
    setStep('confirmation');
    setIsProcessing(false);
    onOpenChange(false);
  };
  
  // Get deployment type icon
  const getDeploymentTypeIcon = () => {
    const icons = {
      webapp: <Globe className="h-4 w-4 mr-2" />,
      database: <Database className="h-4 w-4 mr-2" />,
      storage: <HardDrive className="h-4 w-4 mr-2" />,
      api: <Wifi className="h-4 w-4 mr-2" />,
      ml: <Cpu className="h-4 w-4 mr-2" />
    };
    
    return icons[deploymentType as keyof typeof icons] || <Server className="h-4 w-4 mr-2" />;
  };
  
  // Format deployment type name
  const getDeploymentTypeName = () => {
    const names = {
      webapp: "Web Application",
      database: "Database Service",
      storage: "Storage Service",
      api: "API Service",
      ml: "ML/AI Model"
    };
    
    return names[deploymentType as keyof typeof names] || "Application";
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'confirmation' && 'Confirm Deployment'}
            {step === 'processing' && 'Processing Deployment'}
            {step === 'complete' && 'Deployment Complete'}
          </DialogTitle>
          <DialogDescription>
            {step === 'confirmation' && 'Review your deployment details before proceeding'}
            {step === 'processing' && 'Please wait while we process your deployment'}
            {step === 'complete' && 'Your application has been successfully deployed'}
          </DialogDescription>
        </DialogHeader>
        
        {step === 'confirmation' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Deployment Name</span>
                <span className="text-sm font-medium">{deploymentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Type</span>
                <span className="text-sm font-medium flex items-center">
                  {getDeploymentTypeIcon()}
                  {getDeploymentTypeName()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Resource Tier</span>
                <span className="text-sm font-medium">Tier {resourceLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="text-sm font-semibold">${price.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <Label className="mb-2 block">Payment Method</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={paymentMethod === 'credit' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setPaymentMethod('credit')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Credit Card
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'crypto' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setPaymentMethod('crypto')}
                >
                  <Server className="h-4 w-4 mr-2" />
                  FractalCoin
                </Button>
              </div>
              
              {paymentMethod === 'credit' && (
                <div className="mt-4 space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input id="card-number" placeholder="4242 4242 4242 4242" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" />
                    </div>
                  </div>
                </div>
              )}
              
              {paymentMethod === 'crypto' && (
                <div className="mt-4 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-forest-600" />
                    <span className="text-sm font-medium">Secure AetherSphere Payment</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your payment will be processed securely through the FractalCoin network
                    with quantum-resistant encryption.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {step === 'processing' && (
          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-forest-600" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm">Processing your deployment request</p>
              <p className="text-xs text-muted-foreground">This may take a few moments...</p>
            </div>
          </div>
        )}
        
        {step === 'complete' && (
          <div className="py-6 space-y-4">
            <div className="flex justify-center">
              <div className="bg-forest-100 dark:bg-forest-900/30 p-3 rounded-full">
                <Check className="h-8 w-8 text-forest-600" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-center">
                <p className="text-sm font-medium mb-1">Deployment Successful</p>
                <p className="text-xs text-muted-foreground">
                  Your application is now running on the FractalCoin network
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Deployment ID</span>
                  <span className="text-sm font-mono font-medium">{deploymentKey}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          {step === 'confirmation' && (
            <>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="button" 
                disabled={isProcessing} 
                onClick={handleDeploy}
                className="bg-forest-600 hover:bg-forest-700"
              >
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Deploy Now
              </Button>
            </>
          )}
          
          {step === 'processing' && (
            <Button type="button" variant="outline" disabled>
              Processing...
            </Button>
          )}
          
          {step === 'complete' && (
            <Button type="button" onClick={handleClose}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeploymentModal;
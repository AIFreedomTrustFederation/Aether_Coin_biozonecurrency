import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { XCircle } from "lucide-react";
import NodeServiceProcessor from "./NodeServiceProcessor";
import { useToast } from "@/hooks/use-toast";

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
  const [step, setStep] = useState<"confirm" | "pay" | "process">("confirm");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("crypto");
  const { toast } = useToast();
  
  // Reset state when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setStep("confirm");
    }
    onOpenChange(newOpen);
  };
  
  // Handle confirmation step
  const handleConfirm = () => {
    if (!email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    setStep("pay");
  };
  
  // Handle payment processing
  const handlePayment = () => {
    // In a real implementation, this would process the payment
    setStep("process");
  };
  
  // Handle deployment completion
  const handleDeploymentComplete = () => {
    if (onDeploymentComplete) {
      onDeploymentComplete();
    }
    
    // Close the modal after a delay
    setTimeout(() => {
      handleOpenChange(false);
    }, 1000);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Deployment</DialogTitle>
              <DialogDescription>
                Review your deployment details before proceeding to payment.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Deployment Name</Label>
                <div className="font-medium">{deploymentName}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <div className="font-medium capitalize">{deploymentType}</div>
                </div>
                <div className="space-y-2">
                  <Label>Resource Level</Label>
                  <div className="font-medium">Level {resourceLevel}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price</Label>
                  <div className="font-medium">${price}</div>
                </div>
                <div className="space-y-2">
                  <Label>Network</Label>
                  <div className="font-medium">FractalCoin Node Network</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Notification Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  We'll send notifications about your deployment to this email.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirm}>
                Continue to Payment
              </Button>
            </DialogFooter>
          </>
        )}
        
        {step === "pay" && (
          <>
            <DialogHeader>
              <DialogTitle>Payment Information</DialogTitle>
              <DialogDescription>
                Provide your payment details to deploy your application.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span>Total Amount:</span>
                <span className="text-xl font-bold">${price}</span>
              </div>
              
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={paymentMethod === "crypto" ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setPaymentMethod("crypto")}
                  >
                    Cryptocurrency
                  </Button>
                  <Button 
                    variant={paymentMethod === "card" ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setPaymentMethod("card")}
                  >
                    Credit Card
                  </Button>
                </div>
              </div>
              
              {paymentMethod === "crypto" && (
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50 text-center">
                    <p className="mb-2 text-sm">Send {price} USDC to:</p>
                    <div className="font-mono text-xs bg-white dark:bg-black p-2 rounded border overflow-hidden">
                      0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Your deployment will begin automatically once payment is confirmed.
                    </p>
                  </div>
                </div>
              )}
              
              {paymentMethod === "card" && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input id="card-number" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Cardholder Name</Label>
                    <Input id="name" placeholder="John Smith" />
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setStep("confirm")}
              >
                Back
              </Button>
              <Button onClick={handlePayment}>
                Complete Payment
              </Button>
            </DialogFooter>
          </>
        )}
        
        {step === "process" && (
          <>
            <DialogHeader>
              <DialogTitle>Deploying Your Application</DialogTitle>
              <DialogDescription>
                Your application is being deployed on the FractalCoin node network.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <NodeServiceProcessor 
                deploymentName={deploymentName}
                deploymentType={deploymentType}
                resourceLevel={resourceLevel}
                onCompleted={handleDeploymentComplete}
                onError={(error) => {
                  toast({
                    title: "Deployment Error",
                    description: error,
                    variant: "destructive"
                  });
                }}
              />
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => handleOpenChange(false)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Deployment
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DeploymentModal;
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GitBranch, CheckCircle2, AlertCircle, Clock } from "lucide-react";

interface NodeServiceProcessorProps {
  deploymentId?: string;
  deploymentName?: string;
  deploymentType?: string;
  resourceLevel?: number;
  onCompleted?: () => void;
  onError?: (error: string) => void;
}

/**
 * NodeServiceProcessor Component
 * 
 * This component handles the verification and processing of node service deployments.
 * It uses Merkle Tree verification to ensure proper resource allocation and security.
 */
const NodeServiceProcessor: React.FC<NodeServiceProcessorProps> = ({
  deploymentId = "auto-" + Math.random().toString(36).substring(2, 10),
  deploymentName = "Unnamed Deployment",
  deploymentType = "webapp",
  resourceLevel = 2,
  onCompleted,
  onError
}) => {
  const [processingStep, setProcessingStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"processing" | "completed" | "error">("processing");
  const [statusMessage, setStatusMessage] = useState("Initializing deployment process...");
  const [logs, setLogs] = useState<string[]>([]);
  
  // Define the steps in the deployment process
  const steps = [
    { id: 1, name: "Resource Verification", time: 3 },
    { id: 2, name: "Merkle Tree Construction", time: 5 },
    { id: 3, name: "Node Allocation", time: 4 },
    { id: 4, name: "Deployment Preparation", time: 6 },
    { id: 5, name: "Configuration", time: 3 },
    { id: 6, name: "Service Launch", time: 4 }
  ];
  
  // Total steps for progress calculation
  const totalSteps = steps.length;
  
  // Total time for the whole process (in seconds)
  const totalTime = steps.reduce((acc, step) => acc + step.time, 0);

  // Add a log entry with timestamp
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [...prevLogs, `[${timestamp}] ${message}`]);
  };

  // Simulate the deployment process
  useEffect(() => {
    if (status !== "processing") return;
    
    // Start the deployment process
    let currentStep = 1;
    let currentProgress = 0;
    
    // Add initial log
    addLog(`Starting deployment of "${deploymentName}" (ID: ${deploymentId})`);
    addLog(`Deployment type: ${deploymentType}, Resource level: ${resourceLevel}`);
    
    // Create interval to update progress and steps
    const interval = setInterval(() => {
      // Get current step details
      const step = steps.find(s => s.id === currentStep);
      
      if (!step) {
        // Process completed
        clearInterval(interval);
        setProgress(100);
        setStatus("completed");
        setStatusMessage("Deployment completed successfully!");
        addLog("✅ Deployment completed successfully!");
        
        if (onCompleted) {
          onCompleted();
        }
        return;
      }
      
      // Calculate progress increment for this step
      const stepProgressIncrement = (1 / totalTime) * 100;
      
      // Update progress
      currentProgress += stepProgressIncrement;
      setProgress(Math.min(Math.round(currentProgress), 99)); // Cap at 99% until complete
      
      // Step-specific logs
      if (currentProgress % 5 < 1) {
        switch (step.id) {
          case 1: // Resource Verification
            addLog(`Verifying available resources across the FractalCoin network...`);
            break;
          case 2: // Merkle Tree Construction
            addLog(`Constructing Merkle Tree for deployment verification...`);
            break;
          case 3: // Node Allocation
            addLog(`Allocating nodes based on resource requirements (Level ${resourceLevel})...`);
            break;
          case 4: // Deployment Preparation
            addLog(`Preparing deployment environment for ${deploymentType}...`);
            break;
          case 5: // Configuration
            addLog(`Configuring service with quantum-resistant security...`);
            break;
          case 6: // Service Launch
            addLog(`Launching service across distributed nodes...`);
            break;
          default:
            break;
        }
      }
      
      // Increment step counter after step time has passed
      if (Math.round(currentProgress / 100 * totalTime) >= 
          steps.slice(0, currentStep).reduce((acc, s) => acc + s.time, 0)) {
        if (currentStep < totalSteps) {
          currentStep += 1;
          setProcessingStep(currentStep);
          addLog(`Step ${currentStep}: ${steps[currentStep-1].name}`);
          
          // Update status message
          setStatusMessage(`Processing: ${steps[currentStep-1].name}`);
        }
      }
      
      // Simulate occasional issues (with recovery)
      if (Math.random() < 0.05 && currentStep < totalSteps) {
        addLog(`⚠️ Minor issue detected. Applying correction...`);
        setTimeout(() => {
          addLog(`✓ Issue resolved automatically. Continuing deployment.`);
        }, 1500);
      }
      
    }, 1000); // Update every second
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [deploymentId, deploymentName, deploymentType, resourceLevel, status, totalSteps, totalTime, onCompleted, onError]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{deploymentName}</h3>
          <p className="text-sm text-muted-foreground">Deployment ID: {deploymentId}</p>
        </div>
        <div className="flex items-center">
          {status === "processing" && (
            <Clock className="h-5 w-5 text-amber-500 mr-2 animate-pulse" />
          )}
          {status === "completed" && (
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
          )}
          {status === "error" && (
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          )}
          <span className="text-sm font-medium">
            {status === "processing" ? "Processing" : status === "completed" ? "Completed" : "Error"}
          </span>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>{statusMessage}</span>
          <span>{Math.min(progress, 100)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="grid grid-cols-3 gap-2 my-4">
        {steps.map(step => (
          <div 
            key={step.id}
            className={`
              border rounded p-2 text-center text-sm
              ${processingStep === step.id ? 'bg-forest-50 dark:bg-forest-900/20 border-forest-200 dark:border-forest-800' : ''}
              ${processingStep > step.id ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''}
            `}
          >
            {step.name}
            {processingStep > step.id && (
              <CheckCircle2 className="h-3 w-3 text-green-500 inline ml-1" />
            )}
          </div>
        ))}
      </div>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center mb-2">
            <GitBranch className="h-4 w-4 mr-2 text-forest-600" />
            <h4 className="text-sm font-medium">Deployment Logs</h4>
          </div>
          <div className="bg-black text-green-400 font-mono text-xs p-3 rounded-lg h-48 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          disabled={status === "processing"}
          onClick={() => window.location.reload()}
        >
          {status === "completed" ? "View Dashboard" : "Cancel"}
        </Button>
      </div>
    </div>
  );
};

export default NodeServiceProcessor;
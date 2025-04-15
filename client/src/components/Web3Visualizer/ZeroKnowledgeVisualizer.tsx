import React, { useState } from "react";
import { Shield, Lock, Key, Eye, EyeOff, ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * ZeroKnowledgeVisualizer Component
 * 
 * Visualizes the concept of Zero-Knowledge Proofs (ZKPs), where one party (the prover)
 * can prove to another party (the verifier) that they know a value x, without conveying
 * any information apart from the fact that they know the value x.
 */
const ZeroKnowledgeVisualizer: React.FC = () => {
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [commitment, setCommitment] = useState('');
  const [challenge, setChallenge] = useState('');
  const [response, setResponse] = useState('');
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Generate a simple commitment (hash) from the secret
  const generateCommitment = () => {
    if (!secret) return;
    
    // Simple hash simulation for demo
    const hash = Array.from(secret)
      .reduce((hash, char) => hash * 31 + char.charCodeAt(0), 0)
      .toString(16)
      .padStart(8, '0');
    
    setCommitment(`0x${hash}`);
    setCurrentStep(1);
  };

  // Generate a random challenge
  const generateChallenge = () => {
    // Generate a random challenge number
    const randomChallenge = Math.floor(Math.random() * 1000000).toString();
    setChallenge(randomChallenge);
    setCurrentStep(2);
  };

  // Generate a response using the secret and challenge
  const generateResponse = () => {
    // In a real ZKP, this would be a complex mathematical operation
    // For this demo, we'll do a simple combination
    const combinedValue = secret + challenge;
    const responseHash = Array.from(combinedValue)
      .reduce((hash, char) => hash * 31 + char.charCodeAt(0), 0)
      .toString(16)
      .padStart(8, '0');
    
    setResponse(`0x${responseHash}`);
    setCurrentStep(3);
  };

  // Verify the proof without revealing the secret
  const verifyProof = () => {
    // In a real ZKP, verification would check mathematical properties
    // For this demo, we'll simulate verification
    setVerificationResult(Boolean(secret && commitment && challenge && response));
    setCurrentStep(4);
  };

  // Reset the demo
  const resetDemo = () => {
    setSecret('');
    setCommitment('');
    setChallenge('');
    setResponse('');
    setVerificationResult(null);
    setCurrentStep(0);
  };

  return (
    <div className="w-full flex flex-col items-center p-4">
      <div className="space-y-6 w-full max-w-3xl">
        <h3 className="text-lg font-medium text-center">Zero-Knowledge Proof Demonstration</h3>
        <p className="text-sm text-center text-muted-foreground mb-4">
          See how you can prove knowledge of a secret without revealing the secret itself
        </p>
        
        {/* Step visualization */}
        <div className="relative mb-8">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2"></div>
          <div className="relative flex justify-between">
            {['Setup', 'Challenge', 'Response', 'Verification'].map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className={`z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep >= index 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span className="mt-2 text-xs">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Prover Side (You) */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-4">
              <Shield className="h-4 w-4 mr-2" />
              <h4 className="text-sm font-medium">Prover (You)</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="flex items-center text-xs mb-1">
                  <Key className="h-3 w-3 mr-1" />
                  Your Secret Value
                </Label>
                <div className="flex">
                  <Input
                    type={showSecret ? "text" : "password"}
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="Enter a secret value"
                    className="flex-grow h-8 text-sm"
                    disabled={currentStep > 0}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  This value will remain private and never revealed to the verifier
                </p>
              </div>
              
              {currentStep === 0 && (
                <Button 
                  size="sm" 
                  onClick={generateCommitment}
                  disabled={!secret}
                  className="w-full"
                >
                  Generate Commitment
                </Button>
              )}
              
              {commitment && (
                <div>
                  <Label className="flex items-center text-xs mb-1">
                    Public Commitment (Hash of Secret)
                  </Label>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-xs font-mono">
                    {commitment}
                  </div>
                </div>
              )}
              
              {currentStep === 2 && challenge && (
                <div>
                  <Label className="flex items-center text-xs mb-1">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    Generate Response to Challenge
                  </Label>
                  <Button 
                    size="sm" 
                    onClick={generateResponse}
                    className="w-full"
                  >
                    Create Zero-Knowledge Response
                  </Button>
                </div>
              )}
              
              {response && (
                <div>
                  <Label className="flex items-center text-xs mb-1">
                    Response (Based on Secret + Challenge)
                  </Label>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-xs font-mono">
                    {response}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Verifier Side */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-4">
              <Lock className="h-4 w-4 mr-2" />
              <h4 className="text-sm font-medium">Verifier</h4>
            </div>
            
            <div className="space-y-4">
              {commitment && (
                <div>
                  <Label className="flex items-center text-xs mb-1">
                    Received Public Commitment
                  </Label>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-xs font-mono">
                    {commitment}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    The verifier cannot determine your secret from this commitment
                  </p>
                </div>
              )}
              
              {currentStep === 1 && commitment && (
                <div>
                  <Label className="flex items-center text-xs mb-1">
                    Generate Challenge
                  </Label>
                  <Button 
                    size="sm" 
                    onClick={generateChallenge}
                    className="w-full"
                  >
                    Issue Random Challenge
                  </Button>
                </div>
              )}
              
              {challenge && (
                <div>
                  <Label className="flex items-center text-xs mb-1">
                    Challenge Issued
                  </Label>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-xs font-mono">
                    {challenge}
                  </div>
                </div>
              )}
              
              {currentStep === 3 && response && (
                <div>
                  <Label className="flex items-center text-xs mb-1">
                    Verify Proof
                  </Label>
                  <Button 
                    size="sm" 
                    onClick={verifyProof}
                    className="w-full"
                  >
                    Verify Zero-Knowledge Proof
                  </Button>
                </div>
              )}
              
              {verificationResult !== null && (
                <div className={`mt-4 p-3 rounded-lg ${
                  verificationResult 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                  <div className="flex items-center mb-1">
                    {verificationResult ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        <span className="font-medium">Proof Verified Successfully!</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        <span className="font-medium">Verification Failed</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs">
                    {verificationResult 
                      ? "The prover knows the secret without revealing it" 
                      : "The prover couldn't prove knowledge of the secret"}
                  </p>
                </div>
              )}
              
              {verificationResult === true && (
                <div className="border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <p className="text-xs text-yellow-800 dark:text-yellow-400 font-medium">Important Note:</p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-1">
                    The verifier is convinced you know the secret, but never learned what it is!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex justify-center space-x-2">
          <Button variant="outline" size="sm" onClick={resetDemo}>
            Reset Demo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ZeroKnowledgeVisualizer;
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, Play, Pause, Volume2, VolumeX, X } from "lucide-react";

// Define interaction types
type BaseInteraction = {
  type: string;
  instruction: string;
};

type ClickInteraction = BaseInteraction & {
  type: 'click';
  element: string;
};

type SelectInteraction = BaseInteraction & {
  type: 'select';
  options: string[];
};

type SliderInteraction = BaseInteraction & {
  type: 'slider';
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
  id: string;
};

type InputInteraction = BaseInteraction & {
  type: 'input';
  fields: { id: string; label: string }[];
};

type TextareaInteraction = BaseInteraction & {
  type: 'textarea';
  id: string;
  placeholder?: string;
};

type ToggleInteraction = BaseInteraction & {
  type: 'toggle';
  id: string;
  label: string;
};

type HoverInteraction = BaseInteraction & {
  type: 'hover';
  elements: string[];
};

type DragInteraction = BaseInteraction & {
  type: 'drag';
  elements: string[];
  targets: string[];
};

type Interaction = 
  | ClickInteraction
  | SelectInteraction
  | SliderInteraction
  | InputInteraction
  | TextareaInteraction
  | ToggleInteraction
  | HoverInteraction
  | DragInteraction;

// Define tutorial section types
type TutorialStep = {
  title: string;
  content: string;
  audioSrc: string;
  image: string;
  interactions: Interaction[];
};

type TutorialSection = {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
};

// Tutorial content by section
const tutorialSections: TutorialSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics of Aetherion and how to set up your account",
    steps: [
      {
        title: "Welcome to Aetherion",
        content: "Aetherion is a quantum-resistant blockchain ecosystem that combines advanced security with powerful features for Web3 users. This tutorial will guide you through all major features.",
        audioSrc: "/tutorial/audio/welcome.mp3",
        image: "/tutorial/images/welcome.svg",
        interactions: [{
          type: "click",
          element: "#wallet-connect-button",
          instruction: "Click here to connect your wallet"
        }]
      },
      {
        title: "Connecting Your Wallet",
        content: "Aetherion supports various wallets including MetaMask, Coinbase, and Trust Wallet. Select your preferred wallet to connect securely to the platform.",
        audioSrc: "/tutorial/audio/connect-wallet.mp3",
        image: "/tutorial/images/wallet-connect.svg",
        interactions: [{
          type: "select",
          options: ["MetaMask", "Coinbase", "Trust Wallet", "Other"],
          instruction: "Select your preferred wallet"
        }]
      },
      {
        title: "Dashboard Overview",
        content: "Your dashboard is your command center for all Aetherion activities. Here you can monitor your assets, track mining rewards, manage domains, and access all platform features.",
        audioSrc: "/tutorial/audio/dashboard.mp3",
        image: "/tutorial/images/dashboard.svg",
        interactions: [{
          type: "hover",
          elements: ["#asset-panel", "#mining-panel", "#domains-panel"],
          instruction: "Hover over each panel to learn more"
        }]
      }
    ]
  },
  {
    id: "quantum-security",
    title: "Quantum Security",
    description: "Understand Aetherion's quantum-resistant technology",
    steps: [
      {
        title: "Quantum Resistance Basics",
        content: "Aetherion uses post-quantum cryptography to secure your assets against both current and future quantum computing threats, ensuring your holdings remain safe even as computing advances.",
        audioSrc: "/tutorial/audio/quantum-basics.mp3",
        image: "/tutorial/images/quantum-security.svg",
        interactions: [{
          type: "click",
          element: "#quantum-status-indicator",
          instruction: "Click to check your wallet's quantum security status"
        }]
      },
      {
        title: "Security Layers",
        content: "Multiple security layers protect your assets: CRYSTAL-Kyber encryption, SPHINCS+ signatures, Recursive Merkle trees, and zero-knowledge proofs all work together to create comprehensive protection.",
        audioSrc: "/tutorial/audio/security-layers.mp3",
        image: "/tutorial/images/security-layers.svg",
        interactions: [{
          type: "drag",
          elements: ["#layer1", "#layer2", "#layer3", "#layer4"],
          targets: ["#target1", "#target2", "#target3", "#target4"],
          instruction: "Drag each security layer to its correct position"
        }]
      },
      {
        title: "Quantum Vault",
        content: "The Quantum Vault provides enhanced security for your most valuable assets using fractal sharding to distribute encrypted data across the network.",
        audioSrc: "/tutorial/audio/quantum-vault.mp3",
        image: "/tutorial/images/quantum-vault.svg",
        interactions: [{
          type: "click",
          element: "#enable-vault-button",
          instruction: "Click to enable your Quantum Vault"
        }]
      }
    ]
  },
  {
    id: "recurve-system",
    title: "Recurve Fractal Reserve",
    description: "Learn about Aetherion's innovative financial system",
    steps: [
      {
        title: "Recurve System Introduction",
        content: "The Recurve Fractal Reserve system allows you to mint cryptocurrency tokens backed by real-world insurance policies, creating a stable and secure financial foundation.",
        audioSrc: "/tutorial/audio/recurve-intro.mp3",
        image: "/tutorial/images/recurve-system.svg",
        interactions: [{
          type: "click",
          element: "#recurve-dashboard-button",
          instruction: "Click to open the Recurve dashboard"
        }]
      },
      {
        title: "Connecting Insurance Policies",
        content: "Connect your insurance policy to mint Recurve Tokens. The system supports whole life and indexed universal life policies, creating a bridge between traditional finance and cryptocurrency.",
        audioSrc: "/tutorial/audio/insurance-connect.mp3",
        image: "/tutorial/images/insurance-policy.svg",
        interactions: [{
          type: "input",
          fields: [
            { id: "policy-number", label: "Policy Number" },
            { id: "provider", label: "Insurance Provider" }
          ],
          instruction: "Enter your policy details (demo only)"
        }]
      },
      {
        title: "Minting Recurve Tokens",
        content: "Mint Recurve Tokens backed by your policy's cash value. You can choose different collateralization ratios, affecting both security and potential returns.",
        audioSrc: "/tutorial/audio/mint-tokens.mp3",
        image: "/tutorial/images/mint-tokens.svg",
        interactions: [{
          type: "slider",
          id: "collateralization-ratio",
          min: 100,
          max: 300,
          step: 25,
          defaultValue: 150,
          instruction: "Adjust the collateralization ratio"
        }]
      },
      {
        title: "Taking Fractal Loans",
        content: "Fractal Loans allow you to borrow against your Recurve Tokens without risk of liquidation. These non-recourse loans maintain your policy's integrity while providing capital access.",
        audioSrc: "/tutorial/audio/fractal-loans.mp3", 
        image: "/tutorial/images/fractal-loan.svg",
        interactions: [{
          type: "input",
          fields: [
            { id: "loan-amount", label: "Loan Amount" },
            { id: "loan-term", label: "Term (months)" }
          ],
          instruction: "Enter loan parameters (demo only)"
        }]
      }
    ]
  },
  {
    id: "token-mining",
    title: "Mining & Staking",
    description: "Learn how to earn SING and FractalCoin",
    steps: [
      {
        title: "SING Coin Mining",
        content: "Earn SING coins by contributing processing power to train the Mysterion AI. Unlike traditional mining, your resources directly improve the platform's intelligence.",
        audioSrc: "/tutorial/audio/sing-mining.mp3",
        image: "/tutorial/images/sing-mining.svg",
        interactions: [{
          type: "click",
          element: "#start-mining-button",
          instruction: "Click to simulate starting mining"
        }]
      },
      {
        title: "FractalCoin Storage Contribution",
        content: "Earn FractalCoin by allocating storage space to the network. Your contribution helps host websites, store data, and power the decentralized infrastructure.",
        audioSrc: "/tutorial/audio/fractalcoin.mp3",
        image: "/tutorial/images/storage-allocation.svg",
        interactions: [{
          type: "slider",
          id: "storage-allocation",
          min: 50,
          max: 1000,
          step: 50,
          defaultValue: 100,
          instruction: "Adjust storage allocation (GB)"
        }]
      },
      {
        title: "Staking & Liquidity Pools",
        content: "Provide liquidity in paired trading pools or stake your tokens to earn rewards. Different pools and staking options offer varying risk and return profiles.",
        audioSrc: "/tutorial/audio/staking.mp3",
        image: "/tutorial/images/liquidity-pools.svg",
        interactions: [{
          type: "select",
          options: ["SING/ETH Pool", "FTC/USDC Pool", "SING Staking", "FTC Staking"],
          instruction: "Select a staking or liquidity option"
        }]
      }
    ]
  },
  {
    id: "domain-hosting",
    title: "Domain Hosting",
    description: "Host websites on the decentralized network",
    steps: [
      {
        title: "Domain Hosting Introduction",
        content: "Host websites on Aetherion's decentralized network with high performance, censorship resistance, and quantum security. Support both .trust domains and traditional domains.",
        audioSrc: "/tutorial/audio/domain-intro.mp3",
        image: "/tutorial/images/domain-hosting.svg",
        interactions: [{
          type: "click",
          element: "#domain-dashboard-button",
          instruction: "Click to open the Domain dashboard"
        }]
      },
      {
        title: "Registering a Domain",
        content: "Register a .trust domain native to the Aetherion ecosystem, or connect a traditional domain like .com or .org that you already own.",
        audioSrc: "/tutorial/audio/register-domain.mp3",
        image: "/tutorial/images/domain-register.svg",
        interactions: [{
          type: "input",
          fields: [
            { id: "domain-name", label: "Domain Name" },
            { id: "domain-extension", label: "Extension" }
          ],
          instruction: "Enter domain details (demo only)"
        }]
      },
      {
        title: "AI Website Generator",
        content: "Create complete websites by simply describing what you want in plain language. The AI will generate designs, layouts, and content based on your specifications.",
        audioSrc: "/tutorial/audio/ai-website.mp3",
        image: "/tutorial/images/ai-generator.svg",
        interactions: [{
          type: "textarea",
          id: "website-description",
          placeholder: "Describe the website you want to create...",
          instruction: "Enter a website description (demo only)"
        }]
      }
    ]
  },
  {
    id: "mysterion-assistant",
    title: "Mysterion AI",
    description: "Work with your AI assistant effectively",
    steps: [
      {
        title: "Mysterion Introduction",
        content: "Mysterion is your AI assistant in the Aetherion ecosystem. Ask questions, verify transactions, get recommendations, and receive personalized assistance throughout your journey.",
        audioSrc: "/tutorial/audio/mysterion-intro.mp3",
        image: "/tutorial/images/mysterion.svg",
        interactions: [{
          type: "click",
          element: "#chat-with-mysterion",
          instruction: "Click to start chatting with Mysterion"
        }]
      },
      {
        title: "Training Mysterion",
        content: "Help improve Mysterion by contributing training data and processing power. You'll earn SING tokens while making the AI more helpful for everyone.",
        audioSrc: "/tutorial/audio/training.mp3",
        image: "/tutorial/images/mysterion-training.svg",
        interactions: [{
          type: "toggle",
          id: "enable-training",
          label: "Enable AI Training",
          instruction: "Toggle to enable or disable training"
        }]
      },
      {
        title: "Advanced Prompting",
        content: "Learn how to effectively communicate with Mysterion using specific prompts that get better results. Mastering these techniques will make the AI more helpful.",
        audioSrc: "/tutorial/audio/advanced-prompting.mp3",
        image: "/tutorial/images/prompt-techniques.svg",
        interactions: [{
          type: "select",
          options: [
            "Tell me about...",
            "I need help with...",
            "How do I...?",
            "Compare X and Y"
          ],
          instruction: "Select a prompt template"
        }]
      }
    ]
  }
];

interface InteractiveTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: string;
}

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  isOpen,
  onClose,
  initialSection = "getting-started"
}) => {
  const [activeSection, setActiveSection] = useState(initialSection);
  const [step, setStep] = useState(0);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const currentSection = tutorialSections.find(section => section.id === activeSection);
  const currentStep = currentSection?.steps[step];
  const totalSteps = currentSection?.steps.length || 0;
  const progress = totalSteps > 0 ? ((step + 1) / totalSteps) * 100 : 0;
  
  useEffect(() => {
    // Reset step when changing sections
    setStep(0);
  }, [activeSection]);
  
  useEffect(() => {
    // Handle audio playback based on playing state
    if (audioRef.current) {
      if (playing) {
        audioRef.current.play().catch(e => console.error("Audio play error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [playing, step, activeSection]);
  
  const handleNext = () => {
    if (step < (totalSteps - 1)) {
      setStep(step + 1);
    } else {
      // Find the next section
      const currentIndex = tutorialSections.findIndex(section => section.id === activeSection);
      if (currentIndex < tutorialSections.length - 1) {
        setActiveSection(tutorialSections[currentIndex + 1].id);
      }
    }
  };
  
  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      // Find the previous section
      const currentIndex = tutorialSections.findIndex(section => section.id === activeSection);
      if (currentIndex > 0) {
        const prevSection = tutorialSections[currentIndex - 1];
        setActiveSection(prevSection.id);
        setStep(prevSection.steps.length - 1);
      }
    }
  };
  
  const toggleAudio = () => {
    if (audioRef.current) {
      audioRef.current.muted = !muted;
      setMuted(!muted);
    }
  };
  
  const togglePlayback = () => {
    setPlaying(!playing);
  };
  
  if (!isOpen) return null;
  
  // Mock function to simulate interaction
  const handleInteraction = (type: string) => {
    console.log(`Simulated ${type} interaction`);
    // In a real implementation, this would track progress and possibly change content
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center justify-between">
            <span>Interactive Aetherion Tutorial</span>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleAudio} 
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={togglePlayback} 
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose} 
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            Explore Aetherion's features through this interactive tutorial. Navigate between sections and steps to learn at your own pace.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeSection} onValueChange={setActiveSection} className="mt-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {tutorialSections.map(section => (
              <TabsTrigger key={section.id} value={section.id} className="text-xs md:text-sm">
                {section.title}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {tutorialSections.map(section => (
            <TabsContent key={section.id} value={section.id} className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                  <Progress value={progress} className="h-2 mt-2" />
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {section.id === activeSection && currentStep && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">{currentStep.title}</h3>
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <p className="text-base mb-4">{currentStep.content}</p>
                          
                          {/* Audio element (hidden) */}
                          <audio 
                            ref={audioRef} 
                            src={currentStep.audioSrc} 
                            muted={muted}
                            onEnded={() => console.log("Audio ended")}
                            className="hidden"
                          />
                          
                          {/* Interactive elements */}
                          <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                            <h4 className="font-medium mb-2">Try it yourself:</h4>
                            
                            {currentStep.interactions.map((interaction, idx) => (
                              <div key={idx} className="my-3">
                                {interaction.type === 'click' && (
                                  <Button onClick={() => handleInteraction('click')}>
                                    {interaction.instruction}
                                  </Button>
                                )}
                                
                                {interaction.type === 'select' && 'options' in interaction && (
                                  <div className="space-y-2">
                                    <label htmlFor="tutorial-select" className="text-sm">{interaction.instruction}</label>
                                    <select 
                                      id="tutorial-select"
                                      className="w-full p-2 border rounded"
                                      onChange={() => handleInteraction('select')}
                                      aria-label={interaction.instruction}
                                    >
                                      <option value="">-- Select an option --</option>
                                      {interaction.options.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                                
                                {interaction.type === 'slider' && (
                                  <div className="space-y-2">
                                    <label htmlFor={interaction.id} className="text-sm">{interaction.instruction}</label>
                                    <input 
                                      id={interaction.id}
                                      type="range" 
                                      min={interaction.min} 
                                      max={interaction.max} 
                                      step={interaction.step || 1}
                                      defaultValue={interaction.defaultValue || interaction.min}
                                      aria-label={interaction.instruction}
                                      className="w-full"
                                      onChange={() => handleInteraction('slider')}
                                    />
                                  </div>
                                )}
                                
                                {interaction.type === 'input' && 'fields' in interaction && (
                                  <div className="space-y-3">
                                    <p className="text-sm">{interaction.instruction}</p>
                                    {interaction.fields.map(field => (
                                      <div key={field.id} className="space-y-1">
                                        <label htmlFor={field.id} className="text-sm font-medium">
                                          {field.label}
                                        </label>
                                        <input 
                                          id={field.id}
                                          type="text" 
                                          className="w-full p-2 border rounded"
                                          onChange={() => handleInteraction('input')}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {interaction.type === 'textarea' && 'id' in interaction && (
                                  <div className="space-y-2">
                                    <p className="text-sm">{interaction.instruction}</p>
                                    <textarea 
                                      id={interaction.id}
                                      placeholder={'placeholder' in interaction ? interaction.placeholder : ''}
                                      className="w-full p-2 border rounded h-24"
                                      onChange={() => handleInteraction('textarea')}
                                    />
                                  </div>
                                )}
                                
                                {interaction.type === 'toggle' && 'id' in interaction && 'label' in interaction && (
                                  <div className="flex items-center space-x-2">
                                    <input 
                                      type="checkbox" 
                                      id={interaction.id}
                                      className="rounded"
                                      onChange={() => handleInteraction('toggle')}
                                    />
                                    <label htmlFor={interaction.id} className="text-sm">
                                      {interaction.label}
                                    </label>
                                  </div>
                                )}
                                
                                {interaction.type === 'hover' && 'elements' in interaction && (
                                  <div className="space-y-2">
                                    <p className="text-sm">{interaction.instruction}</p>
                                    <div className="flex flex-wrap gap-2">
                                      {interaction.elements.map((element, i) => (
                                        <div 
                                          key={i}
                                          className="p-2 border rounded bg-muted/30 hover:bg-primary/10 cursor-pointer transition-colors"
                                          onMouseEnter={() => handleInteraction('hover')}
                                        >
                                          {element.replace('#', '')}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {interaction.type === 'drag' && 'elements' in interaction && 'targets' in interaction && (
                                  <div className="space-y-2">
                                    <p className="text-sm">{interaction.instruction}</p>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <p className="text-xs font-medium">Elements</p>
                                        {interaction.elements.map((element, i) => (
                                          <div 
                                            key={i}
                                            className="p-2 border rounded bg-muted/30 cursor-grab"
                                            onClick={() => handleInteraction('drag')}
                                          >
                                            {element.replace('#', '')}
                                          </div>
                                        ))}
                                      </div>
                                      <div className="space-y-2">
                                        <p className="text-xs font-medium">Targets</p>
                                        {interaction.targets.map((target, i) => (
                                          <div 
                                            key={i}
                                            className="p-2 border border-dashed rounded bg-muted/10"
                                          >
                                            {target.replace('#', '')}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Visual demonstration */}
                        <div className="flex-1 flex justify-center items-center">
                          <div className="w-full max-w-sm aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            <div className="text-center text-gray-500">
                              <p>[Visual Demonstration]</p>
                              <p className="text-sm">({currentStep.image})</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={handlePrevious}
                    disabled={step === 0 && activeSection === tutorialSections[0].id}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  
                  <Button 
                    onClick={handleNext}
                    disabled={step === totalSteps - 1 && activeSection === tutorialSections[tutorialSections.length - 1].id}
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default InteractiveTutorial;
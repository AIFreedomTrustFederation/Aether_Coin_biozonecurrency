import React, { useState, useEffect } from "react";
import { Network, Cpu, Coins, Users, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * ConsensusVisualizer Component
 * 
 * Visualizes how different consensus mechanisms work in blockchain networks,
 * including Proof of Work, Proof of Stake, and PBFT.
 */
const ConsensusVisualizer: React.FC = () => {
  const [activeConsensus, setActiveConsensus] = useState<"pow" | "pos" | "pbft">("pow");
  const [simulating, setSimulating] = useState(false);
  const [step, setStep] = useState(0);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [blockFound, setBlockFound] = useState(false);
  const [winningNode, setWinningNode] = useState<number | null>(null);
  const [confirmation, setConfirmation] = useState(0);
  
  interface Node {
    id: number;
    status: "idle" | "active" | "winner" | "validator";
    stake?: number;
    voted?: boolean;
    confirmed?: boolean;
  }
  
  // Initialize nodes for each consensus mechanism
  useEffect(() => {
    resetSimulation();
  }, [activeConsensus]);
  
  // Reset simulation state
  const resetSimulation = () => {
    setSimulating(false);
    setStep(0);
    setBlockFound(false);
    setWinningNode(null);
    setConfirmation(0);
    
    if (activeConsensus === "pow") {
      // For PoW, all nodes have equal chance
      setNodes(Array.from({ length: 6 }, (_, i) => ({ 
        id: i, 
        status: "idle" 
      })));
    } 
    else if (activeConsensus === "pos") {
      // For PoS, nodes have different stake amounts
      setNodes(Array.from({ length: 6 }, (_, i) => ({ 
        id: i, 
        status: "idle",
        stake: Math.floor(Math.random() * 90) + 10 // 10-99 stake
      })));
    }
    else if (activeConsensus === "pbft") {
      // For PBFT, some nodes are validators
      setNodes(Array.from({ length: 6 }, (_, i) => ({ 
        id: i, 
        status: i < 4 ? "validator" : "idle", // First 4 are validators
        voted: false,
        confirmed: false
      })));
    }
  };
  
  // Start simulation
  const startSimulation = () => {
    setSimulating(true);
    setStep(1);
    
    // Schedule steps based on consensus type
    const simulationTimer = setTimeout(() => {
      if (activeConsensus === "pow") {
        simulatePoW();
      } else if (activeConsensus === "pos") {
        simulatePoS();
      } else if (activeConsensus === "pbft") {
        simulatePBFT();
      }
    }, 1500);
    
    return () => clearTimeout(simulationTimer);
  };
  
  // Simulate Proof of Work consensus
  const simulatePoW = () => {
    // All nodes start mining
    setNodes(nodes.map(node => ({
      ...node,
      status: "active"
    })));
    
    setStep(2);
    
    // After some time, one node finds a block
    setTimeout(() => {
      const winner = Math.floor(Math.random() * nodes.length);
      setWinningNode(winner);
      setBlockFound(true);
      
      setNodes(nodes.map((node, idx) => ({
        ...node,
        status: idx === winner ? "winner" : "active"
      })));
      
      setStep(3);
      
      // Nodes start confirming the block
      setTimeout(() => {
        simulateConfirmations();
      }, 1500);
    }, 2000);
  };
  
  // Simulate Proof of Stake consensus
  const simulatePoS = () => {
    // Validators are selected based on stake
    setNodes(nodes.map(node => ({
      ...node,
      status: "active"
    })));
    
    setStep(2);
    
    // After some time, a validator is selected based on stake
    setTimeout(() => {
      // Weight selection by stake
      const totalStake = nodes.reduce((sum, node) => sum + (node.stake || 0), 0);
      let randomStake = Math.random() * totalStake;
      let winner = 0;
      let cumulativeStake = 0;
      
      for (let i = 0; i < nodes.length; i++) {
        cumulativeStake += (nodes[i].stake || 0);
        if (randomStake <= cumulativeStake) {
          winner = i;
          break;
        }
      }
      
      setWinningNode(winner);
      setBlockFound(true);
      
      setNodes(nodes.map((node, idx) => ({
        ...node,
        status: idx === winner ? "winner" : "active"
      })));
      
      setStep(3);
      
      // Nodes start confirming the block
      setTimeout(() => {
        simulateConfirmations();
      }, 1500);
    }, 2000);
  };
  
  // Simulate PBFT consensus
  const simulatePBFT = () => {
    // Only validators participate
    setStep(2);
    
    // Pre-prepare phase - a primary validator proposes a block
    setTimeout(() => {
      const primaryValidator = 0; // First validator is primary
      setWinningNode(primaryValidator);
      
      setNodes(nodes.map((node, idx) => ({
        ...node,
        status: idx === primaryValidator ? "winner" : (node.status === "validator" ? "validator" : "idle")
      })));
      
      // Prepare phase - validators vote
      setTimeout(() => {
        setNodes(nodes.map(node => {
          if (node.status === "validator" || node.status === "winner") {
            return {
              ...node,
              voted: Math.random() > 0.2 // 80% chance to vote yes
            };
          }
          return node;
        }));
        
        setStep(3);
        
        // Commit phase - if 2/3+ validators agreed, commit the block
        setTimeout(() => {
          const validators = nodes.filter(n => n.status === "validator" || n.status === "winner");
          const votedYes = validators.filter(n => n.voted).length;
          
          if (votedYes >= Math.ceil(validators.length * 2/3)) {
            setBlockFound(true);
            
            // All validators confirm at once
            setNodes(nodes.map(node => {
              if (node.status === "validator" || node.status === "winner") {
                return {
                  ...node,
                  confirmed: true
                };
              }
              return node;
            }));
            
            setConfirmation(validators.length);
            
            // Non-validators confirm
            setTimeout(() => {
              simulateConfirmations();
            }, 1500);
          } else {
            // Consensus failed
            setNodes(nodes.map(node => ({
              ...node,
              status: node.status === "winner" ? "active" : node.status,
              voted: false
            })));
            
            setWinningNode(null);
            setStep(4);
          }
        }, 1500);
      }, 1500);
    }, 1500);
  };
  
  // Simulate block confirmations
  const simulateConfirmations = () => {
    let currentConfirmation = confirmation;
    
    const confirmInterval = setInterval(() => {
      if (currentConfirmation >= nodes.length - 1) {
        clearInterval(confirmInterval);
        setStep(4);
        setSimulating(false);
        return;
      }
      
      currentConfirmation++;
      setConfirmation(currentConfirmation);
      
      // Randomly select a node to confirm that hasn't already
      const unconfirmedNodes = nodes.filter((node, idx) => 
        idx !== winningNode && (!node.confirmed) && 
        (activeConsensus !== "pbft" || node.status !== "validator")
      );
      
      if (unconfirmedNodes.length > 0) {
        const randomNodeIdx = Math.floor(Math.random() * unconfirmedNodes.length);
        const nodeToConfirm = unconfirmedNodes[randomNodeIdx];
        
        setNodes(nodes.map(node => 
          node.id === nodeToConfirm.id 
            ? { ...node, confirmed: true }
            : node
        ));
      }
    }, 800);
    
    return () => clearInterval(confirmInterval);
  };
  
  return (
    <div className="w-full flex flex-col items-center p-4">
      <div className="space-y-6 w-full max-w-3xl">
        <h3 className="text-lg font-medium text-center">Consensus Mechanisms</h3>
        <p className="text-sm text-center text-muted-foreground mb-4">
          See how nodes reach agreement in different blockchain networks
        </p>
        
        {/* Consensus Type Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <Button 
            variant={activeConsensus === "pow" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveConsensus("pow");
              resetSimulation();
            }}
            disabled={simulating}
            className="flex items-center"
          >
            <Cpu className="mr-1 h-4 w-4" />
            Proof of Work
          </Button>
          
          <Button 
            variant={activeConsensus === "pos" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveConsensus("pos");
              resetSimulation();
            }}
            disabled={simulating}
            className="flex items-center"
          >
            <Coins className="mr-1 h-4 w-4" />
            Proof of Stake
          </Button>
          
          <Button 
            variant={activeConsensus === "pbft" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveConsensus("pbft");
              resetSimulation();
            }}
            disabled={simulating}
            className="flex items-center"
          >
            <Users className="mr-1 h-4 w-4" />
            PBFT
          </Button>
        </div>
        
        {/* Simulation Progress */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium">Simulation Progress</h4>
            <Badge variant={simulating ? "default" : "outline"}>
              {simulating ? "Simulating..." : step === 0 ? "Not Started" : "Complete"}
            </Badge>
          </div>
          
          <div className="relative mb-6">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2"></div>
            <div className="relative flex justify-between">
              {['Start', 'Initialize', 'Finding Block', 'Confirmation', 'Complete'].map((stepName, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className={`z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                      step >= index 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-500'
                    }`}
                  >
                    {index < step ? (
                      <Check className="h-4 w-4" />
                    ) : index === step && simulating ? (
                      <Clock className="h-4 w-4 animate-pulse" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className="mt-2 text-[10px] max-w-[60px] text-center">{stepName}</span>
                </div>
              ))}
            </div>
          </div>
          
          {activeConsensus === "pow" && (
            <div className="text-sm mb-4">
              <p>
                <span className="font-medium">Proof of Work:</span> Miners compete to solve a complex mathematical puzzle. 
                The first to solve it gets to add the next block and receive a reward.
              </p>
            </div>
          )}
          
          {activeConsensus === "pos" && (
            <div className="text-sm mb-4">
              <p>
                <span className="font-medium">Proof of Stake:</span> Validators are selected based on how many coins they 
                hold and are willing to "stake" as collateral. More stake means higher chance of selection.
              </p>
            </div>
          )}
          
          {activeConsensus === "pbft" && (
            <div className="text-sm mb-4">
              <p>
                <span className="font-medium">Practical Byzantine Fault Tolerance:</span> A selected set of validator nodes 
                communicate extensively in multiple rounds to agree on a block. Requires 2/3+ agreement.
              </p>
            </div>
          )}
          
          <div className="flex justify-center">
            <Button 
              onClick={simulating ? resetSimulation : startSimulation}
              size="sm"
            >
              {simulating ? "Reset Simulation" : "Start Simulation"}
            </Button>
          </div>
        </div>
        
        {/* Network Visualization */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center mb-4">
            <Network className="h-4 w-4 mr-2" />
            <h4 className="text-sm font-medium">Network Visualization</h4>
          </div>
          
          <div className="relative h-[250px] bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            {/* Node visualization */}
            <div className="flex flex-wrap justify-center items-center gap-4 h-full">
              {nodes.map((node) => (
                <div 
                  key={node.id} 
                  className="relative"
                >
                  <div 
                    className={`
                      w-14 h-14 rounded-full flex items-center justify-center transition-all
                      ${node.status === "idle" ? "bg-gray-200 dark:bg-gray-700" : ""}
                      ${node.status === "active" ? "bg-blue-100 dark:bg-blue-900" : ""}
                      ${node.status === "winner" ? "bg-yellow-100 dark:bg-yellow-900 ring-2 ring-yellow-400" : ""}
                      ${node.status === "validator" ? "bg-purple-100 dark:bg-purple-900" : ""}
                      ${node.confirmed ? "ring-2 ring-green-500" : ""}
                    `}
                  >
                    <div className="text-center">
                      <div className="text-xs font-medium mb-0.5">Node {node.id}</div>
                      {node.stake !== undefined && (
                        <div className="text-[10px] text-muted-foreground">
                          {node.stake} stake
                        </div>
                      )}
                      {(node.status === "validator" || node.status === "winner") && activeConsensus === "pbft" && (
                        <div className="text-[10px] text-muted-foreground">
                          Validator
                        </div>
                      )}
                    </div>
                    
                    {/* Activity indicators */}
                    {node.status === "active" && !node.confirmed && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                    
                    {node.status === "winner" && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    )}
                    
                    {node.voted && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                    
                    {node.confirmed && (
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Block visualization */}
            {blockFound && (
              <div className="absolute top-2 left-2 bg-green-100 dark:bg-green-900/30 p-2 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-xs font-medium text-green-800 dark:text-green-400">New Block</div>
                <div className="text-[10px] text-green-700 dark:text-green-500">
                  Creator: Node {winningNode}
                </div>
                <div className="text-[10px] text-green-700 dark:text-green-500">
                  Confirmations: {confirmation}/{nodes.length}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsensusVisualizer;
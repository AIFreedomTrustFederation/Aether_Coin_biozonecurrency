import React, { useState } from "react";
import { Database, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Smart Contract Visualizer
 * 
 * Interactive visualization of how smart contracts work,
 * including contract deployment, execution, and the deterministic
 * nature of blockchain code execution.
 */
const SmartContractVisualizer: React.FC = () => {
  const [isDeployed, setIsDeployed] = useState(false);
  const [balance, setBalance] = useState(100);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transferAmount, setTransferAmount] = useState(10);
  const [recipient, setRecipient] = useState("0x742...f89b");

  // Example smart contract code
  const contractCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleToken {
    string public name = "AetherToken";
    uint256 public totalSupply = 100;
    address public owner;
    mapping(address => uint256) balances;
    
    constructor() {
        owner = msg.sender;
        balances[owner] = totalSupply;
    }
    
    function transfer(address to, uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
    
    function getBalance(address account) public view returns(uint256) {
        return balances[account];
    }
}`;

  // Deploy the contract
  const deployContract = () => {
    setIsDeployed(true);
    addTransaction("Contract Deployment", "0", "Contract deployed and initialized");
  };

  // Execute a transfer
  const executeTransfer = () => {
    if (!isDeployed || transferAmount > balance) return;
    
    setBalance(prevBalance => prevBalance - transferAmount);
    addTransaction(
      "Transfer", 
      transferAmount.toString(), 
      `Transferred ${transferAmount} tokens to ${recipient}`
    );
  };

  // Reset the contract
  const resetContract = () => {
    setIsDeployed(false);
    setBalance(100);
    setTransactions([]);
  };

  // Add transaction to history
  const addTransaction = (type: string, amount: string, description: string) => {
    const newTx = {
      id: Date.now(),
      type,
      amount,
      description,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setTransactions(prev => [newTx, ...prev]);
  };

  return (
    <div className="w-full flex flex-col items-center p-4">
      <div className="space-y-6 w-full max-w-3xl">
        <h3 className="text-lg font-medium text-center">Smart Contract Interaction</h3>
        <p className="text-sm text-center text-muted-foreground mb-4">
          Deploy and interact with a smart contract to see how it executes on the blockchain
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contract Code */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Database className="h-4 w-4 mr-2" />
              <h4 className="text-sm font-medium">Contract Code</h4>
            </div>
            <pre className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-[200px]">
              {contractCode}
            </pre>
          </div>
          
          {/* Contract State & Interaction */}
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-medium mb-3">Contract State</h4>
            
            {isDeployed ? (
              <>
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center text-green-700 dark:text-green-400 mb-2">
                    <Check className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Contract Deployed</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Token Balance:</span>
                    <span className="font-medium">{balance} AetherTokens</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Owner:</span>
                    <span className="font-mono text-xs">0x3a4...e27f</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h5 className="text-sm font-medium mb-2">Transfer Tokens</h5>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="amount" className="text-xs">Amount</Label>
                      <Input 
                        id="amount"
                        type="number"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(parseInt(e.target.value) || 0)}
                        min={1}
                        max={balance}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="recipient" className="text-xs">Recipient Address</Label>
                      <Input 
                        id="recipient"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="h-8 font-mono text-xs"
                      />
                    </div>
                    <Button 
                      onClick={executeTransfer}
                      disabled={transferAmount > balance}
                      className="w-full"
                      size="sm"
                    >
                      Execute Transfer
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-8">
                <Database className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  Contract not yet deployed to the blockchain
                </p>
                <Button onClick={deployContract}>Deploy Contract</Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Transaction History */}
        <div className="border rounded-lg p-4">
          <h4 className="text-sm font-medium mb-3">Transaction History</h4>
          
          {transactions.length === 0 ? (
            <div className="text-center p-4 text-sm text-muted-foreground">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-2 max-h-[150px] overflow-auto">
              {transactions.map(tx => (
                <div 
                  key={tx.id}
                  className="flex justify-between items-center p-2 border rounded text-xs"
                >
                  <div>
                    <div className="font-medium">{tx.type}</div>
                    <div className="text-muted-foreground">{tx.description}</div>
                  </div>
                  <div className="text-right">
                    {tx.amount !== "0" && <div>{tx.amount} tokens</div>}
                    <div className="text-muted-foreground">{tx.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex justify-center space-x-2">
          <Button variant="outline" size="sm" onClick={resetContract}>
            Reset Contract
          </Button>
          
          {!isDeployed && (
            <Button variant="outline" size="sm" onClick={deployContract}>
              Deploy Contract
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartContractVisualizer;
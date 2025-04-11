import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, ListTree, Code, BookOpen, Settings, Check, X, Cpu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import ChatInterface from '@/components/dapp-builder/ChatInterface';
import ProjectList from '@/components/dapp-builder/ProjectList';
import TemplateSelector from '@/components/dapp-builder/TemplateSelector';
import CodeEditor from '@/components/dapp-builder/CodeEditor';

// Example code for demonstration
const exampleCode = {
  contractCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AetherCoin is ERC20, Ownable {
    bool public paused;
    
    constructor() ERC20("AetherCoin", "AETH") {
        _mint(msg.sender, 10000000 * 10 ** decimals());
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    function pause() external onlyOwner {
        paused = true;
    }
    
    function unpause() external onlyOwner {
        paused = false;
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}`,
  testCode: `const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AetherCoin", function () {
  let token;
  let owner;
  let addr1;
  let addr2;
  
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const Token = await ethers.getContractFactory("AetherCoin");
    token = await Token.deploy();
    await token.deployed();
  });
  
  it("Should assign the total supply of tokens to the owner", async function () {
    const ownerBalance = await token.balanceOf(owner.address);
    expect(await token.totalSupply()).to.equal(ownerBalance);
  });
  
  it("Should allow owner to mint tokens", async function () {
    const initialSupply = await token.totalSupply();
    await token.mint(addr1.address, 1000);
    expect(await token.balanceOf(addr1.address)).to.equal(1000);
    expect(await token.totalSupply()).to.equal(initialSupply.add(1000));
  });
  
  it("Should allow users to burn their tokens", async function () {
    await token.mint(addr1.address, 1000);
    await token.connect(addr1).burn(500);
    expect(await token.balanceOf(addr1.address)).to.equal(500);
  });
  
  it("Should allow owner to pause and unpause transfers", async function () {
    await token.pause();
    expect(await token.paused()).to.equal(true);
    
    await expect(
      token.connect(addr1).transfer(addr2.address, 100)
    ).to.be.revertedWith("Contract is paused");
    
    await token.unpause();
    expect(await token.paused()).to.equal(false);
    
    await token.mint(addr1.address, 100);
    await token.connect(addr1).transfer(addr2.address, 100);
    expect(await token.balanceOf(addr2.address)).to.equal(100);
  });
});`,
  uiCode: `import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import AetherCoin from '../artifacts/contracts/AetherCoin.sol/AetherCoin.json';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function AetherCoinUI({ contractAddress }) {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [balance, setBalance] = useState('0');
  const [paused, setPaused] = useState(false);
  const [totalSupply, setTotalSupply] = useState('0');
  
  // Transfer state
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  
  // Mint state
  const [mintTo, setMintTo] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  
  // Burn state
  const [burnAmount, setBurnAmount] = useState('');
  
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          // Connect to the wallet
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const account = await signer.getAddress();
          
          // Initialize contract
          const contract = new ethers.Contract(contractAddress, AetherCoin.abi, signer);
          
          // Get contract state
          const owner = await contract.owner();
          const paused = await contract.paused();
          const totalSupply = await contract.totalSupply();
          const balance = await contract.balanceOf(account);
          
          setProvider(provider);
          setContract(contract);
          setAccount(account);
          setIsOwner(owner.toLowerCase() === account.toLowerCase());
          setPaused(paused);
          setTotalSupply(ethers.utils.formatEther(totalSupply));
          setBalance(ethers.utils.formatEther(balance));
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            setAccount(accounts[0]);
          });
        } catch (error) {
          console.error('Error initializing the dApp:', error);
        }
      } else {
        console.error('Ethereum provider not found. Install MetaMask or another wallet.');
      }
    };
    
    init();
  }, [contractAddress]);
  
  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!contract) return;
    
    try {
      const amount = ethers.utils.parseEther(transferAmount);
      const tx = await contract.transfer(transferTo, amount);
      await tx.wait();
      
      // Update balance
      const balance = await contract.balanceOf(account);
      setBalance(ethers.utils.formatEther(balance));
      
      // Clear form
      setTransferTo('');
      setTransferAmount('');
    } catch (error) {
      console.error('Error transferring tokens:', error);
    }
  };
  
  const handleMint = async (e) => {
    e.preventDefault();
    if (!contract || !isOwner) return;
    
    try {
      const amount = ethers.utils.parseEther(mintAmount);
      const tx = await contract.mint(mintTo, amount);
      await tx.wait();
      
      // Update total supply
      const totalSupply = await contract.totalSupply();
      setTotalSupply(ethers.utils.formatEther(totalSupply));
      
      // Update balance if we minted to our account
      if (mintTo.toLowerCase() === account.toLowerCase()) {
        const balance = await contract.balanceOf(account);
        setBalance(ethers.utils.formatEther(balance));
      }
      
      // Clear form
      setMintTo('');
      setMintAmount('');
    } catch (error) {
      console.error('Error minting tokens:', error);
    }
  };
  
  const handleBurn = async (e) => {
    e.preventDefault();
    if (!contract) return;
    
    try {
      const amount = ethers.utils.parseEther(burnAmount);
      const tx = await contract.burn(amount);
      await tx.wait();
      
      // Update balance
      const balance = await contract.balanceOf(account);
      setBalance(ethers.utils.formatEther(balance));
      
      // Update total supply
      const totalSupply = await contract.totalSupply();
      setTotalSupply(ethers.utils.formatEther(totalSupply));
      
      // Clear form
      setBurnAmount('');
    } catch (error) {
      console.error('Error burning tokens:', error);
    }
  };
  
  const togglePause = async () => {
    if (!contract || !isOwner) return;
    
    try {
      let tx;
      if (paused) {
        tx = await contract.unpause();
      } else {
        tx = await contract.pause();
      }
      await tx.wait();
      
      // Update paused state
      const newPausedState = await contract.paused();
      setPaused(newPausedState);
    } catch (error) {
      console.error('Error toggling pause state:', error);
    }
  };
  
  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AetherCoin Token</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Connected Account:</span>
              <span className="font-mono">{account}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Your Balance:</span>
              <span>{balance} AETH</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Supply:</span>
              <span>{totalSupply} AETH</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Contract Status:</span>
              <span className={paused ? "text-red-500" : "text-green-500"}>
                {paused ? "Paused" : "Active"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Transfer Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-to">Recipient Address</Label>
                <Input
                  id="transfer-to"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  placeholder="0x..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfer-amount">Amount (AETH)</Label>
                <Input
                  id="transfer-amount"
                  type="number"
                  step="0.000001"
                  min="0"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.0"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={paused}>
                Transfer
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Burn Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBurn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="burn-amount">Amount to Burn (AETH)</Label>
                <Input
                  id="burn-amount"
                  type="number"
                  step="0.000001"
                  min="0"
                  value={burnAmount}
                  onChange={(e) => setBurnAmount(e.target.value)}
                  placeholder="0.0"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={paused}>
                Burn Tokens
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      {isOwner && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mint Tokens (Owner Only)</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMint} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mint-to">Recipient Address</Label>
                  <Input
                    id="mint-to"
                    value={mintTo}
                    onChange={(e) => setMintTo(e.target.value)}
                    placeholder="0x..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mint-amount">Amount (AETH)</Label>
                  <Input
                    id="mint-amount"
                    type="number"
                    step="0.000001"
                    min="0"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    placeholder="0.0"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Mint Tokens
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Contract Controls (Owner Only)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="pause-toggle">Pause Token Transfers</Label>
                <Switch
                  id="pause-toggle"
                  checked={paused}
                  onCheckedChange={togglePause}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}`,
  docs: `# AetherCoin Token

## Overview
AetherCoin (AETH) is an ERC-20 compatible token with enhanced functionality, including minting, burning, and the ability to pause transfers in emergency situations.

## Features

### Basic ERC-20 Functionality
- Transfer tokens between addresses
- Check token balances
- View total supply

### Enhanced Features
- **Minting**: The owner can create new tokens and assign them to any address
- **Burning**: Any token holder can burn (destroy) their own tokens
- **Pausable**: The owner can pause all token transfers in case of emergencies or security issues

## Technical Details

### Contract Architecture
The contract inherits from OpenZeppelin's ERC20 and Ownable contracts to leverage their well-tested implementations of token functionality and access control.

### Security Mechanisms
- **Access Control**: Critical functions like minting and pausing are protected by the onlyOwner modifier
- **Emergency Stop**: The pause mechanism allows for stopping all transfers if an issue is detected
- **Clean Code**: Well-structured and commented code for better auditability

## Deployment Guide

### Prerequisites
- Hardhat or Truffle development environment
- Ethereum wallet with ETH for gas (for mainnet or testnet deployment)
- OpenZeppelin Contracts installed

### Deployment Steps
1. Compile the contract: \`npx hardhat compile\`
2. Deploy to testnet: \`npx hardhat run scripts/deploy.js --network goerli\`
3. Verify the contract on Etherscan: \`npx hardhat verify --network goerli DEPLOYED_CONTRACT_ADDRESS\`

### Sample Deployment Script

\`\`\`javascript
// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const AetherCoin = await ethers.getContractFactory("AetherCoin");
  const token = await AetherCoin.deploy();
  
  await token.deployed();
  
  console.log("AetherCoin deployed to:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
\`\`\`

## Usage Examples

### Token Transfer
\`\`\`javascript
// Transfer 100 tokens to recipient
const amount = ethers.utils.parseEther("100");
await aethercoin.transfer(recipientAddress, amount);
\`\`\`

### Minting (Owner Only)
\`\`\`javascript
// Mint 1000 tokens to an address
const amount = ethers.utils.parseEther("1000");
await aethercoin.mint(recipientAddress, amount);
\`\`\`

### Burning Tokens
\`\`\`javascript
// Burn 50 tokens from your own balance
const amount = ethers.utils.parseEther("50");
await aethercoin.burn(amount);
\`\`\`

### Emergency Controls (Owner Only)
\`\`\`javascript
// Pause all transfers
await aethercoin.pause();

// Resume transfers
await aethercoin.unpause();
\`\`\`

## License
This contract is licensed under the MIT License.`,
  securityReport: {
    issues: [
      {
        severity: 'medium',
        description: 'No cap on token minting',
        location: 'mint() function',
        recommendation: 'Consider adding a maximum cap on total supply to prevent excessive inflation'
      },
      {
        severity: 'low',
        description: 'Missing events for critical state changes',
        location: 'pause() and unpause() functions',
        recommendation: 'Add events to log when the contract is paused or unpaused for better off-chain monitoring'
      }
    ],
    score: 85,
    passedChecks: [
      'No reentrancy vulnerabilities',
      'Proper access control via Ownable',
      'No unsafe math operations (using Solidity 0.8+)',
      'No use of deprecated functions',
      'No hardcoded gas values',
      'No use of tx.origin for authorization'
    ],
    failedChecks: [
      'Missing events for critical operations',
      'Unlimited minting capability'
    ]
  }
};

export default function DappBuilder() {
  const [activeTab, setActiveTab] = useState('chat');
  const [codeVisible, setCodeVisible] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<any>(null); // Code generated from chat or template
  const [projectName, setProjectName] = useState<string>('');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [settings, setSettings] = useState({
    includeTests: true,
    includeDocumentation: true,
    includeFrontend: true,
    optimizationLevel: 'basic',
    securityChecks: true
  });
  const { toast } = useToast();
  
  const handleCodeGenerated = (code: any, name: string) => {
    setGeneratedCode(code);
    setProjectName(name);
    setCodeVisible(true);
  };
  
  const handleTemplateSelected = (templateId: number, name: string) => {
    // In a real implementation, this would fetch the template code from an API
    // For this demo, we're just using the example code
    setGeneratedCode(exampleCode);
    setProjectName(name);
    setCodeVisible(true);
    
    toast({
      title: "Template loaded",
      description: `${name} template has been loaded.`,
    });
  };
  
  const handleProjectSelect = (projectId: number) => {
    // In a real implementation, this would fetch the project from an API
    // For this demo, we're just using the example code
    setGeneratedCode(exampleCode);
    setProjectName('AetherCoin');
    setCodeVisible(true);
    
    toast({
      title: "Project loaded",
      description: "AetherCoin project has been loaded.",
    });
  };
  
  const handleBackToEditor = () => {
    setCodeVisible(false);
  };
  
  const handleSaveProject = () => {
    // In a real implementation, this would save the project to the backend
    toast({
      title: "Project saved",
      description: `${projectName} has been saved to your projects.`,
    });
  };
  
  const handleOptimizationLevelChange = (value: string) => {
    setSettings({
      ...settings,
      optimizationLevel: value as 'none' | 'basic' | 'advanced'
    });
  };
  
  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">DApp Builder Studio</h1>
        
        <div className="flex items-center gap-2">
          {!codeVisible ? (
            <Button variant="outline" onClick={() => setSettingsVisible(!settingsVisible)}>
              <Settings className="h-4 w-4 mr-2" />
              AI Settings
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleBackToEditor}>
                Back to Editor
              </Button>
              <Button variant="default" onClick={handleSaveProject}>
                Save Project
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* AI Settings Panel */}
      {settingsVisible && !codeVisible && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>AI Code Generation Settings</CardTitle>
            <CardDescription>Customize how Mysterion generates code for your DApps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="includeTests">Generate Tests</Label>
                  <Switch 
                    id="includeTests" 
                    checked={settings.includeTests} 
                    onCheckedChange={(checked) => setSettings({...settings, includeTests: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="includeDocumentation">Generate Documentation</Label>
                  <Switch 
                    id="includeDocumentation" 
                    checked={settings.includeDocumentation} 
                    onCheckedChange={(checked) => setSettings({...settings, includeDocumentation: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="includeFrontend">Generate UI Components</Label>
                  <Switch 
                    id="includeFrontend" 
                    checked={settings.includeFrontend} 
                    onCheckedChange={(checked) => setSettings({...settings, includeFrontend: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="securityChecks">Perform Security Analysis</Label>
                  <Switch 
                    id="securityChecks" 
                    checked={settings.securityChecks} 
                    onCheckedChange={(checked) => setSettings({...settings, securityChecks: checked})}
                  />
                </div>
              </div>
              
              <div>
                <Label>Optimization Level</Label>
                <RadioGroup 
                  value={settings.optimizationLevel} 
                  onValueChange={handleOptimizationLevelChange}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none">None - Generate readable code with no optimizations</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="basic" id="basic" />
                    <Label htmlFor="basic">Basic - Apply standard gas optimizations</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="advanced" id="advanced" />
                    <Label htmlFor="advanced">Advanced - Aggressively optimize for gas efficiency</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="secondary" onClick={() => setSettingsVisible(false)}>
              Close
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {!codeVisible ? (
        <div className="flex-1 grid grid-cols-1 gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat" className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat with Mysterion
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center">
                <ListTree className="mr-2 h-4 w-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center">
                <Code className="mr-2 h-4 w-4" />
                My Projects
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="flex-1 mt-0">
              <ChatInterface onCodeGenerated={handleCodeGenerated} />
            </TabsContent>
            
            <TabsContent value="templates" className="flex-1 mt-0">
              <TemplateSelector onTemplateSelect={handleTemplateSelected} />
            </TabsContent>
            
            <TabsContent value="projects" className="flex-1 mt-0">
              <ProjectList onProjectSelect={handleProjectSelect} />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="flex-1">
          <CodeEditor code={generatedCode} projectName={projectName} />
        </div>
      )}
      
      {/* Features Card - Only shown when selecting a mode */}
      {!codeVisible && activeTab === 'chat' && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Mysterion AI Capabilities</CardTitle>
            <CardDescription>
              Mysterion can help you create various types of blockchain applications using natural language
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start">
                <Check className="mt-1 mr-2 h-4 w-4 text-green-500" />
                <div>
                  <h3 className="font-medium">ERC-20 & ERC-721 Tokens</h3>
                  <p className="text-sm text-muted-foreground">Create custom tokens and NFT collections</p>
                </div>
              </div>
              <div className="flex items-start">
                <Check className="mt-1 mr-2 h-4 w-4 text-green-500" />
                <div>
                  <h3 className="font-medium">DeFi Components</h3>
                  <p className="text-sm text-muted-foreground">Staking, yield farming, and liquidity pools</p>
                </div>
              </div>
              <div className="flex items-start">
                <Check className="mt-1 mr-2 h-4 w-4 text-green-500" />
                <div>
                  <h3 className="font-medium">DAO Governance</h3>
                  <p className="text-sm text-muted-foreground">Voting systems and proposal management</p>
                </div>
              </div>
              <div className="flex items-start">
                <Check className="mt-1 mr-2 h-4 w-4 text-green-500" />
                <div>
                  <h3 className="font-medium">Marketplaces</h3>
                  <p className="text-sm text-muted-foreground">NFT and token trading platforms</p>
                </div>
              </div>
              <div className="flex items-start">
                <Check className="mt-1 mr-2 h-4 w-4 text-green-500" />
                <div>
                  <h3 className="font-medium">Multi-Signature Wallets</h3>
                  <p className="text-sm text-muted-foreground">Secure multi-party authentication</p>
                </div>
              </div>
              <div className="flex items-start">
                <Cpu className="mt-1 mr-2 h-4 w-4 text-blue-500" />
                <div>
                  <h3 className="font-medium">Quantum-Resistant Security</h3>
                  <p className="text-sm text-muted-foreground">Advanced cryptographic protections</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
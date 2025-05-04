
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Code, Database, Link as LinkIcon, Server, Settings } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const ApiPage = () => {
  const [apiKey, setApiKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    toast.success("API key request submitted. Check your email soon.");
    setEmail("");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container py-12 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold font-display text-forest-800">
              Aether Coin API Integration
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Connect to our secure FractalCoin node network with LLM training capabilities through our comprehensive API suite.
            </p>
          </div>
          
          <Tabs defaultValue="overview" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="authentication">Authentication</TabsTrigger>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="examples">Code Examples</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-forest-600" />
                    API Overview
                  </CardTitle>
                  <CardDescription>
                    Our API provides secure access to the FractalCoin node network for LLM training and inference.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Base URL</h3>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm">
                      https://api.aifreedomtrust.com/v1
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Core Features</h3>
                    <ul className="space-y-2 list-disc pl-6">
                      <li>Secure access to FractalCoin node network</li>
                      <li>Distributed LLM training across encrypted nodes</li>
                      <li>Real-time transaction processing</li>
                      <li>Wallet management and staking</li>
                      <li>Smart contract integration</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-forest-600" />
                      Node Network
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Our distributed node network provides secure and encrypted processing for LLM training and transactions.
                    </p>
                    <div className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span>Network Uptime</span>
                        <span className="font-medium">99.98%</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Active Nodes</span>
                        <span className="font-medium">1,243</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing Capacity</span>
                        <span className="font-medium">840 TFLOPS</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-forest-600" />
                      Integration Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Multiple integration methods to suit your development needs.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-forest-500"></span>
                        REST API
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-forest-500"></span>
                        GraphQL Endpoint
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-forest-500"></span>
                        WebSocket Streams
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-forest-500"></span>
                        SDK Libraries
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="authentication" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-forest-600" />
                    API Authentication
                  </CardTitle>
                  <CardDescription>
                    Secure your API requests with authentication tokens
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">API Key</h3>
                    <p className="text-muted-foreground mb-4">
                      All requests to the Aether Coin API require an API key that should be included in the request headers.
                    </p>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm">
                      Authorization: Bearer YOUR_API_KEY
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Get Your API Key</h3>
                    <form onSubmit={handleRequestApiKey} className="grid gap-4">
                      <Input 
                        placeholder="Enter your email to receive an API key" 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <Button type="submit" className="bg-forest-600 hover:bg-forest-700">
                        Request API Key
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-forest-600" />
                    Example Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
                    <pre>{`fetch('https://api.aifreedomtrust.com/v1/wallet/balance', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}</pre>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button variant="outline" onClick={() => copyCode(`fetch('https://api.aifreedomtrust.com/v1/wallet/balance', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`)}>
                    {copied ? "Copied!" : "Copy Code"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="endpoints" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-forest-600" />
                    API Endpoints
                  </CardTitle>
                  <CardDescription>
                    Available endpoints for interacting with the FractalCoin network
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Endpoint</th>
                          <th className="text-left py-3 px-4">Method</th>
                          <th className="text-left py-3 px-4">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 px-4 font-mono text-sm">/v1/coin/data</td>
                          <td className="py-3 px-4">GET</td>
                          <td className="py-3 px-4">Get current coin data including price, market cap and volume</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 font-mono text-sm">/v1/wallet/{'{address}'}</td>
                          <td className="py-3 px-4">GET</td>
                          <td className="py-3 px-4">Get wallet information including balance and staking rewards</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 font-mono text-sm">/v1/transactions/{'{address}'}</td>
                          <td className="py-3 px-4">GET</td>
                          <td className="py-3 px-4">Get transaction history for a wallet</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 font-mono text-sm">/v1/transactions</td>
                          <td className="py-3 px-4">POST</td>
                          <td className="py-3 px-4">Send a transaction</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 font-mono text-sm">/v1/staking/{'{address}'}</td>
                          <td className="py-3 px-4">GET</td>
                          <td className="py-3 px-4">Get staking information for a wallet</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 font-mono text-sm">/v1/llm/train</td>
                          <td className="py-3 px-4">POST</td>
                          <td className="py-3 px-4">Submit a training job to the node network</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 font-mono text-sm">/v1/llm/inference</td>
                          <td className="py-3 px-4">POST</td>
                          <td className="py-3 px-4">Run inference on trained models</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-mono text-sm">/v1/llm/models</td>
                          <td className="py-3 px-4">GET</td>
                          <td className="py-3 px-4">List available trained models</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="examples" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-forest-600" />
                    JavaScript/TypeScript Examples
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-base font-medium mb-2">Get Wallet Balance</h3>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
                      <pre>{`const getWalletBalance = async (address) => {
  const response = await fetch(
    \`https://api.aifreedomtrust.com/v1/wallet/\${address}\`, 
    {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    }
  );
  return await response.json();
};

// Example usage
getWalletBalance('0x123abc...')
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`}</pre>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-medium mb-2">Submit LLM Training Job</h3>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
                      <pre>{`const submitTrainingJob = async (trainingData, modelConfig) => {
  const response = await fetch(
    'https://api.aifreedomtrust.com/v1/llm/train', 
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      body: JSON.stringify({
        trainingData,
        modelConfig,
        nodeCount: 5,  // Number of nodes to distribute training
        encryptionLevel: 'high'
      })
    }
  );
  return await response.json();
};`}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-forest-600" />
                    SDK Installation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-base font-medium mb-2">Install the AetherCoin SDK</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm mb-1">npm</p>
                        <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
                          npm install @aethercoin/sdk
                        </div>
                      </div>
                      <div>
                        <p className="text-sm mb-1">yarn</p>
                        <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
                          yarn add @aethercoin/sdk
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-medium mb-2">SDK Example Usage</h3>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
                      <pre>{`import { AetherCoinClient } from '@aethercoin/sdk';

// Initialize client
const client = new AetherCoinClient({
  apiKey: 'YOUR_API_KEY',
  environment: 'production' // or 'testnet'
});

// Get coin data
const getCoinData = async () => {
  const coinData = await client.getCoinData();
  console.log('Current price:', coinData.price);
  console.log('Market cap:', coinData.marketCap);
};

// Initialize LLM training
const trainModel = async () => {
  const jobId = await client.llm.startTraining({
    modelName: 'custom-model-1',
    datasetUrl: 'https://your-dataset-url.com',
    parameters: {
      epochs: 3,
      learningRate: 0.001,
      nodeDistribution: 'auto'
    }
  });
  
  console.log('Training job submitted:', jobId);
};`}</pre>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button 
                    onClick={() => {
                      window.open("https://github.com/aethercoin/sdk-examples", "_blank");
                      toast.success("Opening GitHub repository in new tab");
                    }}
                  >
                    View More Examples on GitHub
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-forest-800">Ready to Get Started?</h2>
            <p className="text-muted-foreground">
              Join our developer community and start building on the FractalCoin node network today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Button 
                size="lg" 
                className="bg-forest-600 hover:bg-forest-700"
                onClick={() => {
                  toast.success("API access request form will be available soon");
                }}
              >
                Request API Access
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => {
                  window.open("https://docs.aethercoin.com", "_blank");
                  toast.success("Opening documentation in new tab");
                }}
              >
                Read the Documentation
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ApiPage;

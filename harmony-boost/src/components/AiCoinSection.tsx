
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Cpu, Database, Brain, CircleDollarSign, Coins, Sparkles, ArrowUpRight, Code, BrainCircuit } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const aiDistribution = [
  { name: 'Training Rewards', value: 45, color: '#6b21a8' },
  { name: 'Developer Fund', value: 20, color: '#9333ea' },
  { name: 'Ecosystem Growth', value: 15, color: '#a855f7' },
  { name: 'Community Rewards', value: 10, color: '#c084fc' },
  { name: 'Reserve Pool', value: 10, color: '#d8b4fe' }
];

const useCases = [
  {
    title: "LLM Training",
    description: "Earn rewards for contributing processing power to train our large language models",
    icon: <Brain className="h-8 w-8 text-purple-600" />
  },
  {
    title: "AI Compute Resources",
    description: "Allocate GPU/CPU resources to the network and receive token rewards",
    icon: <Cpu className="h-8 w-8 text-purple-600" />
  },
  {
    title: "Model Validation",
    description: "Participate in the validation of new model versions and earn tokens",
    icon: <BrainCircuit className="h-8 w-8 text-purple-600" />
  },
  {
    title: "Data Curation",
    description: "Help curate high-quality training data and receive rewards",
    icon: <Database className="h-8 w-8 text-purple-600" />
  }
];

const AiCoinSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            <span className="text-purple-600">AICoin</span> (ICON)
          </h2>
          <p className="text-muted-foreground">
            The utility token powering our decentralized AI training network. Earn ICON by contributing 
            GPU/CPU resources for training our advanced machine learning models.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card className="border-purple-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Token Distribution</CardTitle>
                <CircleDollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <CardDescription>Allocation of the 500M ICON total supply</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={aiDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {aiDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 mt-6 gap-4">
                <div className="flex flex-col items-center bg-purple-50 p-3 rounded-lg">
                  <Coins className="h-5 w-5 text-purple-600 mb-1" />
                  <span className="text-xs text-muted-foreground">Total Supply</span>
                  <span className="font-bold text-purple-700">500M ICON</span>
                </div>
                <div className="flex flex-col items-center bg-purple-50 p-3 rounded-lg">
                  <CircleDollarSign className="h-5 w-5 text-purple-600 mb-1" />
                  <span className="text-xs text-muted-foreground">Initial Price</span>
                  <span className="font-bold text-purple-700">$0.015</span>
                </div>
                <div className="flex flex-col items-center bg-purple-50 p-3 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-600 mb-1" />
                  <span className="text-xs text-muted-foreground">Token Utility</span>
                  <span className="font-bold text-purple-700">AI Training</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-purple-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>AICoin Mining Metrics</CardTitle>
                <Cpu className="h-6 w-6 text-purple-600" />
              </div>
              <CardDescription>Understanding the ICON proof of training model</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Reward Rate</h3>
                    <span className="text-sm bg-purple-50 px-2 py-1 rounded text-purple-700">
                      Dynamic
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Based on your GPU/CPU contribution and network demand</p>
                </div>
                <div className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Minimum Requirements</h3>
                    <span className="text-sm bg-purple-50 px-2 py-1 rounded text-purple-700">
                      8GB VRAM
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Modern GPU with at least 8GB VRAM or equivalent CPU resources</p>
                </div>
                <div className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Verification Method</h3>
                    <span className="text-sm bg-purple-50 px-2 py-1 rounded text-purple-700">
                      Proof of Training
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Verified contributions to model training validated on-chain</p>
                </div>
                <div className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Payment Schedule</h3>
                    <span className="text-sm bg-purple-50 px-2 py-1 rounded text-purple-700">
                      Daily
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Rewards distributed daily based on contribution metrics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="border-purple-100 mb-16">
          <CardHeader>
            <CardTitle>ICON Token Utility</CardTitle>
            <CardDescription>How ICON powers our decentralized AI training network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {useCases.map((useCase, index) => (
                <div key={index} className="flex flex-col p-4 bg-purple-50 rounded-lg">
                  <div className="mb-3">{useCase.icon}</div>
                  <h3 className="font-medium mb-2">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground">{useCase.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-purple-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Start Mining ICON</CardTitle>
                <Code className="h-6 w-6 text-purple-600" />
              </div>
              <CardDescription>Join our decentralized AI training network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Set up your hardware to participate in training our AI models and earn ICON tokens.
                  Follow our simple setup guide to get started.
                </p>
                <div className="grid grid-cols-1 gap-2 mt-4">
                  <Button className="bg-purple-600 hover:bg-purple-700 w-full">
                    Download Mining Software
                  </Button>
                  <Button variant="outline" className="border-purple-200 text-purple-700 w-full">
                    View Setup Guide
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-purple-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Token Ecosystem</CardTitle>
                <ArrowUpRight className="h-6 w-6 text-purple-600" />
              </div>
              <CardDescription>Understanding how FTC and ICON work together</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-purple-700">ICON (AICoin)</span> rewards users for contributing processing power (CPU/GPU) for training our AI models.
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-forest-600">FTC (Aether Coin)</span> rewards users for allocating data storage to our decentralized network infrastructure.
                </p>
                <div className="grid grid-cols-1 gap-2 mt-4">
                  <Button variant="outline" className="border-purple-200 text-purple-700 w-full" asChild>
                    <Link to="/tokenomics">Learn About Aether Coin (FTC)</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AiCoinSection;

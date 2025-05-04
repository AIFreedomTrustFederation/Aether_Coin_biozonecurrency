
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Coins, Percent, Wallet, ChartPie, ChartBar, DollarSign, Leaf, Shield, Recycle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const tokenDistribution = [
  { name: 'Presale', value: 40, color: '#4d994d' },
  { name: 'Ecosystem Development', value: 25, color: '#2c7873' },
  { name: 'Team & Advisors', value: 15, color: '#5c946e' },
  { name: 'Marketing', value: 10, color: '#80c080' },
  { name: 'Liquidity Pool', value: 10, color: '#6aaa96' }
];

const vesting = [
  { role: 'Presale', schedule: 'Partial release at launch, 25% quarterly' },
  { role: 'Ecosystem Development', schedule: 'Locked for 3 months, then 10% released quarterly' },
  { role: 'Team & Advisors', schedule: 'Locked for 12 months, then 25% quarterly' },
  { role: 'Marketing', schedule: '25% released at launch, then 25% quarterly' },
  { role: 'Liquidity Pool', schedule: '50% at launch, 50% locked for 12 months' }
];

const tokenUtility = [
  {
    title: "Biozone Protection",
    description: "Direct funding for conservation of critical ecological zones",
    icon: <Leaf className="h-8 w-8 text-forest-600" />
  },
  {
    title: "Governance",
    description: "Voting rights on project funding and conservation priorities",
    icon: <Shield className="h-8 w-8 text-forest-600" />
  },
  {
    title: "Staking Rewards",
    description: "Earn passive income while supporting ecological conservation",
    icon: <Coins className="h-8 w-8 text-forest-600" />
  },
  {
    title: "Carbon Credits",
    description: "Convert carbon offset actions into token rewards",
    icon: <Recycle className="h-8 w-8 text-forest-600" />
  }
];

const TokenomicsSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            <span className="gradient-text"><Link to="/tokenomics" className="hover:opacity-90">ATC</Link></span> Tokenomics
          </h2>
          <p className="text-muted-foreground">
            Understanding the economics and distribution of <Link to="/tokenomics" className="text-forest-600 hover:underline">Aether Token Coin (ATC)</Link>, 
            the foundation of our biozoecurrency - the inverse of traditional eco-cryptocurrencies.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card className="border-forest-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Token Distribution</CardTitle>
                <ChartPie className="h-6 w-6 text-forest-600" />
              </div>
              <CardDescription>Allocation of the 200M <Link to="/tokenomics" className="text-forest-600 hover:underline">ATC</Link> total supply</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tokenDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {tokenDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 mt-6 gap-4">
                <div className="flex flex-col items-center bg-forest-50 p-3 rounded-lg">
                  <Coins className="h-5 w-5 text-forest-600 mb-1" />
                  <span className="text-xs text-muted-foreground">Total Supply</span>
                  <span className="font-bold text-forest-700">200M <Link to="/tokenomics" className="text-forest-600 hover:underline">ATC</Link></span>
                </div>
                <div className="flex flex-col items-center bg-forest-50 p-3 rounded-lg">
                  <DollarSign className="h-5 w-5 text-forest-600 mb-1" />
                  <span className="text-xs text-muted-foreground">Initial Price</span>
                  <span className="font-bold text-forest-700">$0.0425</span>
                </div>
                <div className="flex flex-col items-center bg-forest-50 p-3 rounded-lg">
                  <Percent className="h-5 w-5 text-forest-600 mb-1" />
                  <span className="text-xs text-muted-foreground">Target Market Cap</span>
                  <span className="font-bold text-forest-700">$15M</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-forest-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vesting Schedule</CardTitle>
                <ChartBar className="h-6 w-6 text-forest-600" />
              </div>
              <CardDescription>Token release timeline by allocation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {vesting.map((item, index) => (
                  <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{item.role}</h3>
                      <span className="text-sm bg-forest-50 px-2 py-1 rounded text-forest-700">
                        {tokenDistribution.find(t => t.name === item.role)?.value}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.schedule}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="border-forest-100 mb-16">
          <CardHeader>
            <CardTitle>Token Utility</CardTitle>
            <CardDescription>How <Link to="/tokenomics" className="text-forest-600 hover:underline">ATC</Link> powers the Aether ecosystem</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tokenUtility.map((utility, index) => (
                <div key={index} className="flex flex-col p-4 bg-forest-50 rounded-lg">
                  <div className="mb-3">{utility.icon}</div>
                  <h3 className="font-medium mb-2">{utility.title}</h3>
                  <p className="text-sm text-muted-foreground">{utility.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center max-w-3xl mx-auto">
          <div className="p-6 bg-forest-50 rounded-lg">
            <Wallet className="h-10 w-10 text-forest-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Join the <Link to="/tokenomics" className="text-forest-600 hover:underline">ATC</Link> Presale</h3>
            <p className="text-muted-foreground mb-4">
              Be among the first to acquire <Link to="/tokenomics" className="text-forest-600 hover:underline">Aether Token Coin (ATC)</Link> and participate in our 
              mission to protect critical ecosystems worldwide.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button className="bg-forest-600 hover:bg-forest-700">
                Register for Presale
              </Button>
              <Button variant="outline" className="border-forest-300 text-forest-700">
                Download Whitepaper
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TokenomicsSection;

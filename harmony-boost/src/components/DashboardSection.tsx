
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, Sprout, Users, Clock } from 'lucide-react';
import { Link } from "react-router-dom";

const presaleData = [
  { name: 'Stage 1', target: 1000000, price: 0.0425 },
  { name: 'Stage 2', target: 2500000, price: 0.0486 },
  { name: 'Stage 3', target: 5000000, price: 0.0512 },
  { name: 'Stage 4', target: 7500000, price: 0.0578 },
  { name: 'Stage 5', target: 10000000, price: 0.0643 },
  { name: 'Final', target: 15000000, price: 0.0728 }
];

const biozoeGoals = [
  { name: 'Amazon Rainforest', allocation: 25, progress: 0 },
  { name: 'Great Barrier Reef', allocation: 18, progress: 0 },
  { name: 'Congo Basin', allocation: 15, progress: 0 },
  { name: 'Sundarbans Mangroves', allocation: 12, progress: 0 }
];

const DashboardSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            <span className="gradient-text">Presale</span> Goals
          </h2>
          <p className="text-muted-foreground">
            Join our mission to protect critical ecological zones through our presale initiative.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-forest-100">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Presale Price Roadmap</CardTitle>
                <CardDescription>Target price progression through presale stages</CardDescription>
              </div>
              <Badge variant="outline" className="bg-forest-50 text-forest-700 border-forest-200">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>Upcoming</span>
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={presaleData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis 
                      domain={[0.04, 0.08]} 
                      tickFormatter={(value) => `$${value.toFixed(4)}`}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Target Price']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#4d994d" 
                      strokeWidth={2}
                      dot={{ fill: '#4d994d', r: 4 }}
                      activeDot={{ r: 6, fill: '#3d7d3d' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 mt-4 gap-4">
                <div className="flex flex-col items-center bg-forest-50 p-3 rounded-lg">
                  <Target className="h-5 w-5 text-forest-600 mb-1" />
                  <span className="text-xs text-muted-foreground">Target Raise</span>
                  <span className="font-bold text-forest-700">$15M</span>
                </div>
                <div className="flex flex-col items-center bg-forest-50 p-3 rounded-lg">
                  <Sprout className="h-5 w-5 text-forest-600 mb-1" />
                  <span className="text-xs text-muted-foreground">Token Supply</span>
                  <span className="font-bold text-forest-700">200M <Link to="/tokenomics" className="text-forest-600 hover:underline">ATC</Link></span>
                </div>
                <div className="flex flex-col items-center bg-forest-50 p-3 rounded-lg">
                  <Users className="h-5 w-5 text-forest-600 mb-1" />
                  <span className="text-xs text-muted-foreground">Minimum Contribution</span>
                  <span className="font-bold text-forest-700">$100</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-forest-100">
            <CardHeader>
              <CardTitle>Biozoe Funding Goals</CardTitle>
              <CardDescription>Planned allocation of presale funds for βίος & ζωή preservation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {biozoeGoals.map((zone, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{zone.name}</span>
                      <span className="text-sm text-muted-foreground">{zone.allocation}%</span>
                    </div>
                    <Progress value={zone.progress} className="h-2 bg-forest-100" />
                    <div className="text-xs text-muted-foreground">
                      Target allocation: {zone.allocation}% of total funds
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-forest-50 rounded-lg">
                <h4 className="text-sm font-semibold text-forest-700 mb-2">Presale Timeline</h4>
                <div className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span>Stage 1 Early Bird</span>
                    <span className="font-medium">May 15, 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Public Presale End</span>
                    <span className="font-medium">Aug 30, 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Token Distribution</span>
                    <span className="font-medium">Sep 15, 2025</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DashboardSection;

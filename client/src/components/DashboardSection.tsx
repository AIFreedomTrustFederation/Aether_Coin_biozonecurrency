
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, Sprout, Users, Clock, Globe, Orbit, Rocket, CloudLightning } from 'lucide-react';
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
  { name: 'Earth Ecosystem Preservation', allocation: 22, progress: 0, icon: <Globe className="h-4 w-4 text-forest-600" /> },
  { name: 'Orbital Development', allocation: 18, progress: 0, icon: <Orbit className="h-4 w-4 text-forest-600" /> },
  { name: 'Mars Habitat Research', allocation: 17, progress: 0, icon: <Rocket className="h-4 w-4 text-forest-600" /> },
  { name: 'Quantum Grid Infrastructure', allocation: 15, progress: 0, icon: <CloudLightning className="h-4 w-4 text-forest-600" /> }
];

const DashboardSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            <span className="gradient-text">Multiplanetary</span> Funding Goals
          </h2>
          <p className="text-muted-foreground">
            Join our mission to create a unified economic system spanning Earth and beyond, supporting humanity's expansion while preserving our universal consciousness foundations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-forest-100">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Cosmic Expansion Roadmap</CardTitle>
                <CardDescription>Building a universal economic ecosystem</CardDescription>
              </div>
              <Badge variant="outline" className="bg-gradient-to-r from-forest-50 to-water-50 text-forest-700 border-forest-200">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>Phase 1</span>
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
              <div className="mt-4 mb-4 px-2">
                <p className="text-sm text-muted-foreground italic">
                  <span className="text-forest-600 font-medium">"πᾶς ἐν πᾶσιν"</span> – 
                  This growth model represents our holistic economic approach where Bitcoin scarcity 
                  enables infinite ATC issuance, funding humanity's multiplanetary expansion.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 mt-4 gap-4">
                <div className="flex flex-col items-center bg-gradient-to-br from-forest-50 to-forest-100 p-3 rounded-lg">
                  <Rocket className="h-5 w-5 text-forest-600 mb-1" />
                  <span className="text-xs text-muted-foreground">Initial Funding</span>
                  <span className="font-bold text-forest-700">$15M</span>
                </div>
                <div className="flex flex-col items-center bg-gradient-to-br from-water-50 to-water-100 p-3 rounded-lg">
                  <Globe className="h-5 w-5 text-water-600 mb-1" />
                  <span className="text-xs text-muted-foreground">Token Supply</span>
                  <span className="font-bold text-water-700">200M <Link to="/tokenomics" className="text-water-600 hover:underline">ATC</Link></span>
                </div>
                <div className="flex flex-col items-center bg-gradient-to-br from-forest-50 to-water-50 p-3 rounded-lg">
                  <Users className="h-5 w-5 text-forest-600 mb-1" />
                  <span className="text-xs text-muted-foreground">Trust Members</span>
                  <span className="font-bold gradient-text">1000-Year Vision</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-forest-100">
            <CardHeader>
              <CardTitle>Multiplanetary Allocation</CardTitle>
              <CardDescription>Funding our unified cosmic ecosystem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {biozoeGoals.map((zone, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {zone.icon}
                        <span className="text-sm font-medium">{zone.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{zone.allocation}%</span>
                    </div>
                    <Progress value={zone.progress} className="h-2 bg-forest-100" />
                    <div className="text-xs text-muted-foreground">
                      <span className="text-forest-600 font-medium">πᾶς ἐν πᾶσιν:</span> {zone.allocation}% allocation supporting holistic development
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-gradient-to-br from-forest-50 to-water-50 rounded-lg">
                <h4 className="text-sm font-semibold gradient-text mb-2">Multiplanetary Timeline</h4>
                <div className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span>Phase 1: Earth Integration</span>
                    <span className="font-medium">May-Sep 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phase 2: Orbital Expansion</span>
                    <span className="font-medium">2026-2027</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phase 3: Mars Settlement</span>
                    <span className="font-medium">2028-2030</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* New Holistic Ecosystem Rewards Section */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-display font-bold mb-4">
              <span className="gradient-text">Universal</span> Economic Principles
            </h3>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Our panentheistic economic framework balances complementary systems, manifesting
              the principles of "πᾶς ἐν πᾶσιν" (all in all) through both practical and transcendent mechanisms
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-forest-50 to-forest-100 border-forest-100">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-forest-100 flex items-center justify-center">
                    <CloudLightning className="h-5 w-5 text-forest-600" />
                  </div>
                  <div>
                    <CardTitle>Death & Resurrection Cycles</CardTitle>
                    <CardDescription>Market Volatility Protection</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Our revolutionary economic design incorporates natural cycles of contraction and expansion,
                  with USDC reserves activated during downturns to provide stability while preserving the system's
                  organic responsiveness to market conditions.
                </p>
                <div className="bg-white/50 p-3 rounded-lg text-sm">
                  <p className="font-medium text-forest-700 mb-1">Key Principles:</p>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>Automatic USDC stabilization reserves</li>
                    <li>Natural economic rhythms preserved</li>
                    <li>Volatility transformed into growth energy</li>
                    <li>Continuous expansion aligned with cosmic principles</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-water-50 to-water-100 border-water-100">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-water-100 flex items-center justify-center">
                    <Orbit className="h-5 w-5 text-water-600" />
                  </div>
                  <div>
                    <CardTitle>Trust-Managed Insurance</CardTitle>
                    <CardDescription>1000-Year Economic Security</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  The Wyoming-based perpetual trust creates an unprecedented economic foundation that
                  spans generations, embodying our panentheistic principles of eternal life through a
                  carefully designed legal and financial framework.
                </p>
                <div className="bg-white/50 p-3 rounded-lg text-sm">
                  <p className="font-medium text-water-700 mb-1">Ecosystem Benefits:</p>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>Millennium-spanning economic protection</li>
                    <li>No-repayment loans for trust members</li>
                    <li>Transcendence of traditional financial timeframes</li>
                    <li>Manifestation of βίος and ζωή balance</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardSection;

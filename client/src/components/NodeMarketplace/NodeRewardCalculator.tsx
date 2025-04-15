import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  HardDrive, 
  Wifi, 
  MemoryStick, 
  Clock,
  BarChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface NodeRewardCalculatorProps {
  initialNodeCount?: number;
  initialUptime?: number;
}

/**
 * NodeRewardCalculator Component
 * 
 * Calculates estimated rewards for contributing computing resources to the
 * FractalCoin network based on various parameters.
 */
const NodeRewardCalculator: React.FC<NodeRewardCalculatorProps> = ({
  initialNodeCount = 1,
  initialUptime = 98
}) => {
  // State for calculator inputs
  const [nodeCount, setNodeCount] = useState(initialNodeCount);
  const [resourceLevel, setResourceLevel] = useState(2);
  const [uptime, setUptime] = useState(initialUptime);
  const [networkShare, setNetworkShare] = useState(0.05); // 0.05% of network
  const [duration, setDuration] = useState(30); // days
  
  // Resource tiers based on node capabilities
  const resourceTiers = [
    { level: 1, cpu: 2, memory: 4, storage: 50, bandwidth: 500, multiplier: 1 },
    { level: 2, cpu: 4, memory: 8, storage: 100, bandwidth: 1000, multiplier: 2.2 },
    { level: 3, cpu: 8, memory: 16, storage: 250, bandwidth: 2000, multiplier: 4.5 },
    { level: 4, cpu: 16, memory: 32, storage: 500, bandwidth: 5000, multiplier: 8 },
    { level: 5, cpu: 32, memory: 64, storage: 1000, bandwidth: 10000, multiplier: 15 }
  ];
  
  // Duration options in days
  const durationOptions = [7, 30, 90, 180, 365];
  
  // Calculate estimated rewards based on inputs
  const calculateRewards = () => {
    const selectedTier = resourceTiers.find(tier => tier.level === resourceLevel) || resourceTiers[0];
    const baseReward = {
      fractalcoin: 25 * selectedTier.multiplier,
      filecoin: 0.25 * selectedTier.multiplier,
      aicoin: 50 * selectedTier.multiplier
    };
    
    // Apply modifiers
    const uptimeModifier = uptime / 100; // 98% uptime = 0.98 modifier
    const durationModifier = duration / 30; // 30 days = 1x modifier
    const networkShareModifier = networkShare * 10; // 0.05% = 0.5 modifier
    const nodeCountModifier = 1 + (Math.log10(nodeCount) * 0.5); // Logarithmic scaling
    
    // Calculate final rewards
    const rewards = {
      fractalcoin: Math.round(baseReward.fractalcoin * uptimeModifier * durationModifier * nodeCountModifier),
      filecoin: parseFloat((baseReward.filecoin * uptimeModifier * durationModifier * networkShareModifier * nodeCountModifier).toFixed(2)),
      aicoin: Math.round(baseReward.aicoin * uptimeModifier * durationModifier * nodeCountModifier)
    };
    
    return rewards;
  };
  
  // Get the current resource tier details
  const currentResourceTier = resourceTiers.find(tier => tier.level === resourceLevel) || resourceTiers[0];
  
  // Calculate rewards
  const rewards = calculateRewards();
  
  // Effective contribution score (0-100)
  const calculateContributionScore = () => {
    const uptimeScore = uptime * 0.4; // 40% of score
    const resourceScore = (resourceLevel / 5) * 30; // 30% of score
    const nodeScore = Math.min(nodeCount, 10) * 3; // 30% of score, max 10 nodes
    return Math.round(uptimeScore + resourceScore + nodeScore);
  };
  
  const contributionScore = calculateContributionScore();
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Node Rewards Calculator</CardTitle>
        <CardDescription>
          Estimate your earnings by contributing resources to the FractalCoin network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resource Contribution Parameters */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Node Count */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="node-count">Number of Nodes</Label>
                <Badge variant="outline">{nodeCount}</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setNodeCount(Math.max(1, nodeCount - 1))}
                  disabled={nodeCount <= 1}
                >
                  -
                </Button>
                <Input
                  id="node-count"
                  type="number"
                  min="1"
                  value={nodeCount}
                  onChange={(e) => setNodeCount(parseInt(e.target.value) || 1)}
                  className="text-center"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setNodeCount(nodeCount + 1)}
                >
                  +
                </Button>
              </div>
            </div>
            
            {/* Uptime */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Uptime</Label>
                <Badge variant="outline">{uptime}%</Badge>
              </div>
              <Slider
                value={[uptime]}
                min={50}
                max={100}
                step={1}
                onValueChange={(values) => setUptime(values[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
          
          {/* Resource Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Resource Level</Label>
              <Badge variant="outline">Tier {resourceLevel}</Badge>
            </div>
            <Slider
              value={[resourceLevel]}
              min={1}
              max={5}
              step={1}
              onValueChange={(values) => setResourceLevel(values[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Basic</span>
              <span>Standard</span>
              <span>Premium</span>
            </div>
          </div>
          
          {/* Resource Specifications */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg flex flex-col items-center text-center">
              <Cpu className="h-4 w-4 mb-1 text-blue-500" />
              <span className="text-xs text-muted-foreground">CPU</span>
              <span className="text-sm font-medium">{currentResourceTier.cpu} vCPUs</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg flex flex-col items-center text-center">
              <MemoryStick className="h-4 w-4 mb-1 text-purple-500" />
              <span className="text-xs text-muted-foreground">Memory</span>
              <span className="text-sm font-medium">{currentResourceTier.memory} GB</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg flex flex-col items-center text-center">
              <HardDrive className="h-4 w-4 mb-1 text-green-500" />
              <span className="text-xs text-muted-foreground">Storage</span>
              <span className="text-sm font-medium">{currentResourceTier.storage} GB</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg flex flex-col items-center text-center">
              <Wifi className="h-4 w-4 mb-1 text-yellow-500" />
              <span className="text-xs text-muted-foreground">Bandwidth</span>
              <span className="text-sm font-medium">{currentResourceTier.bandwidth} GB/mo</span>
            </div>
          </div>
          
          {/* Duration */}
          <div className="space-y-2">
            <Label>Contribution Duration</Label>
            <div className="flex flex-wrap gap-2">
              {durationOptions.map((days) => (
                <Button
                  key={days}
                  variant={duration === days ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDuration(days)}
                >
                  {days === 365 ? '1 Year' : `${days} Days`}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Network Share */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Network Share</Label>
              <Badge variant="outline">{(networkShare * 100).toFixed(2)}%</Badge>
            </div>
            <Slider
              value={[networkShare * 100]}
              min={0.01}
              max={1}
              step={0.01}
              onValueChange={(values) => setNetworkShare(values[0] / 100)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.01%</span>
              <span>0.5%</span>
              <span>1%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your estimated share of the total network based on contributed resources
            </p>
          </div>
        </div>
        
        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Contribution Score</span>
            <div className="flex items-center space-x-2">
              <Progress value={contributionScore} className="w-32" />
              <span className="font-bold">{contributionScore}/100</span>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="text-lg font-medium mb-3">Estimated Rewards</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">FractalCoin</span>
                    <Badge className="bg-forest-500">{rewards.fractalcoin}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Native token of the FractalCoin ecosystem
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Filecoin</span>
                    <Badge className="bg-blue-500">{rewards.filecoin}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    For distributed storage contributions
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">AICoin</span>
                    <Badge className="bg-purple-500">{rewards.aicoin}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    For AI computation resources
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                These reward estimates are based on current network parameters and may vary.
                Higher uptime, resource levels, and duration generally result in better rewards.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NodeRewardCalculator;
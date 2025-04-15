import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Cpu, Memory, HardDrive, Wifi, CreditCard } from "lucide-react";

/**
 * NodeRewardCalculator Component
 * 
 * This component allows users to calculate potential rewards for contributing
 * their computing resources to the FractalCoin node network.
 */
const NodeRewardCalculator: React.FC = () => {
  // Resource contribution values
  const [cpuCores, setCpuCores] = useState(4);
  const [ramGB, setRamGB] = useState(8);
  const [storageGB, setStorageGB] = useState(200);
  const [bandwidthGB, setBandwidthGB] = useState(1000);
  const [uptimePercent, setUptimePercent] = useState(95);
  
  // Network growth rate (0-10 scale)
  const [networkGrowthRate, setNetworkGrowthRate] = useState(5);
  
  // Market prices for the tokens (USD)
  const [fractalcoinPrice, setFractalcoinPrice] = useState(0.10);
  const [filecoinPrice, setFilecoinPrice] = useState(40.00);
  const [aicoinPrice, setAicoinPrice] = useState(0.03);
  
  // Calculated rewards
  const [monthlyRewards, setMonthlyRewards] = useState({
    fractalcoin: 0,
    filecoin: 0,
    aicoin: 0,
    usdValue: 0
  });
  
  // Annual projections (showing compounding growth)
  const [annualProjections, setAnnualProjections] = useState<{
    month: number;
    fractalcoin: number;
    filecoin: number;
    aicoin: number;
    usdValue: number;
  }[]>([]);
  
  // Calculate rewards based on resource contribution and network growth
  useEffect(() => {
    // Base reward calculation (monthly)
    // These are arbitrary formulas for demonstration purposes
    const cpuRewardFactor = 7.5; // FractalCoin per core per month
    const ramRewardFactor = 2.5; // FractalCoin per GB RAM per month
    const storageRewardFactor = 0.15; // FractalCoin per GB storage per month
    const bandwidthRewardFactor = 0.05; // FractalCoin per GB bandwidth per month
    
    // Apply uptime factor (95% uptime = 95% of rewards)
    const uptimeFactor = uptimePercent / 100;
    
    // Calculate base FractalCoin rewards
    const baseFractalcoinReward = (
      (cpuCores * cpuRewardFactor) +
      (ramGB * ramRewardFactor) +
      (storageGB * storageRewardFactor) +
      (bandwidthGB * bandwidthRewardFactor)
    ) * uptimeFactor;
    
    // Apply network growth multiplier (higher growth = higher rewards)
    const networkGrowthMultiplier = 1 + (networkGrowthRate / 10);
    
    // Calculate final monthly rewards
    const fractalcoinReward = baseFractalcoinReward * networkGrowthMultiplier;
    
    // Filecoin rewards (typically less in quantity but higher in value)
    const filecoinReward = fractalcoinReward * 0.01; // 1% of FractalCoin amount
    
    // AICoin rewards (typically more in quantity but lower in value)
    const aicoinReward = fractalcoinReward * 5; // 500% of FractalCoin amount
    
    // Calculate USD value
    const usdValue = (
      (fractalcoinReward * fractalcoinPrice) +
      (filecoinReward * filecoinPrice) +
      (aicoinReward * aicoinPrice)
    );
    
    // Update monthly rewards
    setMonthlyRewards({
      fractalcoin: Math.round(fractalcoinReward),
      filecoin: filecoinReward.toFixed(2),
      aicoin: Math.round(aicoinReward),
      usdValue: Math.round(usdValue)
    });
    
    // Calculate annual projections with compound growth
    const projections = [];
    let cumulativeFractalcoin = 0;
    let cumulativeFilecoin = 0;
    let cumulativeAICoin = 0;
    let monthlyGrowthFactor = 1;
    
    for (let month = 1; month <= 12; month++) {
      // Each month the network grows a bit more (compounding effect)
      monthlyGrowthFactor = 1 + (networkGrowthRate / 10) * (1 + month / 24);
      
      const monthlyFractalcoin = baseFractalcoinReward * monthlyGrowthFactor;
      const monthlyFilecoin = monthlyFractalcoin * 0.01;
      const monthlyAICoin = monthlyFractalcoin * 5;
      
      cumulativeFractalcoin += monthlyFractalcoin;
      cumulativeFilecoin += monthlyFilecoin;
      cumulativeAICoin += monthlyAICoin;
      
      const monthlyUsdValue = (
        (monthlyFractalcoin * fractalcoinPrice) +
        (monthlyFilecoin * filecoinPrice) +
        (monthlyAICoin * aicoinPrice)
      );
      
      projections.push({
        month,
        fractalcoin: Math.round(cumulativeFractalcoin),
        filecoin: parseFloat(cumulativeFilecoin.toFixed(2)),
        aicoin: Math.round(cumulativeAICoin),
        usdValue: Math.round(
          (cumulativeFractalcoin * fractalcoinPrice) +
          (cumulativeFilecoin * filecoinPrice) +
          (cumulativeAICoin * aicoinPrice)
        )
      });
    }
    
    setAnnualProjections(projections);
    
  }, [cpuCores, ramGB, storageGB, bandwidthGB, uptimePercent, networkGrowthRate, fractalcoinPrice, filecoinPrice, aicoinPrice]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-1">Node Reward Calculator</h3>
        <p className="text-sm text-muted-foreground">
          Estimate your potential earnings by contributing resources to the FractalCoin node network.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resource contribution inputs */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Your Resource Contribution</h4>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cpu-cores" className="flex items-center">
                  <Cpu className="h-4 w-4 mr-2 text-blue-500" />
                  CPU Cores
                </Label>
                <span className="text-sm">{cpuCores} vCPUs</span>
              </div>
              <Slider
                id="cpu-cores"
                value={[cpuCores]}
                min={1}
                max={32}
                step={1}
                onValueChange={(values) => setCpuCores(values[0])}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="ram-gb" className="flex items-center">
                  <Memory className="h-4 w-4 mr-2 text-purple-500" />
                  Memory (RAM)
                </Label>
                <span className="text-sm">{ramGB} GB</span>
              </div>
              <Slider
                id="ram-gb"
                value={[ramGB]}
                min={2}
                max={64}
                step={2}
                onValueChange={(values) => setRamGB(values[0])}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="storage-gb" className="flex items-center">
                  <HardDrive className="h-4 w-4 mr-2 text-green-500" />
                  Storage
                </Label>
                <span className="text-sm">{storageGB} GB</span>
              </div>
              <Slider
                id="storage-gb"
                value={[storageGB]}
                min={50}
                max={2000}
                step={50}
                onValueChange={(values) => setStorageGB(values[0])}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bandwidth-gb" className="flex items-center">
                  <Wifi className="h-4 w-4 mr-2 text-yellow-500" />
                  Bandwidth
                </Label>
                <span className="text-sm">{bandwidthGB} GB/month</span>
              </div>
              <Slider
                id="bandwidth-gb"
                value={[bandwidthGB]}
                min={100}
                max={10000}
                step={100}
                onValueChange={(values) => setBandwidthGB(values[0])}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="uptime">Uptime</Label>
                <span className="text-sm">{uptimePercent}%</span>
              </div>
              <Slider
                id="uptime"
                value={[uptimePercent]}
                min={50}
                max={100}
                step={1}
                onValueChange={(values) => setUptimePercent(values[0])}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="network-growth" className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-forest-500" />
              Network Growth Rate
            </Label>
            <div className="space-y-2">
              <Slider
                id="network-growth"
                value={[networkGrowthRate]}
                min={1}
                max={10}
                step={1}
                onValueChange={(values) => setNetworkGrowthRate(values[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Slow</span>
                <span>Moderate</span>
                <span>Fast</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              The network growth rate affects your earnings. Higher growth means more deployments and higher rewards.
            </div>
          </div>
        </div>
        
        {/* Reward projections */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Reward Projections</h4>
          
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Monthly Earnings</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-forest-50 dark:bg-forest-900/20 p-3 rounded-lg text-center">
                  <div className="text-xl font-bold text-forest-600 dark:text-forest-400">
                    {monthlyRewards.fractalcoin}
                  </div>
                  <div className="text-xs text-forest-600 dark:text-forest-400">FractalCoin</div>
                  <div className="text-xs text-muted-foreground">
                    ${(monthlyRewards.fractalcoin * fractalcoinPrice).toFixed(2)}
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {monthlyRewards.filecoin}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">Filecoin</div>
                  <div className="text-xs text-muted-foreground">
                    ${(parseFloat(monthlyRewards.filecoin) * filecoinPrice).toFixed(2)}
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center">
                  <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {monthlyRewards.aicoin}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">AICoin</div>
                  <div className="text-xs text-muted-foreground">
                    ${(monthlyRewards.aicoin * aicoinPrice).toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm font-medium">Total Monthly Value</span>
                <span className="text-2xl font-bold">${monthlyRewards.usdValue}</span>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium">12-Month Projection</h4>
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-5 bg-gray-50 dark:bg-gray-900/50 p-2 border-b text-xs font-medium">
                <div>Month</div>
                <div>FractalCoin</div>
                <div>Filecoin</div>
                <div>AICoin</div>
                <div>USD Value</div>
              </div>
              
              <div className="divide-y max-h-[300px] overflow-y-auto">
                {annualProjections.map((projection) => (
                  <div 
                    key={projection.month}
                    className={`
                      grid grid-cols-5 p-2 text-xs
                      ${projection.month % 3 === 0 ? 'bg-gray-50 dark:bg-gray-900/20' : ''}
                    `}
                  >
                    <div>Month {projection.month}</div>
                    <div>{projection.fractalcoin}</div>
                    <div>{projection.filecoin}</div>
                    <div>{projection.aicoin}</div>
                    <div className="font-medium">${projection.usdValue}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Note: Projections assume the current token prices and network growth rates.
              Actual earnings may vary based on market conditions and network adoption.
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Token Prices (USD)</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="fractalcoin-price" className="text-xs">FractalCoin</Label>
                <Input
                  id="fractalcoin-price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={fractalcoinPrice}
                  onChange={(e) => setFractalcoinPrice(parseFloat(e.target.value) || 0.1)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="filecoin-price" className="text-xs">Filecoin</Label>
                <Input
                  id="filecoin-price"
                  type="number"
                  min="1"
                  step="1"
                  value={filecoinPrice}
                  onChange={(e) => setFilecoinPrice(parseFloat(e.target.value) || 40)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="aicoin-price" className="text-xs">AICoin</Label>
                <Input
                  id="aicoin-price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={aicoinPrice}
                  onChange={(e) => setAicoinPrice(parseFloat(e.target.value) || 0.03)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeRewardCalculator;
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronRight, Calculator, RefreshCw, Download, Sigma, ArrowRight, Pi, Hash, Calculator as CalcIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mathematical constants
const PHI = 1.618033988749895; // Golden ratio
const PI = 3.14159265358979;

const SacredGeometryCalculator = () => {
  const [activeTab, setActiveTab] = useState("growth-projection");
  const [initialAmount, setInitialAmount] = useState(1000);
  const [timeHorizon, setTimeHorizon] = useState(5); // years
  const [growthModel, setGrowthModel] = useState("fibonacci");
  const [tokenType, setTokenType] = useState("ATC");
  const [decayRate, setDecayRate] = useState(0.15); // 15% default
  const [results, setResults] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Calculate projections based on selected model
  const calculateProjections = () => {
    setIsCalculating(true);
    
    // Create results array for table
    const newResults = [];
    
    // Base amount
    let currentAmount = initialAmount;
    
    // Calculate for each time period
    for (let year = 0; year <= timeHorizon; year++) {
      // Different calculation models
      let nextAmount = 0;
      let growthRate = 0;
      let piInfluence = 0;
      let phiInfluence = 0;
      let mandelbrotFactor = 0;
      
      if (growthModel === "fibonacci") {
        // Fibonacci-based growth with golden ratio influence
        const fibGrowth = Math.pow(PHI, year) - Math.pow(1 - PHI, year) / Math.sqrt(5);
        nextAmount = initialAmount * fibGrowth;
        growthRate = year > 0 ? (nextAmount / currentAmount) - 1 : 0;
        phiInfluence = (PHI * year) / 10;
        piInfluence = (PI / 10) * Math.sin(year);
        mandelbrotFactor = year * 0.05;
      } 
      else if (growthModel === "pi-based") {
        // Pi-based growth with cyclical components
        const piGrowth = 1 + (PI / 10) * Math.sin(year) + year * 0.2;
        nextAmount = initialAmount * piGrowth;
        growthRate = year > 0 ? (nextAmount / currentAmount) - 1 : 0;
        phiInfluence = (PHI * 0.1) * year;
        piInfluence = (PI / 5) * Math.sin(year * PI / 4);
        mandelbrotFactor = year * 0.03;
      } 
      else if (growthModel === "mandelbrot") {
        // Mandelbrot-inspired fractal growth
        const fractalGrowth = 1 + Math.log(year + 1) * 0.5 + Math.sin(year * PI / 2) * 0.2;
        nextAmount = initialAmount * Math.pow(fractalGrowth, year);
        growthRate = year > 0 ? (nextAmount / currentAmount) - 1 : 0;
        phiInfluence = PHI * 0.02 * year;
        piInfluence = PI * 0.01 * year;
        mandelbrotFactor = year * 0.1;
      } 
      else if (growthModel === "recursive") {
        // Recursive growth model (combining elements)
        const baseGrowth = 1 + Math.log(year + 1) * 0.3;
        const cycleComponent = 0.1 * Math.sin(year * PI / 4);
        const recursiveFactor = Math.pow(1.1, Math.min(year, 5));
        
        nextAmount = initialAmount * baseGrowth * recursiveFactor * (1 + cycleComponent);
        growthRate = year > 0 ? (nextAmount / currentAmount) - 1 : 0;
        phiInfluence = PHI * 0.03 * year;
        piInfluence = PI * 0.02 * year;
        mandelbrotFactor = 0.07 * year;
      }
      
      // Calculate decay if applicable (for ATC → SING transformation)
      let decayAmount = 0;
      let singularityGain = 0;
      
      if (tokenType === "ATC") {
        decayAmount = currentAmount * decayRate * (year > 0 ? 1 : 0);
        singularityGain = decayAmount * (0.5 + 0.1 * year); // Transformation rate
      }
      
      // Add result to table
      newResults.push({
        year,
        amount: nextAmount,
        growthRate,
        phiInfluence,
        piInfluence,
        mandelbrotFactor,
        decayAmount: year > 0 ? decayAmount : 0,
        singularityGain: year > 0 ? singularityGain : 0
      });
      
      // Update current amount for next iteration
      currentAmount = nextAmount;
    }
    
    // Update state with results
    setResults(newResults);
    setIsCalculating(false);
  };
  
  // Format number for display
  const formatNumber = (num: number, decimals = 2) => {
    if (num === 0) return '0';
    if (num < 0.01) return num.toExponential(2);
    if (num > 1000000) return (num / 1000000).toFixed(decimals) + 'M';
    if (num > 1000) return (num / 1000).toFixed(decimals) + 'K';
    return num.toFixed(decimals);
  };
  
  // Format percentage
  const formatPercent = (num: number) => {
    return (num * 100).toFixed(2) + '%';
  };
  
  // Calculate on parameter change
  useEffect(() => {
    calculateProjections();
  }, [timeHorizon, initialAmount, growthModel, tokenType, decayRate]);
  
  // Export results as CSV
  const exportToCSV = () => {
    // Create CSV header
    let csv = 'Year,Amount,Growth Rate,Phi Influence,Pi Influence,Mandelbrot Factor';
    
    if (tokenType === 'ATC') {
      csv += ',Decay Amount,Singularity Gain';
    }
    
    csv += '\n';
    
    // Add data rows
    results.forEach(row => {
      let line = [
        row.year,
        row.amount.toFixed(4),
        (row.growthRate * 100).toFixed(2) + '%',
        row.phiInfluence.toFixed(4),
        row.piInfluence.toFixed(4),
        row.mandelbrotFactor.toFixed(4)
      ];
      
      if (tokenType === 'ATC') {
        line.push(row.decayAmount.toFixed(4));
        line.push(row.singularityGain.toFixed(4));
      }
      
      csv += line.join(',') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aetherion-${tokenType}-projections.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Sacred Geometry Token Calculator</span>
          <Button variant="outline" size="icon" onClick={exportToCSV}>
            <Download className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Project token growth based on sacred mathematics and biozoecurrency principles
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="growth-projection">Growth Projection</TabsTrigger>
            <TabsTrigger value="token-decay">Recursive Decay Transformation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="growth-projection" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="initial-amount">Initial Amount ({tokenType})</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    id="initial-amount" 
                    type="number" 
                    value={initialAmount} 
                    onChange={(e) => setInitialAmount(parseFloat(e.target.value) || 0)}
                    min={1}
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setInitialAmount(initialAmount * 10)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="token-type">Token Type</Label>
                <Select value={tokenType} onValueChange={setTokenType}>
                  <SelectTrigger id="token-type">
                    <SelectValue placeholder="Select token type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ATC">AetherCoin (ATC)</SelectItem>
                    <SelectItem value="SING">Singularity Coin (SING)</SelectItem>
                    <SelectItem value="FRAC">FractalCoin (FRAC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="growth-model">Growth Model</Label>
                <Select value={growthModel} onValueChange={setGrowthModel}>
                  <SelectTrigger id="growth-model">
                    <SelectValue placeholder="Select growth model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fibonacci">Fibonacci Sequence</SelectItem>
                    <SelectItem value="pi-based">Pi-Based Cyclical</SelectItem>
                    <SelectItem value="mandelbrot">Mandelbrot Fractal</SelectItem>
                    <SelectItem value="recursive">Recursive Growth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="time-horizon">Time Horizon: {timeHorizon} years</Label>
                <Slider
                  id="time-horizon"
                  value={[timeHorizon]}
                  onValueChange={(value) => setTimeHorizon(value[0])}
                  min={1}
                  max={20}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
            
            <div className="bg-card border rounded-md mt-4 p-4">
              <h3 className="text-sm font-medium mb-3 flex items-center">
                <CalcIcon className="h-4 w-4 mr-2" />
                Growth Model Formula:
              </h3>
              
              <div className="bg-secondary/20 p-3 rounded font-mono text-xs overflow-x-auto">
                {growthModel === "fibonacci" && (
                  <div>
                    <p>Growth = (φ<sup>n</sup> - (1-φ)<sup>n</sup>)/√5</p>
                    <p className="text-muted-foreground mt-1">Where φ (phi) = {PHI.toFixed(8)} (Golden Ratio)</p>
                  </div>
                )}
                
                {growthModel === "pi-based" && (
                  <div>
                    <p>Growth = 1 + (π/10)·sin(n) + 0.2n</p>
                    <p className="text-muted-foreground mt-1">Where π (pi) = {PI.toFixed(8)}</p>
                  </div>
                )}
                
                {growthModel === "mandelbrot" && (
                  <div>
                    <p>Growth = (1 + log(n+1)·0.5 + sin(πn/2)·0.2)<sup>n</sup></p>
                    <p className="text-muted-foreground mt-1">Incorporates logarithmic scaling with fractal oscillations</p>
                  </div>
                )}
                
                {growthModel === "recursive" && (
                  <div>
                    <p>Growth = (1 + log(n+1)·0.3) · 1.1<sup>min(n,5)</sup> · (1 + 0.1·sin(πn/4))</p>
                    <p className="text-muted-foreground mt-1">Combined recursive growth with natural limitations</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 overflow-auto max-h-[300px] border rounded-md">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead className="text-right">{tokenType} Amount</TableHead>
                    <TableHead className="text-right">Growth %</TableHead>
                    <TableHead className="text-right">φ Factor</TableHead>
                    <TableHead className="text-right">π Factor</TableHead>
                    <TableHead className="text-right">Fractal Factor</TableHead>
                    {tokenType === "ATC" && (
                      <>
                        <TableHead className="text-right">Decay Amount</TableHead>
                        <TableHead className="text-right">SING Gain</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.year}</TableCell>
                      <TableCell className="text-right font-mono">{formatNumber(row.amount)}</TableCell>
                      <TableCell className="text-right font-mono">{row.year === 0 ? '-' : formatPercent(row.growthRate)}</TableCell>
                      <TableCell className="text-right font-mono">{formatNumber(row.phiInfluence, 4)}</TableCell>
                      <TableCell className="text-right font-mono">{formatNumber(row.piInfluence, 4)}</TableCell>
                      <TableCell className="text-right font-mono">{formatNumber(row.mandelbrotFactor, 4)}</TableCell>
                      {tokenType === "ATC" && (
                        <>
                          <TableCell className="text-right font-mono">{formatNumber(row.decayAmount)}</TableCell>
                          <TableCell className="text-right font-mono">{formatNumber(row.singularityGain)}</TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="token-decay" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="decay-rate">Decay Rate for ATC → SING Transformation</Label>
                <div className="flex flex-col">
                  <Slider
                    id="decay-rate"
                    value={[decayRate]}
                    onValueChange={(value) => setDecayRate(value[0])}
                    min={0.01}
                    max={0.5}
                    step={0.01}
                    className="mt-2"
                  />
                  <span className="mt-1 text-sm text-muted-foreground">{(decayRate * 100).toFixed(1)}% annual rate</span>
                </div>
              </div>
              
              <div className="bg-secondary/20 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Biozoecurrency Transformation</h3>
                <p className="text-sm text-muted-foreground">
                  Unlike traditional cryptocurrencies, Aetherion implements a natural 
                  recursive transformation process where ATC tokens transform into SING through 
                  interaction with the network, similar to biological resource cycles.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center p-6 border rounded-md mt-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-2xl font-bold">ATC</span>
                  </div>
                  <p className="mt-2 text-sm">AetherCoin</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <ArrowRight className="h-8 w-8 text-muted-foreground" />
                  <div className="text-center mt-1">
                    <div className="text-xs flex items-center justify-center text-muted-foreground gap-1">
                      <RefreshCw className="h-3 w-3" />
                      <span>{(decayRate * 100).toFixed(1)}% Annual</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-secondary/20 flex items-center justify-center">
                    <span className="text-2xl font-bold">SING</span>
                  </div>
                  <p className="mt-2 text-sm">Singularity Coin</p>
                </div>
              </div>
              
              <div className="text-center max-w-md">
                <h3 className="font-medium mb-2">Transformation Process</h3>
                <p className="text-sm text-muted-foreground">
                  This creates an inverse model compared to traditional cryptocurrencies:
                  later adopters benefit from accumulated transformations, with lower barriers to entry
                  through airdrops from the death and resurrection process.
                </p>
                
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="p-2 border rounded-md text-center">
                    <Pi className="h-4 w-4 mx-auto mb-1" />
                    <p className="text-xs">Pi Ratios</p>
                  </div>
                  <div className="p-2 border rounded-md text-center">
                    <Sigma className="h-4 w-4 mx-auto mb-1" />
                    <p className="text-xs">Fibonacci</p>
                  </div>
                  <div className="p-2 border rounded-md text-center">
                    <Hash className="h-4 w-4 mx-auto mb-1" />
                    <p className="text-xs">Fractal</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decay Transformation Table */}
            <div className="mt-4 overflow-auto max-h-[300px] border rounded-md">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead className="text-right">ATC Amount</TableHead>
                    <TableHead className="text-right">Annual Decay</TableHead>
                    <TableHead className="text-right">SING Generated</TableHead>
                    <TableHead className="text-right">Cumulative SING</TableHead>
                    <TableHead className="text-right">ATC:SING Ratio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((row, index) => {
                    // Calculate cumulative SING
                    const cumulativeSing = results
                      .slice(0, index + 1)
                      .reduce((sum, r) => sum + r.singularityGain, 0);
                    
                    // Calculate ratio
                    const ratio = row.amount > 0 && cumulativeSing > 0 
                      ? row.amount / cumulativeSing 
                      : 0;
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>{row.year}</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(row.amount)}</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(row.decayAmount)}</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(row.singularityGain)}</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(cumulativeSing)}</TableCell>
                        <TableCell className="text-right font-mono">
                          {ratio > 0 ? `${formatNumber(ratio)}:1` : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t pt-4 text-sm text-muted-foreground flex justify-between">
        <div>
          <span className="font-medium">Model: </span>
          {growthModel === "fibonacci" && "Fibonacci Sequence Growth"}
          {growthModel === "pi-based" && "Pi-Based Cyclical Growth"}
          {growthModel === "mandelbrot" && "Mandelbrot Fractal Growth"}
          {growthModel === "recursive" && "Recursive Combined Growth"}
        </div>
        <div>
          <span className="font-medium">φ:</span> {PHI.toFixed(5)}
          <span className="font-medium ml-4">π:</span> {PI.toFixed(5)}
        </div>
      </CardFooter>
    </Card>
  );
};

export default SacredGeometryCalculator;
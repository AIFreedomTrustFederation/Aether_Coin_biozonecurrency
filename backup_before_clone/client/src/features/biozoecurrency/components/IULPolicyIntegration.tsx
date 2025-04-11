import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Calculator, 
  Wallet, 
  ArrowRight, 
  RefreshCw, 
  DollarSign, 
  BarChart2, 
  Clock, 
  Info, 
  HelpCircle,
  AlertCircle,
  Shield,
  CreditCard
} from 'lucide-react';

const IULPolicyIntegration = () => {
  const [policyValue, setPolicyValue] = useState(100000);
  const [collateralizationRatio, setCollateralizationRatio] = useState(150);
  const [loanTerm, setLoanTerm] = useState(5); // years
  const [tokenType, setTokenType] = useState("ATC");
  const [redemptionRate, setRedemptionRate] = useState(5); // % per year from transaction fees
  const [showCalculation, setShowCalculation] = useState(false);
  
  // Calculate loan amount based on collateralization ratio
  const calculateLoanAmount = () => {
    return policyValue * (100 / collateralizationRatio);
  };
  
  // Calculate token amount based on current "price"
  const calculateTokenAmount = () => {
    const loanAmount = calculateLoanAmount();
    // Simplified token "price" simulation
    const tokenPrice = tokenType === "ATC" ? 2.5 : 
                       tokenType === "SING" ? 8.75 : 4.2;
    
    return loanAmount / tokenPrice;
  };
  
  // Calculate yearly redemption amount from transaction fees
  const calculateYearlyRedemption = () => {
    const loanAmount = calculateLoanAmount();
    return loanAmount * (redemptionRate / 100);
  };
  
  // Generate amortization schedule
  const generateAmortizationSchedule = () => {
    const schedule = [];
    let remainingLoan = calculateLoanAmount();
    const yearlyRedemption = calculateYearlyRedemption();
    
    for (let year = 0; year <= loanTerm; year++) {
      // Calculate token transformation/growth (simplified model)
      const tokenGrowthRate = tokenType === "ATC" ? 0.12 : 
                             tokenType === "SING" ? 0.18 : 0.15;
      
      const tokenAmount = calculateTokenAmount() * Math.pow(1 + tokenGrowthRate, year);
      
      // Calculate remaining loan after redemption
      const yearRedemption = year > 0 ? Math.min(remainingLoan, yearlyRedemption) : 0;
      remainingLoan = Math.max(0, remainingLoan - yearRedemption);
      
      // Calculate current collateralization ratio
      const currentTokenValue = tokenAmount * (tokenType === "ATC" ? 2.5 * Math.pow(1.1, year) : 
                                             tokenType === "SING" ? 8.75 * Math.pow(1.15, year) : 
                                             4.2 * Math.pow(1.12, year));
      
      const currentCollateralRatio = remainingLoan > 0 ? (currentTokenValue / remainingLoan) * 100 : Infinity;
      
      schedule.push({
        year,
        remainingLoan,
        yearRedemption,
        tokenAmount,
        currentTokenValue,
        currentCollateralRatio
      });
      
      // If loan is fully paid off, stop the schedule
      if (remainingLoan === 0) break;
    }
    
    return schedule;
  };
  
  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Format number with commas
  const formatNumber = (num: number, decimals = 2) => {
    return num.toLocaleString('en-US', { 
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals
    });
  };
  
  // Calculate loan details
  const loanAmount = calculateLoanAmount();
  const tokenAmount = calculateTokenAmount();
  const yearlyRedemption = calculateYearlyRedemption();
  const amortizationSchedule = generateAmortizationSchedule();
  const loanFullyPaid = amortizationSchedule[amortizationSchedule.length - 1].remainingLoan === 0;
  const actualLoanTerm = loanFullyPaid ? amortizationSchedule.length - 1 : ">"+ loanTerm;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary" />
          IUL Policy Integration
        </CardTitle>
        <CardDescription>
          Create over-collateralized loans against Indexed Universal Life (IUL) policies
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="calculator">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="calculator">Loan Calculator</TabsTrigger>
            <TabsTrigger value="redemption">Redemption Schedule</TabsTrigger>
            <TabsTrigger value="about">About IUL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calculator" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="policy-value">IUL Policy Value (USDC)</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="policy-value"
                      type="number"
                      className="pl-8"
                      value={policyValue}
                      onChange={(e) => setPolicyValue(Number(e.target.value))}
                      min={10000}
                      step={10000}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="collateralization">Collateralization Ratio: {collateralizationRatio}%</Label>
                  <Slider
                    id="collateralization"
                    value={[collateralizationRatio]}
                    onValueChange={(value) => setCollateralizationRatio(value[0])}
                    min={150}
                    max={200}
                    step={5}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>150% (Minimum)</span>
                    <span>200% (Maximum)</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="loan-term">Loan Term: {loanTerm} years</Label>
                  <Slider
                    id="loan-term"
                    value={[loanTerm]}
                    onValueChange={(value) => setLoanTerm(value[0])}
                    min={1}
                    max={20}
                    step={1}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="redemption-rate">Transaction Fee Redemption Rate: {redemptionRate}%</Label>
                  <Slider
                    id="redemption-rate"
                    value={[redemptionRate]}
                    onValueChange={(value) => setRedemptionRate(value[0])}
                    min={1}
                    max={15}
                    step={0.5}
                    className="mt-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    <span>Percentage of loan repaid yearly through transaction fees</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="token-type">Collateral Token Type</Label>
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
                
                <Button 
                  onClick={() => setShowCalculation(true)}
                  className="w-full"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Loan Details
                </Button>
              </div>
              
              <div className="bg-card border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Loan Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground">IUL Policy Value:</span>
                    <span className="font-medium">{formatCurrency(policyValue)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground">Collateralization Ratio:</span>
                    <span className="font-medium">{collateralizationRatio}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground">Maximum Loan Amount:</span>
                    <span className="font-medium text-primary">{formatCurrency(loanAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground">Token Collateral:</span>
                    <span className="font-medium">{formatNumber(tokenAmount)} {tokenType}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground">Yearly Redemption:</span>
                    <span className="font-medium">{formatCurrency(yearlyRedemption)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground">Projected Full Repayment:</span>
                    <span className="font-medium">{actualLoanTerm} years</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Direct Repayment Required:</span>
                    <span className="font-medium text-green-500">$0.00</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="bg-primary/10 p-3 rounded-md text-sm">
                    <div className="flex items-start">
                      <Info className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                      <p>
                        This loan is self-repaying through transaction fees generated by the 
                        Aetherion ecosystem. No direct repayment is required from the borrower.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Wallet className="h-4 w-4 mr-2" />
                    Apply for Loan
                  </Button>
                  <Button variant="default" size="sm" className="flex-1">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Connect IUL
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="redemption" className="space-y-4">
            <div className="rounded-md border bg-card">
              <div className="p-4 bg-muted/50 border-b">
                <h3 className="font-medium flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2 text-primary" />
                  Auto-Redemption Schedule
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  How your loan will be automatically repaid through transaction fees
                </p>
              </div>
              
              <div className="overflow-auto max-h-[400px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead className="text-right">Remaining Loan</TableHead>
                      <TableHead className="text-right">Yearly Redemption</TableHead>
                      <TableHead className="text-right">{tokenType} Amount</TableHead>
                      <TableHead className="text-right">Token Value</TableHead>
                      <TableHead className="text-right">Collateral Ratio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {amortizationSchedule.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.year}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(row.remainingLoan)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {row.year > 0 ? formatCurrency(row.yearRedemption) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(row.tokenAmount)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(row.currentTokenValue)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {row.currentCollateralRatio === Infinity ? 
                            '∞' : 
                            `${formatNumber(row.currentCollateralRatio, 0)}%`
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/20 rounded-md p-4 border">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <BarChart2 className="h-4 w-4 mr-2 text-primary" />
                  Collateralization Analysis
                </h4>
                <p className="text-sm text-muted-foreground">
                  Even as your loan is being repaid through transaction fees, the value of your token 
                  collateral continues to grow through the biozoecurrency transformation process, 
                  increasing your collateralization ratio over time.
                </p>
              </div>
              
              <div className="bg-muted/20 rounded-md p-4 border">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-primary" />
                  Repayment Timeline
                </h4>
                <p className="text-sm text-muted-foreground">
                  Your loan will be fully repaid in {actualLoanTerm} years through transaction fees 
                  alone. No additional payments are required from you, creating a true self-repaying 
                  loan system based on ecosystem participation.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="about" className="space-y-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <h3>Understanding IUL Policy Integration</h3>
              <p>
                The Aetherion ecosystem introduces a revolutionary approach to financial services by 
                integrating Indexed Universal Life (IUL) insurance policies with biozoecurrency principles 
                to create self-repaying loans.
              </p>
              
              <div className="bg-muted/20 p-4 rounded-md border not-prose mb-4">
                <h4 className="text-base font-medium mb-2">How It Works</h4>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="bg-primary/20 rounded-full p-1 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-medium">1</span>
                    </div>
                    <p>
                      <strong>Connect your IUL policy:</strong> Use your existing Indexed Universal Life 
                      policy as collateral by connecting it to the Aetherion platform.
                    </p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-primary/20 rounded-full p-1 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-medium">2</span>
                    </div>
                    <p>
                      <strong>Receive over-collateralized loan:</strong> Get a USDC loan up to 66% of your 
                      IUL policy value (150% collateralization ratio) or as low as 50% (200% collateralization).
                    </p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-primary/20 rounded-full p-1 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-medium">3</span>
                    </div>
                    <p>
                      <strong>Automatic repayment:</strong> A portion of transaction fees from the Aetherion 
                      ecosystem is automatically allocated to repay your loan over time.
                    </p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-primary/20 rounded-full p-1 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-medium">4</span>
                    </div>
                    <p>
                      <strong>Maintain your policy:</strong> Your IUL policy continues to grow and provide 
                      life insurance coverage during the loan period.
                    </p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-primary/20 rounded-full p-1 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-medium">5</span>
                    </div>
                    <p>
                      <strong>Loan fully repaid:</strong> Once the loan is repaid through transaction fees, 
                      your IUL policy is released from collateral obligations.
                    </p>
                  </li>
                </ol>
              </div>
              
              <h4>Benefits of IUL Integration</h4>
              <ul>
                <li>
                  <strong>No direct repayment required:</strong> Loans are repaid through ecosystem 
                  transaction fees, creating a truly self-repaying financial instrument.
                </li>
                <li>
                  <strong>Maintain life insurance coverage:</strong> Your IUL policy continues to provide 
                  protection for your beneficiaries during the loan period.
                </li>
                <li>
                  <strong>Access liquidity without selling assets:</strong> Unlock the value of your 
                  insurance policy without surrendering it or taking a traditional policy loan.
                </li>
                <li>
                  <strong>Participate in biozoecurrency growth:</strong> Your loan collateral in ATC, SING, 
                  or FRAC tokens grows through the natural transformation cycles.
                </li>
                <li>
                  <strong>Enhanced financial security:</strong> The over-collateralization provides 
                  protection against market volatility and ensures system stability.
                </li>
              </ul>
              
              <div className="bg-yellow-500/10 dark:bg-yellow-900/20 border-yellow-500/30 p-4 rounded-md not-prose mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-base font-medium text-yellow-500 dark:text-yellow-400 mb-1">Important Considerations</h4>
                    <ul className="space-y-1 text-sm">
                      <li>IUL policies must be from approved providers that support the Aetherion integration.</li>
                      <li>Policy loans are subject to regulatory requirements in your jurisdiction.</li>
                      <li>While loans are designed to be self-repaying, extreme market conditions could affect repayment rates.</li>
                      <li>The collateralization ratio determines your loan-to-value ratio and system security.</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <h4>Getting Started</h4>
              <p>
                To begin using your IUL policy with Aetherion's biozoecurrency system, you'll need to:
              </p>
              <ol>
                <li>Verify that your IUL policy is from an approved provider</li>
                <li>Complete the verification process through our secure portal</li>
                <li>Select your preferred collateralization ratio and token type</li>
                <li>Review and accept the terms of the integration</li>
                <li>Receive your USDC loan directly to your wallet</li>
              </ol>
              
              <p>
                For more information about IUL policy integration or to speak with a financial advisor 
                about your specific situation, contact our support team or explore the detailed 
                documentation in the resources section.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between">
        <div className="text-sm text-muted-foreground flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          Secure, over-collateralized, and self-repaying loans
        </div>
        
        <Button variant="outline" size="sm">
          <HelpCircle className="h-4 w-4 mr-2" />
          Learn More
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IULPolicyIntegration;
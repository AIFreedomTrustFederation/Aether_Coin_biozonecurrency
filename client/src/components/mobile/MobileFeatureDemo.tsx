import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Nfc, Zap, QrCode, Fingerprint, Bell, 
  CreditCard, Coins, ArrowUpDown, Terminal, Eye
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useMediaQuery } from '@/hooks/use-media-query';
import { LiveModeIndicator } from "@/components/ui/LiveModeIndicator";
import { useLiveMode } from '../../contexts/LiveModeContext';
import { useToast } from '@/hooks/use-toast';

// Import new feature components
import MobileOneTapPay from './MobileOneTapPay';
import MobileChainActivity from './MobileChainActivity';

export default function MobileFeatureDemo() {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [nfcEnabled, setNfcEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [offlineSigningEnabled, setOfflineSigningEnabled] = useState(true);
  const [arEnabled, setArEnabled] = useState(false);
  const [isMining, setIsMining] = useState(false);
  const [miningStats, setMiningStats] = useState({
    hashRate: 2.4,
    earnings: 0.05,
    hashRatePercent: 45,
    earningsPercent: 15
  });
  const { isLiveMode } = useLiveMode();
  const { toast } = useToast();
  
  // Simulate mining activity when mining is active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isMining) {
      interval = setInterval(() => {
        // Simulate some randomness in hash rate and earnings
        setMiningStats(prevStats => {
          const hashRateChange = Math.random() * 0.2 - 0.1; // -0.1 to +0.1
          const earningsChange = Math.random() * 0.01 - 0.005; // -0.005 to +0.005
          
          const newHashRate = Math.max(0.1, Math.min(5.0, prevStats.hashRate + hashRateChange));
          const newEarnings = Math.max(0.01, Math.min(0.2, prevStats.earnings + earningsChange));
          
          return {
            hashRate: parseFloat(newHashRate.toFixed(2)),
            earnings: parseFloat(newEarnings.toFixed(2)),
            hashRatePercent: Math.min(100, Math.max(5, Math.floor(newHashRate / 5 * 100))),
            earningsPercent: Math.min(100, Math.max(5, Math.floor(newEarnings / 0.2 * 100)))
          };
        });
      }, 2000);
    } else {
      // Reset stats when not mining
      setMiningStats({
        hashRate: 2.4,
        earnings: 0.05,
        hashRatePercent: 45,
        earningsPercent: 15
      });
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isMining]);
  
  const handleStartMining = () => {
    if (isMining) return;
    setIsMining(true);
    toast({
      title: "Mining Started",
      description: "Your device is now mining Aetherion coins.",
      variant: "default"
    });
  };
  
  const handleStopMining = () => {
    if (!isMining) return;
    setIsMining(false);
    toast({
      title: "Mining Stopped",
      description: "Mining operations have been halted.",
      variant: "default"
    });
  };

  return (
    <div className="container max-w-6xl mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mobile Features</h1>
          <p className="text-muted-foreground">
            Experience Aetherion's mobile wallet features and configuration
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <LiveModeIndicator variant="badge" className="ml-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Device Information */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <span>Device Information</span>
            </CardTitle>
            <CardDescription>
              Current device and connection details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Device Type</span>
                <span className="text-sm">{isMobile ? 'Mobile' : 'Desktop'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">NFC Support</span>
                <Badge variant={nfcEnabled ? "default" : "outline"}>
                  {nfcEnabled ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Device ID</span>
                <span className="text-sm text-muted-foreground">AE7290D5F3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Last Synced</span>
                <span className="text-sm text-muted-foreground">Just now</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Operating Mode</span>
                <Badge variant={isLiveMode ? "default" : "outline"}>
                  {isLiveMode ? 'Live' : 'Test'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Controls */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span>Feature Controls</span>
            </CardTitle>
            <CardDescription>
              Configure your mobile wallet experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Nfc className="h-4 w-4 text-primary" />
                  <Label htmlFor="nfc-mode" className="flex flex-col">
                    <span>NFC Payments</span>
                    <span className="text-[0.8rem] font-normal text-muted-foreground">Tap to pay with your phone</span>
                  </Label>
                </div>
                <Switch
                  id="nfc-mode"
                  checked={nfcEnabled}
                  onCheckedChange={setNfcEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Fingerprint className="h-4 w-4 text-primary" />
                  <Label htmlFor="biometric-auth" className="flex flex-col">
                    <span>Biometric Authentication</span>
                    <span className="text-[0.8rem] font-normal text-muted-foreground">Secure access with fingerprint or face ID</span>
                  </Label>
                </div>
                <Switch
                  id="biometric-auth"
                  checked={biometricEnabled}
                  onCheckedChange={setBiometricEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <Label htmlFor="push-notifications" className="flex flex-col">
                    <span>Push Notifications</span>
                    <span className="text-[0.8rem] font-normal text-muted-foreground">Real-time alerts for transactions</span>
                  </Label>
                </div>
                <Switch
                  id="push-notifications"
                  checked={pushEnabled}
                  onCheckedChange={setPushEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Terminal className="h-4 w-4 text-primary" />
                  <Label htmlFor="offline-signing" className="flex flex-col">
                    <span>Offline Transaction Signing</span>
                    <span className="text-[0.8rem] font-normal text-muted-foreground">Sign transactions without internet connection</span>
                  </Label>
                </div>
                <Switch
                  id="offline-signing"
                  checked={offlineSigningEnabled}
                  onCheckedChange={setOfflineSigningEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <Label htmlFor="ar-visualization" className="flex flex-col">
                    <span>AR Transaction Visualization</span>
                    <span className="text-[0.8rem] font-normal text-muted-foreground">Visualize transactions in augmented reality</span>
                  </Label>
                </div>
                <Switch
                  id="ar-visualization"
                  checked={arEnabled}
                  onCheckedChange={setArEnabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Showcase */}
        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
            <CardTitle>Feature Showcase</CardTitle>
            <CardDescription>
              Explore Aetherion's mobile wallet capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="one-tap-pay">
              <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
                <TabsTrigger value="qr-pairing">QR & Pairing</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="one-tap-pay">One-Tap Pay</TabsTrigger>
                <TabsTrigger value="chain-activity">Chain Activity</TabsTrigger>
                <TabsTrigger value="mining">Mobile Mining</TabsTrigger>
                <TabsTrigger value="ar-viz">AR Visualization</TabsTrigger>
              </TabsList>
              
              <TabsContent value="qr-pairing" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-muted/30 rounded-lg p-6 flex flex-col items-center justify-center">
                    <QrCode className="h-16 w-16 text-primary mb-4" />
                    <h3 className="text-lg font-medium mb-2">QR Code Generator</h3>
                    <p className="text-sm text-center text-muted-foreground mb-4">
                      Generate QR codes for wallet addresses, payment requests, and more
                    </p>
                    <Button variant="outline" size="sm">Generate QR Code</Button>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-6 flex flex-col items-center justify-center">
                    <Smartphone className="h-16 w-16 text-primary mb-4" />
                    <h3 className="text-lg font-medium mb-2">Device Pairing</h3>
                    <p className="text-sm text-center text-muted-foreground mb-4">
                      Pair with other devices using secure quantum-resistant encryption
                    </p>
                    <Button variant="outline" size="sm">Pair New Device</Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="payments" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-muted/30 rounded-lg p-6 flex flex-col items-center justify-center">
                    <Nfc className="h-16 w-16 text-primary mb-4" />
                    <h3 className="text-lg font-medium mb-2">NFC Tap-to-Pay</h3>
                    <p className="text-sm text-center text-muted-foreground mb-4">
                      Make contactless payments using your phone's NFC capabilities
                    </p>
                    <Button variant="outline" size="sm" disabled={!nfcEnabled}>
                      {nfcEnabled ? 'Enable NFC Payment' : 'NFC Not Available'}
                    </Button>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-6 flex flex-col items-center justify-center">
                    <CreditCard className="h-16 w-16 text-primary mb-4" />
                    <h3 className="text-lg font-medium mb-2">Mobile Payment Cards</h3>
                    <p className="text-sm text-center text-muted-foreground mb-4">
                      Manage virtual payment cards for different cryptocurrencies
                    </p>
                    <Button variant="outline" size="sm">Manage Cards</Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="mining" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-muted/30 rounded-lg p-6 flex flex-col items-center justify-center">
                    <Zap className="h-16 w-16 text-primary mb-4" />
                    <h3 className="text-lg font-medium mb-2">Mobile Mining Controls</h3>
                    <p className="text-sm text-center text-muted-foreground mb-4">
                      Control your mining operations from your mobile device
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        variant={isMining ? "outline" : "default"} 
                        size="sm"
                        onClick={handleStartMining}
                        disabled={isMining}
                      >
                        Start Mining
                      </Button>
                      <Button 
                        variant={!isMining ? "outline" : "secondary"} 
                        size="sm"
                        onClick={handleStopMining}
                        disabled={!isMining}
                      >
                        Stop Mining
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-6 flex flex-col items-center justify-center">
                    <Coins className="h-16 w-16 text-primary mb-4" />
                    <h3 className="text-lg font-medium mb-2">Mining Statistics</h3>
                    <p className="text-sm text-center text-muted-foreground mb-4">
                      View your mining performance and earnings
                    </p>
                    <div className="w-full max-w-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Mining Status:</span>
                        <Badge variant={isMining ? "default" : "outline"} className="capitalize">
                          {isMining ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="mb-3"></div>
                      
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Hashrate:</span>
                        <span className="text-sm font-medium">{miningStats.hashRate} MH/s</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mb-3">
                        <div 
                          className="bg-primary h-2 rounded-full progress-bar" 
                          style={{ '--progress-width': `${miningStats.hashRatePercent}%` } as React.CSSProperties}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Earnings (24h):</span>
                        <span className="text-sm font-medium">{miningStats.earnings} SING</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full progress-bar" 
                          style={{ '--progress-width': `${miningStats.earningsPercent}%` } as React.CSSProperties}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="one-tap-pay" className="space-y-4">
                <MobileOneTapPay />
              </TabsContent>
              
              <TabsContent value="chain-activity" className="space-y-4">
                <MobileChainActivity />
              </TabsContent>
              
              <TabsContent value="ar-viz" className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-6 flex flex-col items-center justify-center">
                  <Eye className="h-16 w-16 text-primary mb-4" />
                  <h3 className="text-lg font-medium mb-2">AR Transaction Visualization</h3>
                  <p className="text-sm text-center text-muted-foreground mb-4 max-w-lg mx-auto">
                    Experience your blockchain transactions in augmented reality. See the flow of assets through the quantum-resistant network.
                  </p>
                  <div className="bg-black/10 dark:bg-white/5 rounded-lg h-48 w-full max-w-xl flex items-center justify-center mb-4">
                    <p className="text-muted-foreground">AR visualization preview will appear here</p>
                  </div>
                  <Button variant="outline" size="sm" disabled={!arEnabled}>
                    {arEnabled ? 'Launch AR View' : 'Enable AR in Settings'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              {isLiveMode 
                ? "You are in Live Mode. All transactions will use real coins."
                : "You are in Test Mode. All transactions use simulated coins."}
            </p>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <span>Sync with Mobile App</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
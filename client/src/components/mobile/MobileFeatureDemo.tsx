import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useMediaQuery } from "@/hooks/use-media-query";

// Import mobile feature modules
import mobileFeatures from '@/core/mobile/MobileFeatures';
import nfcPayment from '@/core/mobile/NfcPayment';
import arTransactionViz from '@/core/mobile/ArTransactionViz';
import mobileMining from '@/core/mobile/MobileMining';
import qrCodeGenerator from '@/core/mobile/QrCodeGenerator';
import devicePairing from '@/core/mobile/DevicePairing';

import { Smartphone, Cpu, Nfc, QrCode, ArrowUpDown, Activity, 
         Fingerprint, ZapOff, Battery, Wifi, Share2, Eye, Box } from "lucide-react";

const MobileFeatureDemo: React.FC = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [capabilities, setCapabilities] = useState(mobileFeatures.getAllCapabilities());
  const [activeTab, setActiveTab] = useState('overview');
  
  // NFC state
  const [nfcStatus, setNfcStatus] = useState(nfcPayment.getNfcStatus());
  const [nfcAmount, setNfcAmount] = useState(10);
  const [isNfcScanning, setIsNfcScanning] = useState(false);
  
  // AR state
  const [arStatus, setArStatus] = useState(arTransactionViz.getArStatus());
  const [arMode, setArMode] = useState<'fractal' | 'network' | 'flow' | 'quantum'>('fractal');
  const [arComplexity, setArComplexity] = useState(5);
  const [isArActive, setIsArActive] = useState(false);
  
  // Mining state
  const [miningStats, setMiningStats] = useState(mobileMining.getStats());
  const [miningOptions, setMiningOptions] = useState(mobileMining.getOptions());
  
  // QR code state
  const [walletAddress, setWalletAddress] = useState('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
  const [qrCodeData, setQrCodeData] = useState('');
  
  // Device pairing state
  const [pairingStatus, setPairingStatus] = useState(devicePairing.getPairingStatus());
  const [pairedDevices, setPairedDevices] = useState(devicePairing.getPairedDevices());
  
  // Effects for real-time updates
  useEffect(() => {
    // Update mining stats every second if mining is active
    const miningInterval = setInterval(() => {
      if (miningStats.status !== 'idle') {
        setMiningStats(mobileMining.getStats());
      }
    }, 1000);
    
    // Update capabilities when they change
    const unsubscribeCapabilities = mobileFeatures.onCapabilitiesChanged(() => {
      setCapabilities(mobileFeatures.getAllCapabilities());
    });
    
    // Generate initial QR code
    generateQrCode();
    
    return () => {
      clearInterval(miningInterval);
      unsubscribeCapabilities();
    };
  }, []);
  
  // Generate QR code for wallet address
  const generateQrCode = async () => {
    try {
      const qrData = await qrCodeGenerator.generateAddressQr(walletAddress, {
        size: 200,
        format: 'url'
      });
      setQrCodeData(qrData as string);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast({
        title: "QR Code Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };
  
  // Initiate NFC payment
  const handleNfcPayment = async () => {
    if (nfcStatus !== 'available') {
      toast({
        title: "NFC Unavailable",
        description: "NFC functionality is not available on this device.",
        variant: "destructive"
      });
      return;
    }
    
    setIsNfcScanning(true);
    
    try {
      const result = await nfcPayment.initiatePayment({
        amount: nfcAmount,
        currency: 'FRC',
        memo: 'Mobile Feature Demo Payment'
      });
      
      if (result.success) {
        toast({
          title: "Payment Successful",
          description: `Transaction ID: ${result.transactionId?.substring(0, 8)}...`,
          variant: "default"
        });
      } else {
        toast({
          title: "Payment Failed",
          description: result.error || "Unknown error",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('NFC payment error:', error);
      toast({
        title: "NFC Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsNfcScanning(false);
      setNfcStatus(nfcPayment.getNfcStatus());
    }
  };
  
  // Toggle AR visualization
  const toggleArVisualization = async () => {
    if (isArActive) {
      // Stop AR visualization
      arTransactionViz.stopVisualization();
      setIsArActive(false);
    } else {
      // Start AR visualization
      try {
        const result = await arTransactionViz.startVisualization({
          mode: arMode,
          complexity: arComplexity,
          showLabels: true,
          dataSource: 'live'
        });
        
        if (result.success) {
          setIsArActive(true);
          toast({
            title: "AR Visualization Started",
            description: `Mode: ${arMode}, FPS: ${result.stats?.fps}`,
            variant: "default"
          });
        } else {
          toast({
            title: "AR Visualization Failed",
            description: result.error || "Unknown error",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('AR visualization error:', error);
        toast({
          title: "AR Error",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive"
        });
      }
    }
    
    setArStatus(arTransactionViz.getArStatus());
  };
  
  // Toggle mining
  const toggleMining = async () => {
    if (miningStats.status === 'mining' || miningStats.status === 'starting') {
      // Stop mining
      await mobileMining.stopMining();
    } else {
      // Start mining
      await mobileMining.startMining();
    }
    
    setMiningStats(mobileMining.getStats());
  };
  
  // Update mining options
  const updateMiningOptions = (options: Partial<typeof miningOptions>) => {
    const updatedOptions = { ...miningOptions, ...options };
    mobileMining.updateOptions(updatedOptions);
    setMiningOptions(updatedOptions);
  };
  
  // Initiate device pairing
  const initiatePairing = async () => {
    try {
      const pairingCode = await devicePairing.initiatePairing({
        deviceName: `${mobileFeatures.isMobile ? 'Mobile' : 'Desktop'} (${Math.floor(Math.random() * 1000)})`,
        allowDataSync: true,
        trustDuration: 30 * 24 * 60 * 60 // 30 days
      });
      
      setPairingStatus(devicePairing.getPairingStatus());
      
      toast({
        title: "Pairing Initiated",
        description: "Scan the QR code with another device to complete pairing.",
        variant: "default"
      });
      
      // For demo purposes only - in a real app, you would display the QR code
      console.log('Pairing code generated:', pairingCode);
    } catch (error) {
      console.error('Pairing error:', error);
      toast({
        title: "Pairing Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };
  
  // Render helper functions
  const renderFeatureStatus = (isAvailable: boolean, label: string) => (
    <div className="flex items-center gap-2">
      <Badge variant={isAvailable ? "default" : "outline"}>
        {isAvailable ? "Available" : "Unavailable"}
      </Badge>
      <span className="text-sm">{label}</span>
    </div>
  );
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mobile Features Demonstration</h1>
      
      {!capabilities.isAvailable && !isMobile && (
        <Card className="mb-4 border-yellow-500">
          <CardHeader>
            <CardTitle className="text-yellow-500">Desktop Mode Detected</CardTitle>
            <CardDescription>
              You are viewing this page on a desktop device. Some mobile features will be simulated.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="nfc">NFC Payment</TabsTrigger>
          <TabsTrigger value="ar">AR Visualization</TabsTrigger>
          <TabsTrigger value="mining">Mobile Mining</TabsTrigger>
          <TabsTrigger value="pairing">Device Pairing</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" /> Device Capabilities
              </CardTitle>
              <CardDescription>
                Detected features on your device
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFeatureStatus(capabilities.isAvailable, "Mobile Features")}
                {renderFeatureStatus(capabilities.hasTouchscreen, "Touchscreen")}
                {renderFeatureStatus(capabilities.hasCamera, "Camera")}
                {renderFeatureStatus(capabilities.hasNfc, "NFC")}
                {renderFeatureStatus(capabilities.hasBiometrics, "Biometrics")}
                {renderFeatureStatus(capabilities.hasArSupport, "AR Support")}
                {renderFeatureStatus(capabilities.hasNotifications, "Notifications")}
                {renderFeatureStatus(capabilities.hasBatteryApi, "Battery API")}
                {renderFeatureStatus(capabilities.hasOfflineSupport, "Offline Support")}
                {renderFeatureStatus(capabilities.hasShareApi, "Share API")}
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between mb-1">
                  <Label>CPU Performance Estimate</Label>
                  <span>{capabilities.hasCPUnits}/10</span>
                </div>
                <Progress value={capabilities.hasCPUnits * 10} />
              </div>
              
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Device Type:</span>
                  <Badge variant="outline">
                    {capabilities.isMobile ? "Mobile" : capabilities.isTablet ? "Tablet" : "Desktop"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Screen Resolution:</span>
                  <span className="text-sm">{capabilities.screenSize.width} x {capabilities.screenSize.height}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Orientation:</span>
                  <span className="text-sm">{capabilities.deviceOrientation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Connection Type:</span>
                  <Badge variant="outline">{capabilities.connection.type}</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setCapabilities(mobileFeatures.refreshCapabilities())}>
                Refresh Capabilities
              </Button>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" /> Wallet QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                {qrCodeData ? (
                  <div className="mb-4">
                    <img src={qrCodeData} alt="Wallet QR Code" className="w-48 h-48" />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-gray-100 animate-pulse flex items-center justify-center">
                    QR Code loading...
                  </div>
                )}
                <Input
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Wallet Address"
                  className="mt-2"
                />
              </CardContent>
              <CardFooter>
                <Button onClick={generateQrCode}>Regenerate QR Code</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" /> Device Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => mobileFeatures.vibrate(200)}
                    disabled={!capabilities.hasVibration}
                  >
                    Vibrate Device
                  </Button>
                  
                  <Button 
                    onClick={() => mobileFeatures.share({
                      title: 'Aetherion Wallet',
                      text: 'Check out my quantum-resistant blockchain wallet!',
                      url: 'https://aetherion.com'
                    })}
                    disabled={!capabilities.hasShareApi}
                  >
                    <Share2 className="h-4 w-4 mr-2" /> Share
                  </Button>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Label className="mt-2">Connection Status</Label>
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    <span>
                      {capabilities.connection.type} 
                      {capabilities.connection.downlinkSpeed > 0 && 
                        ` (${capabilities.connection.downlinkSpeed.toFixed(1)} Mbps)`}
                    </span>
                  </div>
                  
                  {capabilities.hasBatteryApi && (
                    <div className="flex items-center gap-2 mt-2">
                      <Battery className="h-4 w-4" />
                      <span>Battery: {miningStats.batteryLevel}%</span>
                      {miningStats.batteryStatus === 'charging' && <span>(Charging)</span>}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* NFC Payment Tab */}
        <TabsContent value="nfc">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Nfc className="h-5 w-5" /> NFC Tap-to-Pay
              </CardTitle>
              <CardDescription>
                Send or receive payments using NFC technology
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <span>NFC Status:</span>
                  <Badge variant={nfcStatus === 'available' ? 'default' : 'outline'}>
                    {nfcStatus.charAt(0).toUpperCase() + nfcStatus.slice(1)}
                  </Badge>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="amount">Payment Amount (FRC)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="amount"
                      type="number"
                      value={nfcAmount}
                      onChange={(e) => setNfcAmount(parseFloat(e.target.value))}
                      min={0.01}
                      step={0.01}
                    />
                    <Button variant="outline" onClick={() => setNfcAmount(10)}>Reset</Button>
                  </div>
                </div>
                
                {isNfcScanning ? (
                  <div className="flex flex-col items-center gap-4 p-6">
                    <div className="w-24 h-24 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    <p>Scanning for NFC payment...</p>
                    <Button variant="outline" onClick={() => {
                      nfcPayment.cancelNfcOperation();
                      setIsNfcScanning(false);
                      setNfcStatus(nfcPayment.getNfcStatus());
                    }}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      className="w-full" 
                      onClick={handleNfcPayment}
                      disabled={nfcStatus !== 'available'}
                    >
                      <ArrowUpDown className="mr-2 h-4 w-4" /> Send Payment
                    </Button>
                    
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={async () => {
                        setIsNfcScanning(true);
                        try {
                          const result = await nfcPayment.scanForPayment(30);
                          if (result.success) {
                            toast({
                              title: "Payment Received",
                              description: `Received ${nfcAmount} FRC from ${result.recipientAddress?.substring(0, 8)}...`,
                              variant: "default"
                            });
                          } else {
                            toast({
                              title: "Scan Failed",
                              description: result.error || "Scan timed out",
                              variant: "destructive"
                            });
                          }
                        } catch (error) {
                          console.error('NFC scan error:', error);
                          toast({
                            title: "NFC Error",
                            description: error instanceof Error ? error.message : "Unknown error",
                            variant: "destructive"
                          });
                        } finally {
                          setIsNfcScanning(false);
                          setNfcStatus(nfcPayment.getNfcStatus());
                        }
                      }}
                      disabled={nfcStatus !== 'available'}
                    >
                      <QrCode className="mr-2 h-4 w-4" /> Receive Payment
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 items-start">
              <p className="text-sm text-muted-foreground">
                NFC payments allow for contactless transactions between devices. Hold your device near another NFC-enabled device to complete a transfer.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> This is a demonstration. NFC functionality requires physical hardware support.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* AR Visualization Tab */}
        <TabsContent value="ar">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="h-5 w-5" /> AR Transaction Visualization
              </CardTitle>
              <CardDescription>
                Visualize blockchain transactions in augmented reality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <span>AR Status:</span>
                  <Badge variant={arStatus === 'available' || arStatus === 'running' ? 'default' : 'outline'}>
                    {arStatus.charAt(0).toUpperCase() + arStatus.slice(1)}
                  </Badge>
                </div>
                
                <div className="grid gap-2">
                  <Label>Visualization Mode</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['fractal', 'network', 'flow', 'quantum'].map((mode) => (
                      <Button
                        key={mode}
                        variant={arMode === mode ? "default" : "outline"}
                        onClick={() => setArMode(mode as any)}
                        disabled={isArActive}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <Label>Complexity: {arComplexity}</Label>
                  </div>
                  <Slider
                    value={[arComplexity]}
                    onValueChange={(value) => setArComplexity(value[0])}
                    min={1}
                    max={10}
                    step={1}
                    disabled={isArActive}
                  />
                </div>
                
                {isArActive ? (
                  <div className="p-6 border rounded-md bg-muted/20">
                    <div className="mb-4 text-center">
                      <Badge>AR Visualization Active</Badge>
                    </div>
                    
                    <div className="flex justify-center mb-4">
                      <div className="w-48 h-48 border flex items-center justify-center">
                        <p className="text-center text-sm">
                          [AR Visualization Preview]<br/>
                          Mode: {arMode}<br/>
                          Complexity: {arComplexity}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" onClick={() => {
                        arTransactionViz.updateVisualization({
                          showLabels: Math.random() > 0.5,
                          showTransactions: Math.random() > 0.3,
                        });
                        
                        toast({
                          title: "Visualization Updated",
                          description: "AR visualization settings have been adjusted",
                          variant: "default"
                        });
                      }}>
                        <Eye className="mr-2 h-4 w-4" /> Toggle Labels
                      </Button>
                      
                      <Button variant="outline" onClick={async () => {
                        const screenshot = await arTransactionViz.captureScreenshot();
                        if (screenshot) {
                          toast({
                            title: "Screenshot Captured",
                            description: "AR visualization screenshot saved",
                            variant: "default"
                          });
                        } else {
                          toast({
                            title: "Screenshot Failed",
                            description: "Unable to capture AR visualization",
                            variant: "destructive"
                          });
                        }
                      }}>
                        Capture Screenshot
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {capabilities.hasArSupport ? (
                      <Button 
                        className="w-full" 
                        onClick={toggleArVisualization}
                        disabled={arStatus !== 'available'}
                      >
                        Start AR Visualization
                      </Button>
                    ) : (
                      <div className="p-4 border rounded-md">
                        <p className="text-center text-muted-foreground">
                          AR visualization requires device support for augmented reality features.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              {isArActive && (
                <Button 
                  className="w-full" 
                  variant="destructive"
                  onClick={toggleArVisualization}
                >
                  <ZapOff className="mr-2 h-4 w-4" /> Stop AR Visualization
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Mobile Mining Tab */}
        <TabsContent value="mining">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" /> Mobile Mining Controls
              </CardTitle>
              <CardDescription>
                Mine FractalCoin using your mobile device's processing power
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>Mining Status:</span>
                    <Badge variant={miningStats.status === 'mining' ? 'default' : 'outline'}>
                      {miningStats.status.charAt(0).toUpperCase() + miningStats.status.slice(1)}
                    </Badge>
                  </div>
                  
                  {miningStats.status === 'mining' && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Hash Rate:</span>
                      <Badge variant="outline">
                        {miningStats.hashRate.toLocaleString()} H/s
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Mining Algorithm</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['eco', 'standard', 'quantum-resistant'].map((algo) => (
                        <Button
                          key={algo}
                          variant={miningOptions.algorithm === algo ? "default" : "outline"}
                          onClick={() => updateMiningOptions({ algorithm: algo as any })}
                          disabled={miningStats.status === 'mining' || miningStats.status === 'starting'}
                          className="text-xs"
                        >
                          {algo === 'quantum-resistant' ? 'Quantum' : 
                            algo.charAt(0).toUpperCase() + algo.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <Label>CPU Threads: {miningOptions.threads}</Label>
                    </div>
                    <Slider
                      value={[miningOptions.threads]}
                      onValueChange={(value) => updateMiningOptions({ threads: value[0] })}
                      min={1}
                      max={Math.max(2, navigator.hardwareConcurrency || 4)}
                      step={1}
                      disabled={miningStats.status === 'mining' || miningStats.status === 'starting'}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <Label>CPU Throttle: {miningOptions.throttle}%</Label>
                    </div>
                    <Slider
                      value={[miningOptions.throttle]}
                      onValueChange={(value) => updateMiningOptions({ throttle: value[0] })}
                      min={10}
                      max={100}
                      step={5}
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Switch
                      id="battery-switch"
                      checked={miningOptions.pauseOnBatteryLow}
                      onCheckedChange={(checked) => 
                        updateMiningOptions({ pauseOnBatteryLow: checked })}
                    />
                    <Label htmlFor="battery-switch">Pause on Low Battery</Label>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Switch
                      id="charging-switch"
                      checked={miningOptions.mineOnlyWhenCharging}
                      onCheckedChange={(checked) => 
                        updateMiningOptions({ mineOnlyWhenCharging: checked })}
                    />
                    <Label htmlFor="charging-switch">Mine Only When Charging</Label>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Switch
                      id="temp-switch"
                      checked={miningOptions.pauseOnOverheat}
                      onCheckedChange={(checked) => 
                        updateMiningOptions({ pauseOnOverheat: checked })}
                    />
                    <Label htmlFor="temp-switch">Pause on Overheating</Label>
                  </div>
                </div>
                
                {miningStats.status === 'mining' && (
                  <div className="space-y-4 border rounded-md p-4 bg-muted/20">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Active Threads:</div>
                      <div className="text-right">{miningStats.activeThreads}</div>
                      
                      <div>Total Hashes:</div>
                      <div className="text-right">{miningStats.totalHashes.toLocaleString()}</div>
                      
                      <div>Shares Found:</div>
                      <div className="text-right">{miningStats.validShares}</div>
                      
                      <div>Blocks Found:</div>
                      <div className="text-right">{miningStats.blocksFound}</div>
                      
                      <div>Earnings:</div>
                      <div className="text-right">{miningStats.earnings.toFixed(2)} FRC</div>
                      
                      <div>Mining Time:</div>
                      <div className="text-right">{Math.floor(miningStats.duration / 60)}m {miningStats.duration % 60}s</div>
                      
                      <div>Device Temp:</div>
                      <div className="text-right">{miningStats.temperature.toFixed(1)}°C</div>
                    </div>
                    
                    {miningStats.lastError && (
                      <div className="text-yellow-500 text-sm">
                        Warning: {miningStats.lastError}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={miningStats.status === 'mining' ? "destructive" : "default"}
                onClick={toggleMining}
              >
                {miningStats.status === 'mining' ? (
                  <>
                    <ZapOff className="mr-2 h-4 w-4" /> Stop Mining
                  </>
                ) : (
                  <>
                    <Cpu className="mr-2 h-4 w-4" /> Start Mining
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Device Pairing Tab */}
        <TabsContent value="pairing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" /> Device Pairing
              </CardTitle>
              <CardDescription>
                Connect and manage multiple devices securely
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <span>Pairing Status:</span>
                  <Badge variant={pairingStatus.status === 'paired' ? 'default' : 'outline'}>
                    {pairingStatus.status.charAt(0).toUpperCase() + pairingStatus.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="grid gap-2">
                  <Label>Current Device</Label>
                  <div className="p-4 border rounded-md">
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <div>Device Name:</div>
                      <div>{devicePairing.getCurrentDevice().name}</div>
                      
                      <div>Device Type:</div>
                      <div>{devicePairing.getCurrentDevice().type}</div>
                      
                      <div>Device ID:</div>
                      <div className="truncate">{devicePairing.getCurrentDevice().id.substring(0, 12)}...</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label>Paired Devices ({pairedDevices.length})</Label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setPairedDevices(devicePairing.getPairedDevices())}
                    >
                      Refresh
                    </Button>
                  </div>
                  
                  {pairedDevices.length > 0 ? (
                    <div className="space-y-2">
                      {pairedDevices.map(device => (
                        <div key={device.id} className="p-3 border rounded-md flex justify-between items-center">
                          <div>
                            <div className="font-medium">{device.name}</div>
                            <div className="text-xs text-muted-foreground">{device.type}</div>
                            <div className="text-xs text-muted-foreground">
                              Last active: {new Date(device.lastConnected).toLocaleDateString()}
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              devicePairing.removePairedDevice(device.id);
                              setPairedDevices(devicePairing.getPairedDevices());
                              toast({
                                title: "Device Removed",
                                description: `${device.name} has been unpaired.`,
                                variant: "default"
                              });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border rounded-md text-center text-muted-foreground">
                      No devices paired
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={initiatePairing}
                disabled={pairingStatus.status === 'pairing' || pairingStatus.status === 'generating'}
              >
                Pair New Device
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileFeatureDemo;
import React from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import CustomThemeCreator from '@/components/settings/CustomThemeCreator';
import { 
  Palette, Bell, Shield, ArrowLeft, Zap, Eye, 
  Banknote, AlertTriangle 
} from 'lucide-react';
import { useThemeStore } from '@/lib/theme';
import { Link } from 'wouter';
import { useLiveMode } from '../contexts/LiveModeContext';
import { LiveModeIndicator } from '@/components/ui/LiveModeIndicator';

const SettingsPage: React.FC = () => {
  const { theme, availableThemes } = useThemeStore();
  const { isLiveMode, toggleLiveMode } = useLiveMode();
  
  return (
    <>
      <Helmet>
        <title>Settings | Aetherion</title>
      </Helmet>
      
      <div className="container py-6 max-w-6xl">
        <div className="mb-6">
          <Link to="/" className="text-muted-foreground hover:text-foreground inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
        
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and personalize your experience.
          </p>
        </div>
        
        <Tabs defaultValue="appearance">
          <TabsList className="mb-6">
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="display" className="gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Display</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how Aetherion looks and feels.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="animated-transitions" className="font-medium">Animated Transitions</Label>
                      <p className="text-sm text-muted-foreground">Enable smooth animations for a more dynamic experience</p>
                    </div>
                    <Switch id="animated-transitions" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="reduced-motion" className="font-medium">Reduced Motion</Label>
                      <p className="text-sm text-muted-foreground">Limit animations for accessibility purposes</p>
                    </div>
                    <Switch id="reduced-motion" />
                  </div>
                </div>
                
                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-2">Current Theme</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableThemes.map(t => (
                      <div 
                        key={t.id}
                        className={`p-4 border rounded-lg cursor-pointer transition hover:shadow-md ${
                          t.id === theme.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => useThemeStore.getState().setTheme(t)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Select ${t.name} theme`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            useThemeStore.getState().setTheme(t);
                          }
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: t.primary }}
                          />
                          <span className="font-medium">{t.name}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 h-10">
                          <div 
                            className="col-span-2 rounded"
                            style={{ 
                              backgroundColor: t.primary,
                              borderRadius: `${t.radius * 0.5 * 0.75}rem` 
                            }}
                          />
                          <div className="grid grid-rows-2 gap-1">
                            <div 
                              className="rounded bg-opacity-70"
                              style={{ 
                                backgroundColor: t.primary,
                                opacity: 0.7,
                                borderRadius: `${t.radius * 0.5 * 0.75}rem` 
                              }}
                            />
                            <div 
                              className="rounded bg-opacity-40"
                              style={{ 
                                backgroundColor: t.primary,
                                opacity: 0.4,
                                borderRadius: `${t.radius * 0.5 * 0.75}rem` 
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-xs mt-2 flex justify-between">
                          <span className="text-muted-foreground capitalize">{t.mode} mode</span>
                          {t.id === theme.id && (
                            <span className="text-primary">Active</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Create Custom Theme</CardTitle>
                <CardDescription>
                  Design your own theme with custom colors and styles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomThemeCreator />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="price-alerts" className="font-medium">Price Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications for significant price changes</p>
                    </div>
                    <Switch id="price-alerts" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="transaction-alerts" className="font-medium">Transaction Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified when transactions are completed</p>
                    </div>
                    <Switch id="transaction-alerts" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="security-alerts" className="font-medium">Security Alerts</Label>
                      <p className="text-sm text-muted-foreground">Be informed about important security events</p>
                    </div>
                    <Switch id="security-alerts" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="news-updates" className="font-medium">News & Updates</Label>
                      <p className="text-sm text-muted-foreground">Get the latest news about Aetherion</p>
                    </div>
                    <Switch id="news-updates" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6">
            {/* Trading Mode Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-5 w-5 text-primary" />
                    <span>Trading Mode</span>
                  </div>
                  <LiveModeIndicator variant="badge" />
                </CardTitle>
                <CardDescription>
                  Switch between paper trading (simulated coins) and live trading modes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <h3 className="text-lg font-medium">Trading Mode</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isLiveMode 
                        ? "Live Mode: Trading with real coins" 
                        : "Test Mode: Trading with simulated coins"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{isLiveMode ? 'Live' : 'Test'}</span>
                    <Switch 
                      id="trading-mode-switch"
                      checked={isLiveMode}
                      onCheckedChange={toggleLiveMode}
                    />
                  </div>
                </div>

                {isLiveMode ? (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Live Trading Mode Enabled</AlertTitle>
                    <AlertDescription>
                      You are now trading with real coins. All transactions will use actual funds from your wallet.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Test Trading Mode Enabled</AlertTitle>
                    <AlertDescription>
                      You are using simulated coins for practice. No real funds will be used in transactions.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Original Quantum Security Card */}
            <Card>
              <CardHeader>
                <CardTitle>Quantum Security Settings</CardTitle>
                <CardDescription>
                  Configure your quantum security preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="kyber-encryption" className="font-medium">CRYSTAL-Kyber Encryption</Label>
                      <p className="text-sm text-muted-foreground">Enable quantum-resistant encryption for transactions</p>
                    </div>
                    <Switch id="kyber-encryption" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sphincs-signatures" className="font-medium">SPHINCS+ Signatures</Label>
                      <p className="text-sm text-muted-foreground">Use quantum-resistant signatures for authentication</p>
                    </div>
                    <Switch id="sphincs-signatures" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="fractal-sharding" className="font-medium">Fractal Sharding</Label>
                      <p className="text-sm text-muted-foreground">Distribute your data across multiple secure nodes</p>
                    </div>
                    <Switch id="fractal-sharding" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-security-updates" className="font-medium">Automatic Security Updates</Label>
                      <p className="text-sm text-muted-foreground">Apply security patches automatically</p>
                    </div>
                    <Switch id="auto-security-updates" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Performance Settings</CardTitle>
                <CardDescription>
                  Optimize the application for your device.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="data-compression" className="font-medium">Data Compression</Label>
                      <p className="text-sm text-muted-foreground">Reduce bandwidth usage with compression</p>
                    </div>
                    <Switch id="data-compression" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="background-sync" className="font-medium">Background Synchronization</Label>
                      <p className="text-sm text-muted-foreground">Keep data in sync while the app is in the background</p>
                    </div>
                    <Switch id="background-sync" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="hardware-acceleration" className="font-medium">Hardware Acceleration</Label>
                      <p className="text-sm text-muted-foreground">Use GPU for improved performance</p>
                    </div>
                    <Switch id="hardware-acceleration" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="display">
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>
                  Configure how information is displayed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compact-view" className="font-medium">Compact View</Label>
                      <p className="text-sm text-muted-foreground">Display more information in less space</p>
                    </div>
                    <Switch id="compact-view" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-fiat-values" className="font-medium">Show Fiat Values</Label>
                      <p className="text-sm text-muted-foreground">Display cryptocurrency values in USD/EUR</p>
                    </div>
                    <Switch id="show-fiat-values" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-portfolio-graph" className="font-medium">Portfolio Graph</Label>
                      <p className="text-sm text-muted-foreground">Show portfolio value graph on the dashboard</p>
                    </div>
                    <Switch id="show-portfolio-graph" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-network-status" className="font-medium">Network Status Indicator</Label>
                      <p className="text-sm text-muted-foreground">Display current network connection status</p>
                    </div>
                    <Switch id="show-network-status" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default SettingsPage;
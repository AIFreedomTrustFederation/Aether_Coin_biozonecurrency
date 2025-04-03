import React, { useState } from 'react';
import { useAI } from '../contexts/AIContext';
import ChatInterface from './ChatInterface';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash2, AlertTriangle, Settings, MessageSquare, Award, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import TransactionVerifier from '../utils/TransactionVerifier';
import { TransactionToVerify } from '../types';

interface AIAssistantProps {
  userId: number;
  className?: string;
  fullWidth?: boolean;
  defaultTab?: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  userId,
  className = '',
  fullWidth = false,
  defaultTab = 'chat'
}) => {
  const { state, clearHistory, updateConfig } = useAI();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  
  // Initialize AI with user ID if not already done
  React.useEffect(() => {
    if (state.config.userId !== userId) {
      updateConfig({ userId });
    }
  }, [userId, state.config.userId, updateConfig]);

  // Handle clearing chat history
  const handleClearHistory = () => {
    clearHistory();
    setShowResetDialog(false);
  };

  // Toggle AI assistant visibility
  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
  };

  // Sample transaction for demo purposes
  const sampleTransaction: TransactionToVerify = {
    id: 'tx_' + Math.random().toString(36).substring(2, 9),
    fromAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    toAddress: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72',
    amount: '1250.75',
    tokenSymbol: 'ETH',
    network: 'Ethereum',
    timestamp: new Date(),
    status: 'pending'
  };

  // Handle transaction verification
  const handleVerifyTransaction = async () => {
    const result = await TransactionVerifier.verifyTransaction(sampleTransaction);
    console.log('Verification result:', result);
    
    // In a real app, you'd display this result to the user
    // and potentially integrate with the chat interface
  };

  if (isMinimized) {
    return <ChatInterface minimized onClose={toggleMinimized} />;
  }

  return (
    <Card className={`${className} ${fullWidth ? 'w-full' : 'w-[400px]'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            AI Assistant
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={toggleMinimized}>
            <Settings size={18} />
          </Button>
        </div>
        <CardDescription>
          Your personal quantum-secure blockchain assistant
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mx-4 mb-2">
          <TabsTrigger value="chat" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <CardContent className="p-0">
          <TabsContent value="chat" className="m-0">
            <ChatInterface 
              fullWidth={fullWidth} 
              showHeader={false} 
              className="border-none shadow-none" 
            />
          </TabsContent>
          
          <TabsContent value="security" className="p-4 m-0 space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Transaction Security</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Verify transactions and detect potential fraud with our AI-powered security tools.
              </p>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">Sample Transaction</CardTitle>
                    <CardDescription>
                      {sampleTransaction.amount} {sampleTransaction.tokenSymbol} to {sampleTransaction.toAddress.slice(0, 6)}...{sampleTransaction.toAddress.slice(-4)}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="p-4 pt-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={handleVerifyTransaction}
                      className="w-full"
                    >
                      Verify Transaction
                    </Button>
                  </CardFooter>
                </Card>
                
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">Security Notice</h4>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                        All transactions are held in escrow for {state.config.holdingPeriod} hours for potential reversal in case of fraud, phishing, or other security issues.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="p-4 m-0">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">General Settings</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme-setting">Theme</Label>
                    <select 
                      id="theme-setting"
                      className="w-32 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background"
                      value={state.config.theme}
                      onChange={(e) => updateConfig({ theme: e.target.value as any })}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="voice-setting">Voice Commands</Label>
                    <Switch 
                      id="voice-setting"
                      checked={state.config.enableVoice}
                      onCheckedChange={(checked) => updateConfig({ enableVoice: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications-setting">Notifications</Label>
                    <Switch 
                      id="notifications-setting"
                      checked={state.config.enableNotifications}
                      onCheckedChange={(checked) => updateConfig({ enableNotifications: checked })}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Security Settings</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="security-level">Security Level</Label>
                      <span className="text-xs font-medium px-2 py-1 rounded-md bg-primary/10 text-primary">
                        {state.config.securityLevel === 'standard' && 'Standard'}
                        {state.config.securityLevel === 'high' && 'High'}
                        {state.config.securityLevel === 'paranoid' && 'Paranoid'}
                      </span>
                    </div>
                    <Slider 
                      id="security-level"
                      defaultValue={[
                        state.config.securityLevel === 'standard' ? 0 : 
                        state.config.securityLevel === 'high' ? 50 : 100
                      ]}
                      max={100}
                      step={50}
                      onValueChange={([value]) => {
                        const level = 
                          value === 0 ? 'standard' : 
                          value === 50 ? 'high' : 'paranoid';
                        updateConfig({ securityLevel: level as any });
                      }}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">Standard</span>
                      <span className="text-xs text-muted-foreground">High</span>
                      <span className="text-xs text-muted-foreground">Paranoid</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="holding-period">Holding Period</Label>
                      <span className="text-xs">{state.config.holdingPeriod} hours</span>
                    </div>
                    <Slider 
                      id="holding-period"
                      defaultValue={[state.config.holdingPeriod || 24]}
                      min={6}
                      max={48}
                      step={6}
                      onValueChange={([value]) => updateConfig({ holdingPeriod: value })}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">6h</span>
                      <span className="text-xs text-muted-foreground">24h</span>
                      <span className="text-xs text-muted-foreground">48h</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="transaction-reversal">Transaction Reversal</Label>
                    <Switch 
                      id="transaction-reversal"
                      checked={state.config.transactionReversal}
                      onCheckedChange={(checked) => updateConfig({ transactionReversal: checked })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="w-full"
                  onClick={() => setShowResetDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Chat History
                </Button>
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Chat History</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear your chat history? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearHistory}>
              Clear History
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AIAssistant;
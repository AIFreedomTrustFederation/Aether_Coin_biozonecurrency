import React, { useState } from 'react';
import { useAI } from '../contexts/AIContext';
import { 
  Bell, 
  VolumeX, 
  Volume2, 
  Languages, 
  Shield, 
  MessageSquare,
  RotateCcw, 
  Trash2,
  AlertTriangle,
  Globe,
  Info,
  Lock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AISettingsProps } from '../types';

const AISettings: React.FC<AISettingsProps> = ({ className = '' }) => {
  const { state, updateConfig, clearHistory } = useAI();
  const { config } = state;
  
  // Local state for confirmation dialogs
  const [showClearHistoryDialog, setShowClearHistoryDialog] = useState(false);
  
  // Handle updates for toggles
  const handleToggleChange = (key: keyof typeof config, value: boolean) => {
    updateConfig({ [key]: value });
  };
  
  // Handle updates for select inputs
  const handleSelectChange = (key: keyof typeof config, value: string) => {
    updateConfig({ [key]: value });
  };
  
  // Handle updates for numeric slider
  const handleSliderChange = (value: number[]) => {
    updateConfig({ maxAlertThreshold: value[0] });
  };
  
  // Handle clear history
  const handleClearHistory = () => {
    clearHistory();
    setShowClearHistoryDialog(false);
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-xl font-semibold mb-1 flex items-center">
          <Bell className="mr-2 h-5 w-5 text-primary" />
          AI Assistant Settings
        </h2>
        <p className="text-muted-foreground text-sm">
          Customize your AI assistant's behavior and preferences
        </p>
      </div>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>
        
        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-4 p-1">
          <Card>
            <CardHeader>
              <CardTitle>Interface Preferences</CardTitle>
              <CardDescription>Configure how the AI interacts with you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Voice Interaction</Label>
                  <p className="text-sm text-muted-foreground">Enable voice commands and responses</p>
                </div>
                <Switch
                  checked={config.enableVoice}
                  onCheckedChange={(checked) => handleToggleChange('enableVoice', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Response Style</Label>
                  <p className="text-sm text-muted-foreground">Set how detailed AI responses should be</p>
                </div>
                <Select 
                  value={config.aiResponseStyle} 
                  onValueChange={(value) => handleSelectChange('aiResponseStyle', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="concise">Concise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label className="text-base">Language</Label>
                    <Languages className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Set your preferred language</p>
                </div>
                <Select 
                  value={config.language} 
                  onValueChange={(value) => handleSelectChange('language', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ru">Russian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Control which notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notification Level</Label>
                  <p className="text-sm text-muted-foreground">Choose which alerts you want to receive</p>
                </div>
                <Select 
                  value={config.notificationLevel} 
                  onValueChange={(value: 'all' | 'important' | 'none') => handleSelectChange('notificationLevel', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Notifications</SelectItem>
                    <SelectItem value="important">Important Only</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Alert Threshold</Label>
                  <span className="text-sm">{config.maxAlertThreshold}</span>
                </div>
                <Slider
                  value={[config.maxAlertThreshold]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={handleSliderChange}
                />
                <p className="text-sm text-muted-foreground">
                  Set the maximum daily alerts you want to receive
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Settings Tab */}
        <TabsContent value="security" className="space-y-4 p-1">
          <Card>
            <CardHeader>
              <CardTitle>Security Features</CardTitle>
              <CardDescription>Configure security and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label className="text-base">Phishing Detection</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Automatically scan for and detect potential phishing activities</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Scan and alert about suspicious URLs and wallet interactions
                  </p>
                </div>
                <Switch
                  checked={config.enablePhishingDetection}
                  onCheckedChange={(checked) => handleToggleChange('enablePhishingDetection', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label className="text-base">Auto-Verify Transactions</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Automatically verify transactions for security issues before submission</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AI automatically checks transactions for security risks
                  </p>
                </div>
                <Switch
                  checked={config.autoVerifyTransactions}
                  onCheckedChange={(checked) => handleToggleChange('autoVerifyTransactions', checked)}
                />
              </div>
              
              <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-950 rounded-md border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-300">Security Information</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                      Your AI analysis and security scanning is performed locally with quantum-grade encryption.
                      No sensitive wallet information is transmitted to external servers.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Data Management Tab */}
        <TabsContent value="data" className="space-y-4 p-1">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Control your conversation data and histories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 border rounded-md">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Your data is encrypted</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      All conversation data is encrypted with quantum-resistant encryption and stored locally.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-4 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowClearHistoryDialog(true)}
                  className="flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear Conversation History
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete All Saved Credentials
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Clear History Confirmation Dialog */}
      <AlertDialog open={showClearHistoryDialog} onOpenChange={setShowClearHistoryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Conversation History?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your entire conversation history with the AI assistant.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearHistory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AISettings;
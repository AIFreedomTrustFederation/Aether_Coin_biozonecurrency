import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  BellRing, 
  Shield, 
  MessageSquare, 
  Key, 
  CheckCircle2, 
  AlertTriangle,
  Trash2,
  Mic,
  Languages
} from 'lucide-react';
import { useAI } from '../contexts/AIContext';
import { AISettingsProps } from '../types';

/**
 * AISettings component for configuring AI assistant preferences,
 * security options, and notification settings.
 */
const AISettings: React.FC<AISettingsProps> = ({ className = '' }) => {
  const { state, updateConfig, clearConversation, removeCredential } = useAI();
  const { config, storedCredentials } = state;
  const { toast } = useToast();
  const [matrixId, setMatrixId] = useState(config.matrixId || '');
  const [currentTab, setCurrentTab] = useState('general');
  
  // Handle save matrix ID
  const handleSaveMatrixId = () => {
    if (!matrixId) {
      toast({
        variant: 'destructive',
        title: 'Matrix ID Required',
        description: 'Please enter a valid Matrix ID to enable Matrix notifications.'
      });
      return;
    }
    
    updateConfig({ matrixId });
    
    toast({
      title: 'Matrix ID Saved',
      description: 'Your Matrix ID has been updated successfully.'
    });
  };
  
  // Handle toggle for boolean settings
  const handleToggleSetting = (key: keyof typeof config, value: boolean) => {
    updateConfig({ [key]: value });
    
    toast({
      title: 'Setting Updated',
      description: `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} has been ${value ? 'enabled' : 'disabled'}.`
    });
  };
  
  // Handle notification level change
  const handleNotificationLevelChange = (value: string) => {
    updateConfig({ 
      notificationLevel: value as 'all' | 'important' | 'minimal' 
    });
    
    toast({
      title: 'Notification Level Updated',
      description: `Notifications set to: ${value.charAt(0).toUpperCase() + value.slice(1)}`
    });
  };
  
  // Handle AI response style change
  const handleResponseStyleChange = (value: string) => {
    updateConfig({ 
      aiResponseStyle: value as 'concise' | 'detailed'
    });
    
    toast({
      title: 'AI Response Style Updated',
      description: `AI responses will now be more ${value}.`
    });
  };
  
  // Handle language change
  const handleLanguageChange = (value: string) => {
    updateConfig({ language: value });
    
    toast({
      title: 'Language Updated',
      description: `Interface language set to: ${value.toUpperCase()}`
    });
  };
  
  // Handle alert threshold change
  const handleAlertThresholdChange = (value: number[]) => {
    updateConfig({ maxAlertThreshold: value[0] });
  };
  
  // Handle clear conversation
  const handleClearConversation = () => {
    clearConversation();
    
    toast({
      title: 'Conversation Cleared',
      description: 'Your chat history has been cleared.'
    });
  };
  
  // Handle credential removal
  const handleRemoveCredential = (id: string, name: string) => {
    removeCredential(id);
    
    toast({
      title: 'Credential Removed',
      description: `"${name}" has been removed from secure storage.`
    });
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5" />
        <h2 className="text-xl font-semibold">AI Assistant Settings</h2>
      </div>
      
      <Tabs defaultValue="general" value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Preferences</CardTitle>
              <CardDescription>
                Configure how the AI assistant communicates with you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Selection */}
              <div className="space-y-2">
                <Label htmlFor="language" className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Interface Language
                </Label>
                <Select
                  value={config.language}
                  onValueChange={handleLanguageChange}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Languages</SelectLabel>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* AI Response Style */}
              <div className="space-y-2">
                <Label htmlFor="responseStyle" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  AI Response Style
                </Label>
                <Select
                  value={config.aiResponseStyle}
                  onValueChange={handleResponseStyleChange}
                >
                  <SelectTrigger id="responseStyle">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {config.aiResponseStyle === 'concise' 
                    ? 'Concise: Short and to-the-point responses' 
                    : 'Detailed: More comprehensive explanations'}
                </p>
              </div>
              
              {/* Voice Interaction */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label 
                    htmlFor="voiceToggle"
                    className="flex items-center gap-2"
                  >
                    <Mic className="h-4 w-4" />
                    Voice Interaction
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable speech recognition and text-to-speech
                  </p>
                </div>
                <Switch 
                  id="voiceToggle"
                  checked={config.enableVoice}
                  onCheckedChange={(checked) => 
                    handleToggleSetting('enableVoice', checked)
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t pt-4">
              <Button 
                variant="outline" 
                onClick={handleClearConversation}
              >
                Clear Conversation History
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security features and transaction verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Phishing Detection */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label 
                    htmlFor="phishingToggle"
                    className="flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Phishing Detection
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically detect and warn about potential phishing attempts
                  </p>
                </div>
                <Switch 
                  id="phishingToggle"
                  checked={config.enablePhishingDetection}
                  onCheckedChange={(checked) => 
                    handleToggleSetting('enablePhishingDetection', checked)
                  }
                />
              </div>
              
              {/* Auto Transaction Verification */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label 
                    htmlFor="transactionToggle"
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Auto Transaction Verification
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically verify transactions for suspicious activity
                  </p>
                </div>
                <Switch 
                  id="transactionToggle"
                  checked={config.autoVerifyTransactions}
                  onCheckedChange={(checked) => 
                    handleToggleSetting('autoVerifyTransactions', checked)
                  }
                />
              </div>
              
              {/* Alert Threshold */}
              <div className="space-y-3">
                <div className="space-y-0.5">
                  <Label 
                    htmlFor="alertThreshold"
                    className="flex items-center gap-2"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Alert Threshold
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Set the sensitivity level for security alerts (1-10)
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Slider
                    id="alertThreshold"
                    min={1}
                    max={10}
                    step={1}
                    value={[config.maxAlertThreshold]}
                    onValueChange={handleAlertThresholdChange}
                  />
                  <span className="min-w-8 text-center font-medium">
                    {config.maxAlertThreshold}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {config.maxAlertThreshold < 4 ? (
                    "Low: Only critical security issues will be reported"
                  ) : config.maxAlertThreshold < 8 ? (
                    "Medium: Balance between security and convenience"
                  ) : (
                    "High: Maximum security with more frequent alerts"
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Level */}
              <div className="space-y-2">
                <Label htmlFor="notificationLevel" className="flex items-center gap-2">
                  <BellRing className="h-4 w-4" />
                  Notification Level
                </Label>
                <Select
                  value={config.notificationLevel}
                  onValueChange={handleNotificationLevelChange}
                >
                  <SelectTrigger id="notificationLevel">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Notifications</SelectItem>
                    <SelectItem value="important">Important Only</SelectItem>
                    <SelectItem value="minimal">Minimal (Critical Only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label 
                    htmlFor="emailToggle"
                    className="flex items-center gap-2"
                  >
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive security and transaction alerts via email
                  </p>
                </div>
                <Switch 
                  id="emailToggle"
                  checked={config.emailEnabled}
                  onCheckedChange={(checked) => 
                    handleToggleSetting('emailEnabled', checked)
                  }
                />
              </div>
              
              {/* Matrix Notifications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label 
                      htmlFor="matrixToggle"
                      className="flex items-center gap-2"
                    >
                      Matrix Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via Matrix messaging protocol
                    </p>
                  </div>
                  <Switch 
                    id="matrixToggle"
                    checked={config.matrixEnabled}
                    onCheckedChange={(checked) => 
                      handleToggleSetting('matrixEnabled', checked)
                    }
                  />
                </div>
                
                {config.matrixEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="matrixId">Matrix ID</Label>
                    <div className="flex gap-2">
                      <Input
                        id="matrixId"
                        placeholder="@username:matrix.org"
                        value={matrixId}
                        onChange={(e) => setMatrixId(e.target.value)}
                      />
                      <Button onClick={handleSaveMatrixId}>Save</Button>
                    </div>
                    {!config.matrixId && (
                      <p className="text-sm text-amber-500">
                        Please add your Matrix ID to receive notifications
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Stored Credentials */}
        <TabsContent value="credentials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Secure Credentials</CardTitle>
              <CardDescription>
                View and manage securely stored credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {storedCredentials.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Key className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Stored Credentials</h3>
                  <p className="text-muted-foreground max-w-md">
                    You haven't stored any credentials yet. The AI assistant can securely store your credentials for various services.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {storedCredentials.map((credential) => (
                    <div 
                      key={credential.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{credential.name}</div>
                        <div className="text-sm text-muted-foreground flex gap-2">
                          <span>{credential.service}</span>
                          <span>•</span>
                          <span>{credential.type}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last used: {credential.lastUsed ? 
                            new Date(credential.lastUsed).toLocaleDateString() : 
                            'Never'}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCredential(credential.id, credential.name)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Alert className="w-full">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Security Notice</AlertTitle>
                <AlertDescription>
                  All credentials are securely encrypted using advanced encryption standards and can only be accessed by you.
                </AlertDescription>
              </Alert>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AISettings;
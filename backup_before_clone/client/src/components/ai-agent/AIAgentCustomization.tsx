import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import {
  Bot,
  Brain,
  Sliders,
  Palette,
  ShieldCheck,
  Key,
  Sparkles,
  BarChart3,
  Fingerprint,
  Check,
  AlertTriangle,
  Info,
  Save,
  Lock
} from 'lucide-react';

import { 
  AIAgentProfile, 
  AgentCapabilityTier,
  aiAgentManager
} from '../../core/ai-agent/AIAgentManager';

interface AIAgentCustomizationProps {
  userId: string;
  agentId?: string;
  onAgentUpdated?: (agent: AIAgentProfile) => void;
  onClose?: () => void;
}

export default function AIAgentCustomization({
  userId,
  agentId,
  onAgentUpdated,
  onClose
}: AIAgentCustomizationProps) {
  const { toast } = useToast();
  const [agent, setAgent] = useState<AIAgentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('personality');
  const [agentName, setAgentName] = useState('');
  
  // Personality traits
  const [personalityTraits, setPersonalityTraits] = useState<Record<string, number>>({
    analytical: 50,
    creative: 50,
    cautious: 50,
    proactive: 50,
    formal: 50,
    friendly: 50
  });
  
  // Appearance options
  const [selectedTheme, setSelectedTheme] = useState('fractal-dark');
  const [selectedAvatarStyle, setSelectedAvatarStyle] = useState('quantum');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  
  // Delegation settings
  const [delegationRules, setDelegationRules] = useState<Record<string, boolean>>({
    can_monitor_transactions: true,
    can_send_alerts: true,
    can_view_portfolio: true,
    can_suggest_trades: false,
    can_execute_trades: false,
    can_transfer_funds: false,
    can_interact_with_contracts: false,
    can_participate_in_governance: false,
    can_manage_wallets: false
  });
  
  // Autonomy level
  const [autonomyLevel, setAutonomyLevel] = useState(20);
  
  // Initialize component
  useEffect(() => {
    const loadAgent = async () => {
      setIsLoading(true);
      try {
        if (!aiAgentManager.isInitialized()) {
          aiAgentManager.initialize();
        }
        
        let agentProfile: AIAgentProfile | undefined;
        
        if (agentId) {
          // Fetch specific agent by ID
          agentProfile = aiAgentManager.getAgentById(agentId);
        } else {
          // Fetch user's assigned agent
          agentProfile = aiAgentManager.getUserAgent(userId);
        }
        
        if (agentProfile) {
          setAgent(agentProfile);
          setAgentName(agentProfile.name);
          setPersonalityTraits(agentProfile.personalityProfile);
          setSelectedTheme(agentProfile.appearance.interfaceTheme);
          setSelectedAvatarStyle(agentProfile.appearance.avatarStyle);
          setSelectedColor(agentProfile.appearance.avatarColor);
          setDelegationRules(agentProfile.delegationRules);
          setAutonomyLevel(agentProfile.autonomyLevel);
        }
      } catch (error) {
        console.error('Error loading AI agent:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to load AI agent',
          description: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAgent();
  }, [userId, agentId, toast]);
  
  // Save agent customizations
  const saveAgentCustomizations = async () => {
    if (!agent) return;
    
    setIsLoading(true);
    try {
      // Prepare agent updates
      const updates: Partial<AIAgentProfile> = {
        name: agentName,
        personalityProfile: personalityTraits,
        appearance: {
          avatarColor: selectedColor,
          avatarStyle: selectedAvatarStyle,
          interfaceTheme: selectedTheme
        },
        delegationRules,
        autonomyLevel
      };
      
      // Update agent
      const updatedAgent = await aiAgentManager.updateAgent(agent.id, updates);
      setAgent(updatedAgent);
      
      // Notify parent of update
      if (onAgentUpdated) {
        onAgentUpdated(updatedAgent);
      }
      
      toast({
        title: 'AI Agent Updated',
        description: 'Your AI agent customizations have been saved.',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error updating AI agent:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to update AI agent',
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render capability tier badge
  const renderTierBadge = (tier: AgentCapabilityTier) => {
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
    
    switch (tier) {
      case 'basic_sentinel':
        variant = 'outline';
        break;
      case 'enhanced_navigator':
        variant = 'secondary';
        break;
      case 'premium_strategist':
        variant = 'default';
        break;
      case 'quantum_architect':
        variant = 'default';
        break;
      case 'singularity_oracle':
        variant = 'default';
        break;
    }
    
    const tierName = tier.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    return <Badge variant={variant}>{tierName}</Badge>;
  };
  
  // Format capability name for display
  const formatCapabilityName = (capability: string) => {
    return capability.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  // Check if a delegation rule is permitted for current tier
  const isDelegationAllowed = (ruleName: string): boolean => {
    if (!agent) return false;
    
    // All agents can use basic monitoring
    if (['can_monitor_transactions', 'can_send_alerts', 'can_view_portfolio'].includes(ruleName)) {
      return true;
    }
    
    // Tier-specific permissions
    switch (agent.tier) {
      case 'basic_sentinel':
        return false;
      case 'enhanced_navigator':
        return ruleName === 'can_suggest_trades';
      case 'premium_strategist':
        return ['can_suggest_trades', 'can_interact_with_contracts'].includes(ruleName);
      case 'quantum_architect':
        return ['can_suggest_trades', 'can_interact_with_contracts', 
                'can_execute_trades', 'can_participate_in_governance'].includes(ruleName);
      case 'singularity_oracle':
        return true;
      default:
        return false;
    }
  };
  
  // Render agent initials for avatar
  const getAgentInitials = () => {
    if (!agentName) return 'AI';
    
    const words = agentName.split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  };
  
  if (isLoading && !agent) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-primary rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading AI Agent...</p>
        </div>
      </div>
    );
  }
  
  if (!agent) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Agent Not Found</AlertTitle>
        <AlertDescription>
          No AI Agent was found for this user. Please complete KYC verification to create your personal AI agent.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" /> AI Agent Customization
            </CardTitle>
            <CardDescription>
              Personalize your quantum AI agent's personality, appearance, and operational parameters
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {renderTierBadge(agent.tier)}
            <Avatar className="h-10 w-10" style={{ backgroundColor: selectedColor }}>
              <AvatarFallback>{getAgentInitials()}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Label htmlFor="agentName">Agent Name</Label>
          <Input 
            id="agentName" 
            value={agentName} 
            onChange={(e) => setAgentName(e.target.value)} 
            placeholder="Enter a name for your AI agent"
            className="mt-1"
          />
        </div>
        
        <Tabs 
          defaultValue="personality" 
          value={selectedTab} 
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="personality" className="flex items-center gap-1">
              <Brain className="h-4 w-4" /> Personality
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-1">
              <Palette className="h-4 w-4" /> Appearance
            </TabsTrigger>
            <TabsTrigger value="delegation" className="flex items-center gap-1">
              <Key className="h-4 w-4" /> Delegation
            </TabsTrigger>
            <TabsTrigger value="capabilities" className="flex items-center gap-1">
              <Sparkles className="h-4 w-4" /> Capabilities
            </TabsTrigger>
          </TabsList>
          
          {/* Personality Tab */}
          <TabsContent value="personality">
            <div className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Agent Personality</AlertTitle>
                <AlertDescription>
                  Adjust your AI agent's personality traits to match your preferences. These settings affect how your agent communicates and makes decisions.
                </AlertDescription>
              </Alert>
              
              {Object.entries(personalityTraits).map(([trait, value]) => (
                <div key={trait} className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor={trait}>{formatCapabilityName(trait)}</Label>
                    <span className="text-sm text-muted-foreground">{value}%</span>
                  </div>
                  <Slider
                    id={trait}
                    min={0}
                    max={100}
                    step={5}
                    value={[value]}
                    onValueChange={([newValue]) => 
                      setPersonalityTraits(prev => ({ ...prev, [trait]: newValue }))
                    }
                  />
                </div>
              ))}
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="autonomyLevel">Autonomy Level</Label>
                  <span className="text-sm text-muted-foreground">{autonomyLevel}%</span>
                </div>
                <Slider
                  id="autonomyLevel"
                  min={0}
                  max={100}
                  step={5}
                  value={[autonomyLevel]}
                  onValueChange={([newValue]) => setAutonomyLevel(newValue)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  This setting determines how independently your agent can operate. Higher values allow more autonomous actions.
                </p>
              </div>
            </div>
          </TabsContent>
          
          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <div className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Agent Appearance</AlertTitle>
                <AlertDescription>
                  Customize how your AI agent looks and is presented throughout the interface.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label>Avatar Color</Label>
                <div className="grid grid-cols-7 gap-2 mt-2">
                  {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#6366F1'].map(color => (
                    <div 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`h-8 w-8 rounded-full cursor-pointer border-2 ${selectedColor === color ? 'border-primary' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Avatar Style</Label>
                <RadioGroup 
                  value={selectedAvatarStyle} 
                  onValueChange={setSelectedAvatarStyle}
                  className="grid grid-cols-3 gap-2 mt-2"
                >
                  {['quantum', 'fractal', 'minimal'].map(style => (
                    <div key={style} className="flex items-center space-x-2">
                      <RadioGroupItem value={style} id={`style-${style}`} />
                      <Label htmlFor={`style-${style}`}>{formatCapabilityName(style)}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>Interface Theme</Label>
                <RadioGroup 
                  value={selectedTheme} 
                  onValueChange={setSelectedTheme}
                  className="grid grid-cols-2 gap-2 mt-2"
                >
                  {['fractal-dark', 'fractal-light', 'quantum-dark', 'quantum-light'].map(theme => (
                    <div key={theme} className="flex items-center space-x-2">
                      <RadioGroupItem value={theme} id={`theme-${theme}`} />
                      <Label htmlFor={`theme-${theme}`}>{formatCapabilityName(theme)}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="text-sm font-medium mb-2">Preview</h3>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12" style={{ backgroundColor: selectedColor }}>
                    <AvatarFallback>{getAgentInitials()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{agentName || 'Your AI Agent'}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCapabilityName(selectedAvatarStyle)} style · {formatCapabilityName(selectedTheme)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Delegation Tab */}
          <TabsContent value="delegation">
            <div className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Agent Delegation Rules</AlertTitle>
                <AlertDescription>
                  Control what actions your AI agent is authorized to perform on your behalf. Some permissions require higher capability tiers.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                {Object.entries(delegationRules).map(([rule, value]) => {
                  const isAllowed = isDelegationAllowed(rule);
                  
                  return (
                    <div key={rule} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor={rule} className={!isAllowed ? 'text-muted-foreground' : ''}>
                          {formatCapabilityName(rule)}
                        </Label>
                        {!isAllowed && (
                          <p className="text-xs text-muted-foreground">Requires higher capability tier</p>
                        )}
                      </div>
                      <Switch
                        id={rule}
                        checked={value}
                        onCheckedChange={(checked) => 
                          setDelegationRules(prev => ({ ...prev, [rule]: checked }))
                        }
                        disabled={!isAllowed}
                      />
                    </div>
                  );
                })}
              </div>
              
              <Alert variant="outline" className="bg-muted/50">
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>Delegation Security</AlertTitle>
                <AlertDescription>
                  All agent operations are secured by quantum-resistant cryptography and require your authorization. You can revoke permissions at any time.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
          
          {/* Capabilities Tab */}
          <TabsContent value="capabilities">
            <div className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Agent Capabilities</AlertTitle>
                <AlertDescription>
                  These are the capabilities available to your AI agent based on your current tier: {formatCapabilityName(agent.tier)}.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div className="p-4 border rounded-md">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" /> Capability Statistics
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Total Capabilities</span>
                        <span className="font-medium">{agent.capabilities.length}</span>
                      </div>
                      <Progress value={(agent.capabilities.length / tierCapabilities.singularity_oracle.length) * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Autonomy Level</span>
                        <span className="font-medium">{autonomyLevel}%</span>
                      </div>
                      <Progress value={autonomyLevel} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Reputation Score</span>
                        <span className="font-medium">{agent.reputationScore}%</span>
                      </div>
                      <Progress value={agent.reputationScore} />
                    </div>
                  </div>
                </div>
                
                <ScrollArea className="h-[240px] border rounded-md p-4">
                  <div className="space-y-2">
                    {agent.capabilities.map(capability => (
                      <div key={capability} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{formatCapabilityName(capability)}</span>
                      </div>
                    ))}
                    
                    {/* Show unavailable capabilities */}
                    <Separator className="my-3" />
                    <p className="text-sm text-muted-foreground mb-2">Capabilities from higher tiers:</p>
                    
                    {tierCapabilities.singularity_oracle
                      .filter(capability => !agent.capabilities.includes(capability))
                      .map(capability => (
                        <div key={capability} className="flex items-center gap-2 text-muted-foreground">
                          <Lock className="h-4 w-4" />
                          <span>{formatCapabilityName(capability)}</span>
                        </div>
                      ))
                    }
                  </div>
                </ScrollArea>
                
                <div className="p-4 border rounded-md bg-muted/50">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Fingerprint className="h-4 w-4" /> Quantum Binding Info
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Your AI agent is cryptographically bound to your identity using quantum-resistant binding.
                  </p>
                  <div className="text-xs font-mono bg-muted p-2 rounded">
                    {agent.quantumBindingHash.substring(0, 20)}...{agent.quantumBindingHash.substring(agent.quantumBindingHash.length - 20)}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={saveAgentCustomizations} disabled={isLoading}>
          {isLoading ? 'Saving...' : (
            <>
              <Save className="h-4 w-4 mr-2" /> Save Customizations
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
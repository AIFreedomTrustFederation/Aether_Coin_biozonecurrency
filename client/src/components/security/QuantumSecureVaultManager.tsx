import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Slider } from '../ui/slider';
import { Progress } from '../ui/progress';
import { useToast } from '../../hooks/use-toast';
import { 
  quantumVault,
  VaultItemType,
  SecurityLevel,
  VaultStorageType,
  VaultOptions
} from '../../lib/quantum-vault';
import { secureNotificationService } from '../../lib/quantum-vault/notification-services';
import { fractalShardManager } from '../../lib/quantum-vault/fractal-sharding';
import { bitcoinSecurityLayer } from '../../lib/quantum-vault/bitcoin-security';
import { smartContractManager, ContractType, ContractStatus } from '../../lib/quantum-vault/smart-contracts';
import { 
  Lock, 
  Unlock, 
  Phone, 
  Key, 
  ShieldCheck, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings,
  Database,
  Server,
  HardDrive,
  Network,
  Award,
  Share2,
  Bitcoin,
  FileCode2,
  Newspaper,
  MessageSquare
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

/**
 * Security levels with descriptions for UI display
 */
const securityLevelOptions = [
  { value: SecurityLevel.STANDARD, label: 'Standard', description: 'AES-256 encryption' },
  { value: SecurityLevel.ENHANCED, label: 'Enhanced', description: 'AES-256 + Bitcoin-inspired multisig' },
  { value: SecurityLevel.QUANTUM_RESISTANT, label: 'Quantum Resistant', description: 'Post-quantum cryptographic algorithms' },
  { value: SecurityLevel.FRACTAL_SECURED, label: 'Fractal Secured', description: 'Fractal recursive sharding with holographic verification' },
  { value: SecurityLevel.MAXIMUM, label: 'Maximum', description: 'All security features enabled' },
];

/**
 * Storage type options with descriptions for UI display
 */
const storageTypeOptions = [
  { value: VaultStorageType.LOCAL_ONLY, label: 'Local Only', description: 'Store data only on this device' },
  { value: VaultStorageType.FRACTAL_NETWORK, label: 'Fractal Network', description: 'Distribute data across the fractal recursive network' },
  { value: VaultStorageType.HARDWARE_WALLET, label: 'Hardware Wallet', description: 'Store sensitive data on an external hardware wallet' },
  { value: VaultStorageType.HYBRID, label: 'Hybrid', description: 'Combine multiple storage types for maximum security' },
];

/**
 * Smart contract templates for UI display
 */
const contractTemplates = [
  { 
    type: ContractType.ESCROW, 
    name: 'Escrow Contract', 
    description: 'Secure multi-signature escrow for transactions',
    icon: <Share2 className="h-5 w-5" />
  },
  { 
    type: ContractType.LLM_TRAINING, 
    name: 'LLM Training Data Contract', 
    description: 'Contract for contributing and monetizing AI training data',
    icon: <Newspaper className="h-5 w-5" />
  },
  { 
    type: ContractType.QUANTUM_PROCESSING, 
    name: 'Quantum Processing Contract', 
    description: 'Contract for distributed quantum computing resources',
    icon: <Server className="h-5 w-5" />
  },
  { 
    type: ContractType.STORAGE_ALLOCATION, 
    name: 'Storage Allocation Contract', 
    description: 'Contract for allocating storage on the network',
    icon: <Database className="h-5 w-5" />
  },
];

/**
 * QuantumSecureVaultManager component
 * Provides a UI for managing the advanced quantum-secure vault
 * including fractal recursive sharding, Bitcoin-level security,
 * and smart contract capabilities
 */
export function QuantumSecureVaultManager() {
  const { toast } = useToast();
  
  // Vault state
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Settings state
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>(SecurityLevel.STANDARD);
  const [storageType, setStorageType] = useState<VaultStorageType>(VaultStorageType.LOCAL_ONLY);
  const [enableFractalSharding, setEnableFractalSharding] = useState(false);
  const [enableBitcoinSecurity, setEnableBitcoinSecurity] = useState(false);
  const [enableSmartContracts, setEnableSmartContracts] = useState(false);
  const [autoLockTimeout, setAutoLockTimeout] = useState(15); // minutes
  
  // Security metrics
  const [securityScore, setSecurityScore] = useState(0);
  const [storageUsed, setStorageUsed] = useState(0);
  const [networkContribution, setNetworkContribution] = useState(0);
  
  // Network allocation settings
  const [localStoragePercent, setLocalStoragePercent] = useState(30);
  const [hardwareWalletPercent, setHardwareWalletPercent] = useState(40);
  const [networkDistributionPercent, setNetworkDistributionPercent] = useState(30);
  const [redundancyFactor, setRedundancyFactor] = useState(3);
  
  // Smart contracts
  const [contracts, setContracts] = useState<any[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  
  // Settings update status
  const [updatingSettings, setUpdatingSettings] = useState(false);
  
  // Initialize component state from vault
  useEffect(() => {
    const initialized = quantumVault.isInitialized();
    setIsInitialized(initialized);
    setIsUnlocked(quantumVault.isUnlocked());
    
    if (quantumVault.isUnlocked()) {
      loadVaultData();
    }
  }, []);
  
  // Load data when vault is unlocked
  const loadVaultData = () => {
    // Load vault settings
    const settings = quantumVault.getSettings();
    setSecurityLevel(settings.securityLevel);
    setStorageType(settings.defaultStorageType);
    setEnableFractalSharding(settings.enableFractalSharding);
    setEnableBitcoinSecurity(settings.enableBitcoinSecurity);
    setEnableSmartContracts(settings.enableSmartContracts);
    setAutoLockTimeout(settings.autoLockTimeout / 60000); // Convert from ms to minutes
    
    // Load security metrics
    const metrics = quantumVault.getSecurityMetrics();
    setSecurityScore(metrics.securityScore);
    
    // Load storage metrics
    const storageMetrics = quantumVault.getStorageMetrics();
    setStorageUsed(storageMetrics.totalStorageUsed);
    setNetworkContribution(storageMetrics.networkContribution);
    
    // Load allocation settings
    if (settings.enableFractalSharding) {
      const allocation = fractalShardManager.getAllocation();
      setLocalStoragePercent(allocation.localStoragePercent);
      setHardwareWalletPercent(allocation.hardwareWalletPercent);
      setNetworkDistributionPercent(allocation.networkDistributionPercent);
      setRedundancyFactor(allocation.redundancyFactor);
    }
    
    // Load contracts
    if (settings.enableSmartContracts) {
      setLoadingContracts(true);
      try {
        const allContracts = smartContractManager.getAllContracts();
        setContracts(Object.values(allContracts));
      } catch (error) {
        console.error('Failed to load contracts:', error);
      } finally {
        setLoadingContracts(false);
      }
    }
  };
  
  // Initialize the vault
  const handleInitializeVault = () => {
    if (!masterPassword) {
      toast({
        title: "Password required",
        description: "Please enter a master password to initialize the vault.",
        variant: "destructive",
      });
      return;
    }
    
    if (masterPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    // Create vault options
    const options: VaultOptions = {
      securityLevel,
      defaultStorageType: storageType,
      enableFractalSharding,
      enableBitcoinSecurity,
      enableSmartContracts,
      backupFrequency: 86400000, // Default: once per day
      autoLockTimeout: autoLockTimeout * 60000, // Convert minutes to ms
    };
    
    const success = quantumVault.initialize(masterPassword, options);
    if (success) {
      setIsInitialized(true);
      setIsUnlocked(true);
      setMasterPassword('');
      setConfirmPassword('');
      
      // Load vault data
      loadVaultData();
      
      toast({
        title: "Vault initialized",
        description: "Your quantum-secure vault has been initialized and unlocked.",
      });
    } else {
      toast({
        title: "Initialization failed",
        description: "Failed to initialize the vault. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Unlock the vault
  const handleUnlockVault = () => {
    if (!masterPassword) {
      toast({
        title: "Password required",
        description: "Please enter your master password to unlock the vault.",
        variant: "destructive",
      });
      return;
    }
    
    const success = quantumVault.unlock(masterPassword);
    if (success) {
      setIsUnlocked(true);
      setMasterPassword('');
      
      // Load vault data
      loadVaultData();
      
      toast({
        title: "Vault unlocked",
        description: "Your quantum-secure vault has been unlocked.",
      });
    } else {
      toast({
        title: "Unlock failed",
        description: "Incorrect master password. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Lock the vault
  const handleLockVault = () => {
    quantumVault.lock();
    setIsUnlocked(false);
    toast({
      title: "Vault locked",
      description: "Your quantum-secure vault has been locked.",
    });
  };
  
  // Update vault settings
  const handleUpdateSettings = () => {
    setUpdatingSettings(true);
    
    try {
      // Create updated options
      const options: Partial<VaultOptions> = {
        securityLevel,
        defaultStorageType: storageType,
        enableFractalSharding,
        enableBitcoinSecurity,
        enableSmartContracts,
        autoLockTimeout: autoLockTimeout * 60000, // Convert minutes to ms
      };
      
      // Update settings
      const success = quantumVault.updateSettings(options);
      
      if (success) {
        // Update allocation if fractal sharding is enabled
        if (enableFractalSharding) {
          fractalShardManager.updateAllocation({
            localStoragePercent,
            hardwareWalletPercent,
            networkDistributionPercent,
            redundancyFactor,
          });
        }
        
        // Recalculate security score
        const score = quantumVault.calculateSecurityScore();
        setSecurityScore(score);
        
        toast({
          title: "Settings updated",
          description: "Your vault settings have been updated successfully.",
        });
      } else {
        toast({
          title: "Update failed",
          description: "Failed to update vault settings. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast({
        title: "Update failed",
        description: "An error occurred while updating settings.",
        variant: "destructive",
      });
    } finally {
      setUpdatingSettings(false);
    }
  };
  
  // Create a new smart contract
  const handleCreateContract = (type: ContractType) => {
    // This would open a dialog to create a new contract
    // with type-specific fields
    console.log('Creating contract of type:', type);
    
    toast({
      title: "Contract creation",
      description: "Contract creation would open a specific dialog for " + type,
    });
  };
  
  // Format bytes to readable size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Get contract status badge color
  const getContractStatusColor = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case ContractStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      case ContractStatus.DISPUTED:
        return 'bg-red-100 text-red-800';
      case ContractStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  // Initialize vault UI
  if (!isInitialized) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" /> Initialize Quantum-Secure Vault
          </CardTitle>
          <CardDescription>
            Set up your quantum-secure vault with advanced security features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="master-password">Master Password</Label>
              <Input
                id="master-password"
                type="password"
                placeholder="Enter a strong master password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your master password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your master password protects all sensitive data with quantum-resistant encryption.
                Make sure to use a strong password that you won't forget.
              </p>
            </div>
            
            <div className="space-y-2 pt-4">
              <Label>Security Level</Label>
              <Select
                value={securityLevel}
                onValueChange={(value) => setSecurityLevel(value as SecurityLevel)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select security level" />
                </SelectTrigger>
                <SelectContent>
                  {securityLevelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Storage Type</Label>
              <Select
                value={storageType}
                onValueChange={(value) => setStorageType(value as VaultStorageType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select storage type" />
                </SelectTrigger>
                <SelectContent>
                  {storageTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="fractal-sharding" className="text-sm">Enable Fractal Sharding</Label>
                  <p className="text-xs text-muted-foreground">
                    Distribute data across the fractal recursive network for enhanced security
                  </p>
                </div>
                <Switch 
                  id="fractal-sharding" 
                  checked={enableFractalSharding} 
                  onCheckedChange={(checked) => {
                    setEnableFractalSharding(checked);
                    setTimeout(() => handleUpdateSettings(), 0);
                  }}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="bitcoin-security" className="text-sm">Enable Bitcoin-Level Security</Label>
                  <p className="text-xs text-muted-foreground">
                    Apply Bitcoin-inspired security mechanisms to your vault
                  </p>
                </div>
                <Switch 
                  id="bitcoin-security" 
                  checked={enableBitcoinSecurity} 
                  onCheckedChange={(checked) => {
                    setEnableBitcoinSecurity(checked);
                    setTimeout(() => handleUpdateSettings(), 0);
                  }}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="smart-contracts" className="text-sm">Enable Smart Contracts</Label>
                  <p className="text-xs text-muted-foreground">
                    Add support for secure smart contracts and escrow operations
                  </p>
                </div>
                <Switch 
                  id="smart-contracts" 
                  checked={enableSmartContracts} 
                  onCheckedChange={(checked) => {
                    setEnableSmartContracts(checked);
                    setTimeout(() => handleUpdateSettings(), 0);
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-2 pt-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="auto-lock">Auto-Lock Timeout (minutes)</Label>
                <span className="text-sm">{autoLockTimeout}</span>
              </div>
              <Slider
                id="auto-lock"
                min={1}
                max={60}
                step={1}
                value={[autoLockTimeout]}
                onValueChange={(value) => setAutoLockTimeout(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                The vault will automatically lock after this period of inactivity
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleInitializeVault}
            disabled={!masterPassword || masterPassword !== confirmPassword}
            className="w-full"
          >
            <ShieldCheck className="mr-2 h-4 w-4" /> Initialize Quantum-Secure Vault
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Locked vault UI
  if (!isUnlocked) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" /> Quantum-Secure Vault (Locked)
          </CardTitle>
          <CardDescription>
            Unlock your vault to access and manage your secure information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unlock-password">Master Password</Label>
            <Input
              id="unlock-password"
              type="password"
              placeholder="Enter your master password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleUnlockVault}
            disabled={!masterPassword}
            className="w-full"
          >
            <Unlock className="mr-2 h-4 w-4" /> Unlock Vault
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Unlocked vault UI
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Unlock className="h-5 w-5" /> Quantum-Secure Vault
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLockVault}
          >
            <Lock className="mr-2 h-4 w-4" /> Lock
          </Button>
        </div>
        <CardDescription>
          Manage your quantum-secure vault settings and data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="settings">Security Settings</TabsTrigger>
            <TabsTrigger value="data">Storage Settings</TabsTrigger>
            <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Security Score */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="h-4 w-4" /> Security Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Score: {securityScore}/100</span>
                      <span className={`text-sm font-medium ${
                        securityScore >= 80 ? 'text-green-500' : 
                        securityScore >= 60 ? 'text-amber-500' : 
                        'text-red-500'
                      }`}>
                        {securityScore >= 80 ? 'Excellent' : 
                         securityScore >= 60 ? 'Good' : 
                         securityScore >= 40 ? 'Fair' : 
                         'Poor'}
                      </span>
                    </div>
                    <Progress value={securityScore} className="h-2" />
                  </div>
                </CardContent>
              </Card>
              
              {/* Storage Usage */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="h-4 w-4" /> Storage Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Local Storage</span>
                      <span>{formatBytes(storageUsed)}</span>
                    </div>
                    {enableFractalSharding && (
                      <div className="flex justify-between text-sm">
                        <span>Network Contribution</span>
                        <span>{formatBytes(networkContribution)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Security Features */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Enabled Security Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${securityLevel !== SecurityLevel.STANDARD ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className="text-sm">Enhanced Encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${securityLevel === SecurityLevel.QUANTUM_RESISTANT || securityLevel === SecurityLevel.MAXIMUM ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className="text-sm">Quantum Resistance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${enableFractalSharding ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className="text-sm">Fractal Sharding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${enableBitcoinSecurity ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className="text-sm">Bitcoin-Level Security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${enableSmartContracts ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className="text-sm">Smart Contracts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${autoLockTimeout <= 15 ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className="text-sm">Auto-Lock ({autoLockTimeout} min)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Activity - Would be implemented with actual vault activity */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No recent activity to display.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Security Level</Label>
                <Select
                  value={securityLevel}
                  onValueChange={(value) => setSecurityLevel(value as SecurityLevel)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select security level" />
                  </SelectTrigger>
                  <SelectContent>
                    {securityLevelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Label htmlFor="fractal-sharding" className="text-sm">Enable Fractal Sharding</Label>
                    <p className="text-xs text-muted-foreground">
                      Distribute data across the fractal recursive network for enhanced security
                    </p>
                  </div>
                  <Switch 
                    id="fractal-sharding" 
                    checked={enableFractalSharding} 
                    onCheckedChange={(checked) => {
                      setEnableFractalSharding(checked);
                      setTimeout(() => handleUpdateSettings(), 0);
                    }}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <Label htmlFor="bitcoin-security" className="text-sm">Enable Bitcoin-Level Security</Label>
                    <p className="text-xs text-muted-foreground">
                      Apply Bitcoin-inspired security mechanisms to your vault
                    </p>
                  </div>
                  <Switch 
                    id="bitcoin-security" 
                    checked={enableBitcoinSecurity} 
                    onCheckedChange={(checked) => {
                      setEnableBitcoinSecurity(checked);
                      setTimeout(() => handleUpdateSettings(), 0);
                    }}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <Label htmlFor="smart-contracts" className="text-sm">Enable Smart Contracts</Label>
                    <p className="text-xs text-muted-foreground">
                      Add support for secure smart contracts and escrow operations
                    </p>
                  </div>
                  <Switch 
                    id="smart-contracts" 
                    checked={enableSmartContracts} 
                    onCheckedChange={(checked) => {
                      setEnableSmartContracts(checked);
                      setTimeout(() => handleUpdateSettings(), 0);
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="auto-lock">Auto-Lock Timeout (minutes)</Label>
                  <span className="text-sm">{autoLockTimeout}</span>
                </div>
                <Slider
                  id="auto-lock"
                  min={1}
                  max={60}
                  step={1}
                  value={[autoLockTimeout]}
                  onValueChange={(value) => setAutoLockTimeout(value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  The vault will automatically lock after this period of inactivity
                </p>
              </div>
              
              <div className="pt-4">
                <Button
                  onClick={handleUpdateSettings}
                  disabled={updatingSettings}
                  className="w-full"
                >
                  {updatingSettings ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Settings className="mr-2 h-4 w-4" />
                  )}
                  {updatingSettings ? 'Updating...' : 'Save Security Settings'}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Data Storage Tab */}
          <TabsContent value="data" className="space-y-4">
            {enableFractalSharding ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Storage Type</Label>
                  <Select
                    value={storageType}
                    onValueChange={(value) => setStorageType(value as VaultStorageType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select storage type" />
                    </SelectTrigger>
                    <SelectContent>
                      {storageTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span>{option.label}</span>
                            <span className="text-xs text-muted-foreground">{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Storage Allocation</CardTitle>
                    <CardDescription>
                      Choose how your data is distributed across storage types
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="local-storage" className="text-sm">Local Storage</Label>
                        <span className="text-sm">{localStoragePercent}%</span>
                      </div>
                      <Slider
                        id="local-storage"
                        min={0}
                        max={100}
                        step={5}
                        value={[localStoragePercent]}
                        onValueChange={(value) => {
                          setLocalStoragePercent(value[0]);
                          // Adjust other percentages to ensure total is 100%
                          const remaining = 100 - value[0];
                          if (hardwareWalletPercent + networkDistributionPercent > 0) {
                            const ratio = hardwareWalletPercent / (hardwareWalletPercent + networkDistributionPercent);
                            setHardwareWalletPercent(Math.round(remaining * ratio));
                            setNetworkDistributionPercent(Math.round(remaining * (1 - ratio)));
                          } else {
                            setHardwareWalletPercent(Math.round(remaining / 2));
                            setNetworkDistributionPercent(Math.round(remaining / 2));
                          }
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="hardware-wallet" className="text-sm">Hardware Wallet</Label>
                        <span className="text-sm">{hardwareWalletPercent}%</span>
                      </div>
                      <Slider
                        id="hardware-wallet"
                        min={0}
                        max={100}
                        step={5}
                        value={[hardwareWalletPercent]}
                        onValueChange={(value) => {
                          setHardwareWalletPercent(value[0]);
                          // Adjust other percentages to ensure total is 100%
                          const remaining = 100 - value[0] - localStoragePercent;
                          setNetworkDistributionPercent(Math.max(0, remaining));
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="network-distribution" className="text-sm">Network Distribution</Label>
                        <span className="text-sm">{networkDistributionPercent}%</span>
                      </div>
                      <Slider
                        id="network-distribution"
                        min={0}
                        max={100}
                        step={5}
                        value={[networkDistributionPercent]}
                        onValueChange={(value) => {
                          setNetworkDistributionPercent(value[0]);
                          // Adjust other percentages to ensure total is 100%
                          const remaining = 100 - value[0] - localStoragePercent;
                          setHardwareWalletPercent(Math.max(0, remaining));
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="redundancy-factor" className="text-sm">Redundancy Factor</Label>
                        <span className="text-sm">{redundancyFactor}x</span>
                      </div>
                      <Slider
                        id="redundancy-factor"
                        min={1}
                        max={5}
                        step={1}
                        value={[redundancyFactor]}
                        onValueChange={(value) => setRedundancyFactor(value[0])}
                      />
                      <p className="text-xs text-muted-foreground">
                        Higher redundancy means more copies of your data are stored across the network
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="pt-2">
                  <Button
                    onClick={handleUpdateSettings}
                    disabled={updatingSettings}
                    className="w-full"
                  >
                    {updatingSettings ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Settings className="mr-2 h-4 w-4" />
                    )}
                    {updatingSettings ? 'Updating...' : 'Save Storage Settings'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Fractal Sharding Not Enabled</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                  Enable Fractal Sharding in the Security Settings tab to access advanced
                  storage distribution features.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEnableFractalSharding(true);
                    handleUpdateSettings();
                  }}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Enable Fractal Sharding
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Smart Contracts Tab */}
          <TabsContent value="contracts" className="space-y-4">
            {enableSmartContracts ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Smart Contracts</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <FileCode2 className="mr-2 h-4 w-4" />
                        New Contract
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Smart Contract</DialogTitle>
                        <DialogDescription>
                          Select the type of smart contract to create
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-1 gap-4 py-4">
                        {contractTemplates.map((template) => (
                          <Button
                            key={template.type}
                            variant="outline"
                            className="justify-start h-auto py-3"
                            onClick={() => {
                              handleCreateContract(template.type);
                              document.querySelector('[data-state="open"]')?.dispatchEvent(
                                new KeyboardEvent('keydown', { key: 'Escape' })
                              );
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">{template.icon}</div>
                              <div className="text-left">
                                <div className="font-medium">{template.name}</div>
                                <div className="text-xs text-muted-foreground">{template.description}</div>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {loadingContracts ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : contracts.length > 0 ? (
                  <div className="space-y-2">
                    <Accordion type="single" collapsible className="w-full">
                      {contracts.map((contract, index) => (
                        <AccordionItem key={contract.id} value={`contract-${index}`}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center space-x-3">
                                {contract.type === ContractType.ESCROW && <Share2 className="h-4 w-4" />}
                                {contract.type === ContractType.LLM_TRAINING && <Newspaper className="h-4 w-4" />}
                                {contract.type === ContractType.QUANTUM_PROCESSING && <Server className="h-4 w-4" />}
                                {contract.type === ContractType.STORAGE_ALLOCATION && <Database className="h-4 w-4" />}
                                <span>{contract.type} Contract</span>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${getContractStatusColor(contract.status)}`}>
                                {contract.status}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 px-2">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-muted-foreground">Created</div>
                                <div>{new Date(contract.createdAt).toLocaleString()}</div>
                                
                                <div className="text-muted-foreground">Value</div>
                                <div>{contract.terms.value} SING</div>
                                
                                <div className="text-muted-foreground">Duration</div>
                                <div>{Math.floor(contract.terms.duration / 86400)} days</div>
                                
                                <div className="text-muted-foreground">Parties</div>
                                <div>{contract.parties.length}</div>
                              </div>
                              
                              <div className="flex space-x-2 pt-2">
                                {contract.status === ContractStatus.DRAFT && (
                                  <Button size="sm" variant="default">
                                    Activate
                                  </Button>
                                )}
                                {contract.status === ContractStatus.ACTIVE && (
                                  <Button size="sm" variant="default">
                                    Complete
                                  </Button>
                                )}
                                {(contract.status === ContractStatus.DRAFT || contract.status === ContractStatus.ACTIVE) && (
                                  <Button size="sm" variant="outline">
                                    Cancel
                                  </Button>
                                )}
                                <Button size="sm" variant="outline">
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <FileCode2 className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Smart Contracts</h3>
                      <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                        You haven't created any smart contracts yet. Create a new contract to get started.
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <FileCode2 className="mr-2 h-4 w-4" />
                            Create First Contract
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Smart Contract</DialogTitle>
                            <DialogDescription>
                              Select the type of smart contract to create
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-1 gap-4 py-4">
                            {contractTemplates.map((template) => (
                              <Button
                                key={template.type}
                                variant="outline"
                                className="justify-start h-auto py-3"
                                onClick={() => {
                                  handleCreateContract(template.type);
                                  document.querySelector('[data-state="open"]')?.dispatchEvent(
                                    new KeyboardEvent('keydown', { key: 'Escape' })
                                  );
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5">{template.icon}</div>
                                  <div className="text-left">
                                    <div className="font-medium">{template.name}</div>
                                    <div className="text-xs text-muted-foreground">{template.description}</div>
                                  </div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileCode2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Smart Contracts Not Enabled</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                  Enable Smart Contracts in the Security Settings tab to create and manage
                  secure contracts for escrow, data training, and more.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEnableSmartContracts(true);
                    handleUpdateSettings();
                  }}
                >
                  <FileCode2 className="mr-2 h-4 w-4" />
                  Enable Smart Contracts
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-xs text-muted-foreground flex items-center">
          <ShieldCheck className="h-3 w-3 inline-block mr-1" />
          Secured with quantum-resistant encryption
        </div>
        {enableBitcoinSecurity && (
          <div className="text-xs text-muted-foreground flex items-center">
            <Bitcoin className="h-3 w-3 inline-block mr-1" />
            Bitcoin-level security active
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
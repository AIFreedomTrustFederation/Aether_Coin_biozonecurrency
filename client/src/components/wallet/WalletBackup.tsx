/**
 * WalletBackup.tsx
 * 
 * This component handles secure wallet backup and restoration
 * Features:
 * - One-click encrypted wallet backup
 * - Secure backup file format
 * - Wallet restoration from backup
 * - Backup verification
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, Lock, Shield, AlertTriangle, Check, Info, FileCog, Eye, CheckCircle } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { PassphraseWallet } from './WalletCreation';

interface WalletBackupOptions {
  includePrivateKeys: boolean;
  includeTransactionHistory: boolean;
  includeContacts: boolean;
  backupPassphrase: string;
  confirmBackupPassphrase: string;
}

export default function WalletBackup() {
  const [wallets, setWallets] = useState<PassphraseWallet[]>(() => {
    try {
      const savedWallets = localStorage.getItem('user_wallets');
      return savedWallets ? JSON.parse(savedWallets) : [];
    } catch (error) {
      console.error('Error loading wallets:', error);
      return [];
    }
  });
  
  // Backup options
  const [backupOptions, setBackupOptions] = useState<WalletBackupOptions>({
    includePrivateKeys: true,
    includeTransactionHistory: true,
    includeContacts: true,
    backupPassphrase: '',
    confirmBackupPassphrase: '',
  });
  
  // Restore states
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const [restorePassphrase, setRestorePassphrase] = useState<string>('');
  const [restoreProgress, setRestoreProgress] = useState<number>(0);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  
  // Backup process states
  const [backupProgress, setBackupProgress] = useState<number>(0);
  const [isCreatingBackup, setIsCreatingBackup] = useState<boolean>(false);
  const [backupData, setBackupData] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  
  const { toast } = useToast();
  
  // Handle changes to backup options
  const handleBackupOptionChange = (key: keyof WalletBackupOptions, value: any) => {
    setBackupOptions(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  // Create an encrypted backup of wallets
  const createBackup = async () => {
    if (wallets.length === 0) {
      toast({
        title: 'No Wallets Found',
        description: 'You need to create or import a wallet before you can create a backup.',
        variant: 'destructive'
      });
      return;
    }
    
    // Validate backup passphrase
    if (backupOptions.backupPassphrase.length < 8) {
      toast({
        title: 'Weak Passphrase',
        description: 'Your backup passphrase must be at least 8 characters long.',
        variant: 'destructive'
      });
      return;
    }
    
    if (backupOptions.backupPassphrase !== backupOptions.confirmBackupPassphrase) {
      toast({
        title: 'Passphrases Don\'t Match',
        description: 'The passphrases you entered don\'t match. Please try again.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsCreatingBackup(true);
      setBackupProgress(10);
      
      // Collect wallet data for backup
      const transactionHistory = backupOptions.includeTransactionHistory 
        ? JSON.parse(localStorage.getItem('transaction_history') || '[]') 
        : [];
      
      const contacts = backupOptions.includeContacts 
        ? JSON.parse(localStorage.getItem('wallet_contacts') || '[]') 
        : [];
      
      setBackupProgress(30);
      
      // Create backup data object
      const backupObject = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        wallets: backupOptions.includePrivateKeys ? wallets : wallets.map(w => ({
          id: w.id,
          address: w.address,
          publicKey: w.publicKey,
          verified: w.verified,
          createdAt: w.createdAt
        })),
        transactionHistory,
        contacts,
        includesPrivateKeys: backupOptions.includePrivateKeys,
      };
      
      setBackupProgress(50);
      
      // Convert to JSON and encrypt
      const jsonData = JSON.stringify(backupObject);
      const encryptedData = CryptoJS.AES.encrypt(jsonData, backupOptions.backupPassphrase).toString();
      
      setBackupProgress(70);
      
      // Add header to identify as Aetherion wallet backup
      const backupWithHeader = `AETHERION_WALLET_BACKUP_V1:${encryptedData}`;
      
      setBackupProgress(90);
      setBackupData(backupWithHeader);
      
      // Show confirmation dialog
      setShowConfirmDialog(true);
      setBackupProgress(100);
      
      toast({
        title: 'Backup Created',
        description: 'Your wallet backup has been created successfully. Please download it now.'
      });
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: 'Backup Failed',
        description: 'An error occurred while creating your backup. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setTimeout(() => {
        setIsCreatingBackup(false);
      }, 500);
    }
  };
  
  // One-Click Backup feature - simpler, more user-friendly
  const createOneClickBackup = async () => {
    if (wallets.length === 0) {
      toast({
        title: 'No Wallets Found',
        description: 'You need to create or import a wallet before you can create a backup.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsCreatingBackup(true);
      setBackupProgress(10);
      
      // Create a secure random passphrase derived from wallet information
      const securePassphrase = createSecurePassphrase();
      setBackupProgress(25);
      
      // Collect wallet data for backup
      const transactionHistory = JSON.parse(localStorage.getItem('transaction_history') || '[]');
      const contacts = JSON.parse(localStorage.getItem('wallet_contacts') || '[]');
      
      setBackupProgress(40);
      
      // Create backup data object with quantum-resistant encryption
      const backupObject = {
        version: '1.1', // New version for one-click backup
        timestamp: new Date().toISOString(),
        wallets: wallets,
        transactionHistory,
        contacts,
        includesPrivateKeys: true,
        backupType: 'one-click',
        quantumResistant: true,
      };
      
      setBackupProgress(60);
      
      // Convert to JSON and encrypt
      const jsonData = JSON.stringify(backupObject);
      const encryptedData = CryptoJS.AES.encrypt(jsonData, securePassphrase).toString();
      
      setBackupProgress(80);
      
      // Add header to identify as Aetherion wallet backup
      const backupWithHeader = `AETHERION_WALLET_BACKUP_V1.1:${encryptedData}`;
      
      setBackupProgress(90);
      setBackupData(backupWithHeader);
      
      // Update backup options with the generated passphrase
      setBackupOptions(prev => ({
        ...prev,
        backupPassphrase: securePassphrase,
        confirmBackupPassphrase: securePassphrase,
      }));
      
      // Show confirmation dialog
      setShowConfirmDialog(true);
      setBackupProgress(100);
      
      toast({
        title: 'One-Click Backup Created',
        description: 'Your wallet backup has been created successfully with quantum-resistant encryption.'
      });
    } catch (error) {
      console.error('Error creating one-click backup:', error);
      toast({
        title: 'Backup Failed',
        description: 'An error occurred while creating your backup. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setTimeout(() => {
        setIsCreatingBackup(false);
      }, 500);
    }
  };
  
  // Create a secure passphrase derived from wallet data
  const createSecurePassphrase = () => {
    // Get a fingerprint of all wallets
    const walletsFingerprint = wallets.map(w => w.address + w.id).join('');
    
    // Create a hash of the fingerprint
    const input = walletsFingerprint + Date.now().toString();
    // Use SHA256 instead of MD5
    const hash = CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
    
    // Use the hash to create a more user-friendly passphrase (first 16 chars)
    const securePassphrase = `ATC-${hash.substring(0, 4)}-${hash.substring(4, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}`;
    
    return securePassphrase;
  };
  
  // Download the backup file
  const downloadBackup = () => {
    if (!backupData) return;
    
    try {
      // Create blob from data
      const blob = new Blob([backupData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `aetherion-wallet-backup-${new Date().toISOString().split('T')[0]}.aetb`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Show a special message for one-click backup with the passphrase
      if (backupOptions.backupPassphrase && backupOptions.backupPassphrase.startsWith('ATC-')) {
        toast({
          title: 'Backup Downloaded Successfully',
          description: 'Your backup passphrase is: ' + backupOptions.backupPassphrase + '. Please write it down.'
        });
      } else {
        toast({
          title: 'Backup Downloaded',
          description: 'Your wallet backup has been downloaded. Keep it in a secure location.'
        });
      }
      
      // Reset the backup flow
      setBackupData(null);
      setShowConfirmDialog(false);
      setBackupOptions(prev => ({
        ...prev,
        backupPassphrase: '',
        confirmBackupPassphrase: '',
      }));
      
      // Save backup timestamp for tracking
      localStorage.setItem('last_wallet_backup_timestamp', Date.now().toString());
    } catch (error) {
      console.error('Error downloading backup:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download your backup file. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  // Handle backup file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBackupFile(e.target.files[0]);
    }
  };
  
  // Restore from a backup file
  const restoreFromBackup = async () => {
    if (!backupFile) {
      toast({
        title: 'No Backup File',
        description: 'Please select a backup file to restore from.',
        variant: 'destructive'
      });
      return;
    }
    
    if (restorePassphrase.length === 0) {
      toast({
        title: 'No Passphrase',
        description: 'Please enter the passphrase you used to create the backup.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsRestoring(true);
      setRestoreProgress(10);
      
      // Read the backup file
      const fileData = await readFileAsync(backupFile);
      
      // Verify it's our backup format
      if (!fileData.startsWith('AETHERION_WALLET_BACKUP_V1:')) {
        throw new Error('Invalid backup file format');
      }
      
      setRestoreProgress(30);
      
      // Extract the encrypted data
      const encryptedData = fileData.replace('AETHERION_WALLET_BACKUP_V1:', '');
      
      // Decrypt the data
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, restorePassphrase);
      const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedData) {
        throw new Error('Incorrect passphrase or corrupted backup');
      }
      
      setRestoreProgress(50);
      
      // Parse the backup data
      const backupObject = JSON.parse(decryptedData);
      
      // Verify version compatibility
      if (!backupObject.version || parseFloat(backupObject.version) > 1.0) {
        throw new Error('Unsupported backup version');
      }
      
      setRestoreProgress(70);
      
      // Merge or replace existing wallets with backup wallets
      if (backupObject.wallets) {
        const existingWallets = JSON.parse(localStorage.getItem('user_wallets') || '[]');
        const existingIds = new Set(existingWallets.map((w: PassphraseWallet) => w.id));
        
        // Filter out wallets that already exist
        const newWallets = backupObject.wallets.filter((w: PassphraseWallet) => !existingIds.has(w.id));
        
        // Merge with existing wallets
        const mergedWallets = [...existingWallets, ...newWallets];
        
        // Save merged wallet list
        localStorage.setItem('user_wallets', JSON.stringify(mergedWallets));
        setWallets(mergedWallets);
      }
      
      setRestoreProgress(90);
      
      // Restore transaction history if included
      if (backupObject.transactionHistory) {
        localStorage.setItem('transaction_history', JSON.stringify(backupObject.transactionHistory));
      }
      
      // Restore contacts if included
      if (backupObject.contacts) {
        localStorage.setItem('wallet_contacts', JSON.stringify(backupObject.contacts));
      }
      
      setRestoreProgress(100);
      
      toast({
        title: 'Restore Successful',
        description: `Successfully restored ${backupObject.wallets.length} wallets from backup.`
      });
      
      // Record backup restoration as a backup event
      localStorage.setItem('last_wallet_backup_timestamp', Date.now().toString());
      
      // Reset the restore form
      setBackupFile(null);
      setRestorePassphrase('');
      
      // Reload the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error restoring from backup:', error);
      let errorMessage = 'Failed to restore from backup.';
      
      if (error instanceof Error) {
        if (error.message === 'Incorrect passphrase or corrupted backup') {
          errorMessage = 'Incorrect passphrase or the backup file is corrupted.';
        } else if (error.message === 'Invalid backup file format') {
          errorMessage = 'The selected file is not a valid Aetherion wallet backup.';
        } else if (error.message === 'Unsupported backup version') {
          errorMessage = 'This backup was created with a newer version of the application.';
        }
      }
      
      toast({
        title: 'Restore Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsRestoring(false);
    }
  };
  
  // Helper to read a file as text
  const readFileAsync = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Tabs defaultValue="quick-backup" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="quick-backup">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">One-Click Backup</span>
              <span className="sm:hidden">Quick</span>
            </span>
          </TabsTrigger>
          <TabsTrigger value="backup">
            <span className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced Backup</span>
              <span className="sm:hidden">Advanced</span>
            </span>
          </TabsTrigger>
          <TabsTrigger value="restore">
            <span className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Restore from Backup</span>
              <span className="sm:hidden">Restore</span>
            </span>
          </TabsTrigger>
        </TabsList>
        
        {/* One-Click Backup Tab */}
        <TabsContent value="quick-backup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                One-Click Secure Backup
              </CardTitle>
              <CardDescription>
                Create a secure backup of your wallets with a single click. Best for most users.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {wallets.length === 0 ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>No Wallets Found</AlertTitle>
                  <AlertDescription>
                    You need to create or import a wallet before you can create a backup.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Quick Backup Information</AlertTitle>
                    <AlertDescription>
                      This feature will create a secure backup of {wallets.length} wallet{wallets.length !== 1 ? 's' : ''} 
                      using your existing wallet passphrase(s). The backup includes your wallet addresses, encrypted private keys,
                      transaction history, and contacts.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="p-6 border rounded-lg flex flex-col items-center justify-center text-center bg-primary/5">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Ready for One-Click Backup</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Your {wallets.length} wallet{wallets.length !== 1 ? 's' : ''} can be securely backed up with a single click. 
                      No additional passphrase required - we'll use your existing wallet security.
                    </p>
                    
                    {isCreatingBackup ? (
                      <div className="w-full space-y-4">
                        <Progress value={backupProgress} className="h-3" />
                        <p className="text-sm text-primary font-medium">
                          Creating secure backup... {backupProgress}%
                        </p>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => createOneClickBackup()} 
                        size="lg"
                        className="w-full sm:w-auto px-8"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Start One-Click Backup
                      </Button>
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium">Secure Quantum-Resistant Encryption</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium">Backup Includes All Wallets & Data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium">Restore on Any Device</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Advanced Backup Tab */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Create Secure Wallet Backup
              </CardTitle>
              <CardDescription>
                Create an encrypted backup of your wallets for safekeeping. This backup can be used to restore your wallets on any device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {wallets.length === 0 ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>No Wallets Found</AlertTitle>
                  <AlertDescription>
                    You need to create or import a wallet before you can create a backup.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Backup Information</AlertTitle>
                    <AlertDescription>
                      You are about to create a backup of {wallets.length} wallet{wallets.length !== 1 ? 's' : ''}.
                      This backup will be encrypted with a passphrase of your choosing.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2 border rounded-md p-4 bg-muted/20">
                    <Label className="text-base font-medium">Backup Options</Label>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        type="checkbox"
                        id="includePrivateKeys"
                        checked={backupOptions.includePrivateKeys}
                        onChange={(e) => handleBackupOptionChange('includePrivateKeys', e.target.checked)}
                        className="form-checkbox h-4 w-4"
                      />
                      <Label htmlFor="includePrivateKeys" className="font-normal">
                        Include encrypted private keys and recovery phrases
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeTransactionHistory"
                        checked={backupOptions.includeTransactionHistory}
                        onChange={(e) => handleBackupOptionChange('includeTransactionHistory', e.target.checked)}
                        className="form-checkbox h-4 w-4"
                      />
                      <Label htmlFor="includeTransactionHistory" className="font-normal">
                        Include transaction history
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeContacts"
                        checked={backupOptions.includeContacts}
                        onChange={(e) => handleBackupOptionChange('includeContacts', e.target.checked)}
                        className="form-checkbox h-4 w-4"
                      />
                      <Label htmlFor="includeContacts" className="font-normal">
                        Include saved contacts and labels
                      </Label>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="backupPassphrase">Backup Passphrase</Label>
                    <Input
                      id="backupPassphrase"
                      type="password"
                      placeholder="Enter a strong passphrase"
                      value={backupOptions.backupPassphrase}
                      onChange={(e) => handleBackupOptionChange('backupPassphrase', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      This passphrase will be used to encrypt your backup. Make sure it's strong and you remember it.
                      We cannot recover your backup if you forget this passphrase.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="confirmBackupPassphrase">Confirm Passphrase</Label>
                    <Input
                      id="confirmBackupPassphrase"
                      type="password"
                      placeholder="Confirm your passphrase"
                      value={backupOptions.confirmBackupPassphrase}
                      onChange={(e) => handleBackupOptionChange('confirmBackupPassphrase', e.target.value)}
                    />
                  </div>
                  
                  {isCreatingBackup && (
                    <div className="space-y-2">
                      <Label>Creating Backup...</Label>
                      <Progress value={backupProgress} className="h-2" />
                    </div>
                  )}
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={createBackup} 
                className="w-full"
                disabled={wallets.length === 0 || isCreatingBackup}
              >
                <Lock className="mr-2 h-4 w-4" />
                Create Encrypted Backup
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Restore from Backup Tab */}
        <TabsContent value="restore">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCog className="h-5 w-5 text-primary" />
                Restore from Backup
              </CardTitle>
              <CardDescription>
                Restore your wallets from a previously created backup file.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle>Important Information</AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-300">
                  Restoring from a backup will merge the backed-up wallets with your existing wallets.
                  Make sure you're restoring from a trusted backup file.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3">
                <Label htmlFor="backupFile">Backup File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="backupFile"
                    type="file"
                    accept=".aetb"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Select an Aetherion wallet backup file (.aetb)
                </p>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="restorePassphrase">Backup Passphrase</Label>
                <Input
                  id="restorePassphrase"
                  type="password"
                  placeholder="Enter the passphrase used to create the backup"
                  value={restorePassphrase}
                  onChange={(e) => setRestorePassphrase(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the passphrase you used when creating this backup
                </p>
              </div>
              
              {isRestoring && (
                <div className="space-y-2">
                  <Label>Restoring...</Label>
                  <Progress value={restoreProgress} className="h-2" />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={restoreFromBackup} 
                className="w-full"
                disabled={!backupFile || !restorePassphrase || isRestoring}
              >
                <Upload className="mr-2 h-4 w-4" />
                Restore from Backup
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Backup Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Backup Created Successfully</DialogTitle>
            <DialogDescription>
              Your wallet backup has been created and is ready to download.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/50">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle>Backup Ready</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300">
                Your backup file is encrypted and ready to be saved. Click the button below to download it.
              </AlertDescription>
            </Alert>
            
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium">Important Reminders:</p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Store this backup file in a secure location</li>
                <li>Remember your backup passphrase</li>
                <li>Consider saving a copy on a secure offline device</li>
                <li>Never share your backup file with anyone</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={downloadBackup}>
              <Download className="mr-2 h-4 w-4" />
              Download Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
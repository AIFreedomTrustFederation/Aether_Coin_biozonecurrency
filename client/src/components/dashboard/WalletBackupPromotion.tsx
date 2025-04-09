import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Download, CheckCircle } from 'lucide-react';
import { Link } from 'wouter';

/**
 * A promotional component that encourages users to create a secure wallet backup
 * Displays on the dashboard if no recent backup has been detected
 */
const WalletBackupPromotion = () => {
  const [hasBackup, setHasBackup] = useState<boolean>(false);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);
  
  // Check if user has ever created a backup
  useEffect(() => {
    try {
      const backupTimestamp = localStorage.getItem('last_wallet_backup_timestamp');
      if (backupTimestamp) {
        setHasBackup(true);
        setLastBackupDate(new Date(parseInt(backupTimestamp)).toLocaleDateString());
      }
    } catch (error) {
      console.error('Error checking backup status:', error);
    }
  }, []);
  
  // If user already has a backup, show a different message
  if (hasBackup) {
    return (
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="bg-green-100 dark:bg-green-800/30 p-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-medium text-green-700 dark:text-green-300">Wallet Backup Secured</h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                Last backup: {lastBackupDate}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/wallet?tab=backup-restore">
            <Button variant="outline" size="sm" className="w-full text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/50 hover:bg-green-100 dark:hover:bg-green-800/30">
              <Download className="h-4 w-4 mr-2" /> Create New Backup
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 dark:bg-amber-800/30 p-2 rounded-full">
            <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-medium text-amber-700 dark:text-amber-300">Secure Your Wallet</h3>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Create an encrypted backup of your wallet to prevent loss of access.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href="/wallet?tab=backup-restore">
          <Button className="w-full bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 text-white">
            <Download className="h-4 w-4 mr-2" /> One-Click Secure Backup
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default WalletBackupPromotion;
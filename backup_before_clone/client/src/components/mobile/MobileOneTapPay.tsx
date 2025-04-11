import React, { useState } from 'react';
import { 
  Gift, Send, Wallet, Landmark, QrCode, Shield, 
  ArrowRight, Check, RefreshCw
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { useLiveMode } from '../../contexts/LiveModeContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Sample wallet data (would normally come from API/context)
const wallets = [
  { id: 1, name: 'Ethereum Wallet', chain: 'ethereum', symbol: 'ETH', balance: '1.45', address: '0x8f4...3b2f', dollarValue: 4350 },
  { id: 2, name: 'Bitcoin Wallet', chain: 'bitcoin', symbol: 'BTC', balance: '0.12', address: 'bc1q...v98r', dollarValue: 8400 },
  { id: 3, name: 'Solana Wallet', chain: 'solana', symbol: 'SOL', balance: '25.3', address: 'SoL...x7G9', dollarValue: 2530 },
  { id: 4, name: 'Aetherion Quantum', chain: 'aetherion', symbol: 'AET', balance: '150.0', address: 'qAet...z8P3', dollarValue: 3000 },
];

// Sample contacts (would normally come from API/context)
const recentContacts = [
  { id: 1, name: 'Alice Johnson', address: '0x1d8...4f2e', avatar: '/avatars/alice.jpg' },
  { id: 2, name: 'Bob Smith', address: '0x7c3...9a1d', avatar: '/avatars/bob.jpg' },
  { id: 3, name: 'Carol Williams', address: '0x4e9...2b5c', avatar: '/avatars/carol.jpg' }
];

const MobileOneTapPay = () => {
  const [paymentType, setPaymentType] = useState<'send' | 'gift'>('send');
  const [selectedWallet, setSelectedWallet] = useState<number>(1);
  const [amount, setAmount] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [step, setStep] = useState<number>(1);
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const { toast } = useToast();
  const { isLiveMode } = useLiveMode();

  // Current selected wallet
  const currentWallet = wallets.find(w => w.id === selectedWallet);

  // Submit payment handler
  const handleSubmitPayment = () => {
    if (!amount || !recipient) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Check amount is valid
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than zero.",
        variant: "destructive",
      });
      return;
    }
    
    // Check balance is sufficient
    const walletBalance = parseFloat(currentWallet?.balance || '0');
    if (amountNum > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: `Your ${currentWallet?.symbol} balance is too low for this transaction.`,
        variant: "destructive",
      });
      return;
    }
    
    // Proceed to confirmation step
    setStep(2);
  };
  
  // Process payment (would normally connect to blockchain)
  const processPayment = () => {
    setProcessingPayment(true);
    
    // Simulate blockchain transaction
    setTimeout(() => {
      setProcessingPayment(false);
      setPaymentSuccess(true);
      
      // Show success toast
      toast({
        title: "Payment Successful",
        description: `${amount} ${currentWallet?.symbol} ${paymentType === 'gift' ? 'gifted' : 'sent'} successfully.`,
        variant: "default",
      });
      
      // Reset after 2 seconds
      setTimeout(() => {
        resetForm();
      }, 2000);
    }, 2500);
  };
  
  // Reset form to initial state
  const resetForm = () => {
    setStep(1);
    setAmount('');
    setRecipient('');
    setRecipientName('');
    setPaymentSuccess(false);
  };
  
  // Select contact handler
  const handleSelectContact = (contact: typeof recentContacts[0]) => {
    setRecipient(contact.address);
    setRecipientName(contact.name);
  };

  return (
    <div className="space-y-4">
      {step === 1 && (
        <>
          {/* Payment Type Selection */}
          <div className="flex gap-2 mb-4">
            <Button 
              variant={paymentType === 'send' ? "default" : "outline"} 
              onClick={() => setPaymentType('send')}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
            <Button 
              variant={paymentType === 'gift' ? "default" : "outline"} 
              onClick={() => setPaymentType('gift')}
              className="flex-1"
            >
              <Gift className="h-4 w-4 mr-2" />
              Gift
            </Button>
          </div>
          
          {/* Wallet Selection */}
          <div className="space-y-2">
            <Label htmlFor="wallet-select">Source Wallet</Label>
            <Select value={selectedWallet.toString()} onValueChange={(v) => setSelectedWallet(parseInt(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Select wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map(wallet => (
                  <SelectItem key={wallet.id} value={wallet.id.toString()}>
                    <div className="flex items-center">
                      <span>{wallet.name} ({wallet.symbol})</span>
                      <Badge variant="outline" className="ml-2">
                        {wallet.balance} {wallet.symbol}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <Button 
                variant="ghost" 
                onClick={() => currentWallet && setAmount(currentWallet.balance)}
                className="whitespace-nowrap"
              >
                Max
              </Button>
            </div>
            {currentWallet && (
              <p className="text-xs text-muted-foreground mt-1">
                Available: {currentWallet.balance} {currentWallet.symbol} (${currentWallet.dollarValue})
              </p>
            )}
          </div>
          
          {/* Recipient Input */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient {paymentType === 'gift' ? '(Optional)' : ''}</Label>
            <div className="flex gap-2">
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={paymentType === 'gift' ? 'Address or leave blank for QR' : 'Address or ENS name'}
              />
              <Button variant="outline" size="icon">
                <QrCode className="h-4 w-4" />
              </Button>
            </div>
            {recipientName && (
              <p className="text-xs text-primary mt-1">
                {recipientName}
              </p>
            )}
          </div>
          
          {/* Recent Contacts */}
          <div className="space-y-2 mt-4">
            <Label>Recent Contacts</Label>
            <ScrollArea className="h-20 w-full">
              <div className="flex gap-2 py-2">
                {recentContacts.map(contact => (
                  <Button 
                    key={contact.id} 
                    variant="outline" 
                    className="flex flex-col items-center py-2 h-auto"
                    onClick={() => handleSelectContact(contact)}
                  >
                    <Avatar className="h-8 w-8 mb-1">
                      <AvatarImage src={contact.avatar} alt={contact.name} />
                      <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs whitespace-nowrap">{contact.name}</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Quantum Security Badge */}
          <div className="flex items-center justify-between py-2 px-3 bg-primary/5 rounded-md mt-4">
            <div className="flex items-center">
              <Shield className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm font-medium">Quantum Security</span>
            </div>
            <Badge variant="outline" className="bg-primary/10">
              Enabled
            </Badge>
          </div>
          
          {/* Submit Button */}
          <Button 
            className="w-full mt-4" 
            onClick={handleSubmitPayment}
            disabled={!amount || (!recipient && paymentType !== 'gift')}
          >
            {paymentType === 'send' ? 'Send Payment' : 'Create Gift'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </>
      )}
      
      {step === 2 && (
        <Card>
          <CardContent className="pt-6 pb-4 space-y-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              {processingPayment ? (
                <>
                  <RefreshCw className="h-12 w-12 text-primary animate-spin" />
                  <h3 className="text-lg font-medium">Processing Payment...</h3>
                  <p className="text-sm text-center text-muted-foreground">
                    Your transaction is being processed with quantum security verification.
                  </p>
                </>
              ) : paymentSuccess ? (
                <>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium">Payment Successful!</h3>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Transaction has been submitted to the blockchain.
                    </p>
                    <p className="text-sm font-medium mt-2">
                      {amount} {currentWallet?.symbol} {paymentType === 'gift' ? 'gifted' : 'sent'} successfully
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-full space-y-4">
                    <h3 className="text-lg font-medium text-center">Confirm {paymentType === 'send' ? 'Payment' : 'Gift'}</h3>
                    
                    <div className="space-y-3 bg-muted/30 p-4 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Wallet:</span>
                        <span className="text-sm font-medium">{currentWallet?.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Amount:</span>
                        <span className="text-sm font-medium">{amount} {currentWallet?.symbol}</span>
                      </div>
                      {recipient && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Recipient:</span>
                          <span className="text-sm font-medium truncate max-w-[200px]">
                            {recipientName || recipient}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Estimated Fee:</span>
                        <span className="text-sm font-medium">0.001 {currentWallet?.symbol}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Security Level:</span>
                        <Badge variant="outline" className="bg-primary/10">
                          Quantum Verified
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                        Cancel
                      </Button>
                      <Button className="flex-1" onClick={processPayment}>
                        Confirm
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MobileOneTapPay;
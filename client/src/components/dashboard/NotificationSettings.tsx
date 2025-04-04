import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { useToast } from '../../hooks/use-toast';
import { Loader2, CheckCircle, AlertCircle, Send } from 'lucide-react';

interface NotificationPreference {
  id: number;
  userId: number;
  phoneNumber: string | null;
  isPhoneVerified: boolean;
  smsEnabled: boolean;
  transactionAlerts: boolean;
  securityAlerts: boolean;
  priceAlerts: boolean;
  marketingUpdates: boolean;
}

export function NotificationSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for verification code form
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [expectedCode, setExpectedCode] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Get notification preferences
  const { data: preferences, isLoading } = useQuery<NotificationPreference | null>({
    queryKey: ['/api/notification-preferences'],
    retry: false
  });

  // Update notification preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (data: Partial<NotificationPreference>) => 
      apiRequest('/api/notification-preferences', 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notification-preferences'] });
      toast({
        title: "Settings updated",
        description: "Your notification settings have been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: "Could not update notification settings.",
        variant: "destructive",
      });
    }
  });

  // Update phone number mutation
  const updatePhoneMutation = useMutation({
    mutationFn: (data: { phoneNumber: string }) => 
      apiRequest('/api/notification-preferences/phone', 'POST', data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/notification-preferences'] });
      setIsVerifying(true);
      // If we got a verification code in the response (demo mode)
      if (data && data.verificationCode) {
        setExpectedCode(data.verificationCode);
      }
      toast({
        title: "Verification code sent",
        description: "Please check your phone for a verification code.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to send verification",
        description: "Could not send verification code.",
        variant: "destructive",
      });
    }
  });

  // Verify phone number mutation
  const verifyPhoneMutation = useMutation({
    mutationFn: (data: { verificationCode: string, expectedCode: string }) => 
      apiRequest('/api/notification-preferences/verify', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notification-preferences'] });
      setIsVerifying(false);
      setVerificationCode('');
      setExpectedCode(null);
      toast({
        title: "Phone verified",
        description: "Your phone number has been verified successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Verification failed",
        description: "The verification code is incorrect.",
        variant: "destructive",
      });
    }
  });

  // Test SMS mutation
  const testSmsMutation = useMutation({
    mutationFn: () => apiRequest('/api/notification-preferences/test-sms', 'POST', {}),
    onSuccess: () => {
      toast({
        title: "Test message sent",
        description: "A test message has been sent to your phone.",
      });
    },
    onError: (error: any) => {
      // Check for specific error types
      if (error.response?.data?.needsConfiguration) {
        toast({
          title: "SMS service not configured",
          description: "The SMS service is not properly configured.",
          variant: "destructive",
        });
      } else if (error.response?.data?.needsVerification) {
        toast({
          title: "Phone not verified",
          description: "Please verify your phone number to enable SMS notifications.",
          variant: "destructive",
        });
      } else if (error.response?.data?.smsDisabled) {
        toast({
          title: "SMS notifications disabled",
          description: "Please enable SMS notifications in your settings.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to send test message",
          description: "An error occurred while sending the test message.",
          variant: "destructive",
        });
      }
    }
  });

  // Handle toggle changes
  const handleToggle = (field: keyof NotificationPreference, value: boolean) => {
    updatePreferencesMutation.mutate({ [field]: value });
  };

  // Handle phone update
  const handlePhoneUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }
    updatePhoneMutation.mutate({ phoneNumber });
  };

  // Handle verification
  const handleVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || !expectedCode) {
      toast({
        title: "Verification code required",
        description: "Please enter the verification code sent to your phone.",
        variant: "destructive",
      });
      return;
    }
    verifyPhoneMutation.mutate({ 
      verificationCode,
      expectedCode
    });
  };

  const isPhoneVerified = preferences?.isPhoneVerified;
  const isPhoneConfigured = !!preferences?.phoneNumber;
  const isSMSEnabled = preferences?.smsEnabled;

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading notification settings...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="px-3 sm:px-6">
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Configure how and when you receive notifications about your wallet activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-3 sm:px-6">
        {/* Phone Number Configuration */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-medium">SMS Notifications</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Receive notifications via SMS to your mobile phone
              </p>
            </div>
            <Switch 
              checked={isSMSEnabled || false} 
              onCheckedChange={(checked) => handleToggle('smsEnabled', checked)}
              disabled={!isPhoneVerified}
            />
          </div>

          {isPhoneConfigured && isPhoneVerified ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm truncate">
                  Phone verified: {preferences?.phoneNumber}
                </span>
              </div>
              <div className="flex gap-2 mt-1 sm:mt-0">
                <Button
                  onClick={() => setIsVerifying(true)}
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 sm:px-3"
                >
                  Change
                </Button>
                <Button
                  onClick={() => testSmsMutation.mutate()}
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 sm:px-3"
                  disabled={testSmsMutation.isPending || !isSMSEnabled}
                >
                  {testSmsMutation.isPending ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="mr-1 h-3 w-3" />
                  )}
                  Test
                </Button>
              </div>
            </div>
          ) : isVerifying ? (
            <form onSubmit={handleVerification} className="space-y-3 border p-3 rounded-md">
              <div className="space-y-1">
                <Label htmlFor="verify-code">Verification Code</Label>
                <Input
                  id="verify-code"
                  placeholder="Enter the code sent to your phone"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                {expectedCode && (
                  <p className="text-xs text-amber-500">
                    Demo mode: Use verification code {expectedCode}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  disabled={verifyPhoneMutation.isPending || !verificationCode}
                >
                  {verifyPhoneMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Verify
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsVerifying(false);
                    setVerificationCode('');
                    setExpectedCode(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePhoneUpdate} className="space-y-3 border p-3 rounded-md">
              <div className="space-y-1">
                <Label htmlFor="phone-number">Phone Number</Label>
                <Input
                  id="phone-number"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter your phone number with country code, e.g., +1234567890
                </p>
              </div>
              <Button 
                type="submit" 
                disabled={updatePhoneMutation.isPending || !phoneNumber}
              >
                {updatePhoneMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isPhoneConfigured ? "Update Phone" : "Add Phone"}
              </Button>
            </form>
          )}
        </div>

        {/* Alert Types */}
        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-medium">Alert Types</h3>
          <div className="space-y-3 border p-3 rounded-md">
            <div className="flex justify-between items-center">
              <Label htmlFor="transaction-alerts" className="text-sm">Transaction Alerts</Label>
              <Switch 
                id="transaction-alerts" 
                checked={preferences?.transactionAlerts || false} 
                onCheckedChange={(checked) => handleToggle('transactionAlerts', checked)}
              />
            </div>
            <div className="flex justify-between items-center">
              <Label htmlFor="security-alerts" className="text-sm">Security Alerts</Label>
              <Switch 
                id="security-alerts" 
                checked={preferences?.securityAlerts || false} 
                onCheckedChange={(checked) => handleToggle('securityAlerts', checked)}
              />
            </div>
            <div className="flex justify-between items-center">
              <Label htmlFor="price-alerts" className="text-sm">Price Alerts</Label>
              <Switch 
                id="price-alerts" 
                checked={preferences?.priceAlerts || false} 
                onCheckedChange={(checked) => handleToggle('priceAlerts', checked)}
              />
            </div>
            <div className="flex justify-between items-center">
              <Label htmlFor="marketing-updates" className="text-sm">Marketing Updates</Label>
              <Switch 
                id="marketing-updates" 
                checked={preferences?.marketingUpdates || false} 
                onCheckedChange={(checked) => handleToggle('marketingUpdates', checked)}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start px-3 sm:px-6 pb-4">
        <div className="flex items-start sm:items-center text-xs sm:text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4 mr-2 mt-0.5 sm:mt-0 flex-shrink-0" />
          <span>
            {!isPhoneVerified 
              ? "Verify your phone number to enable SMS notifications" 
              : !isSMSEnabled 
                ? "Enable SMS notifications to receive alerts" 
                : "Your SMS notifications are active"}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
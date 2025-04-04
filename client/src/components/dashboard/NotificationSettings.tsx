import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { useToast } from '../../hooks/use-toast';
import { Loader2, CheckCircle, AlertCircle, Send, MessageSquare, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface NotificationPreference {
  id: number;
  userId: number;
  // Phone notification fields
  phoneNumber: string | null;
  isPhoneVerified: boolean;
  smsEnabled: boolean;
  // Matrix notification fields
  matrixId: string | null;
  isMatrixVerified: boolean;
  matrixEnabled: boolean;
  // Alert preferences
  transactionAlerts: boolean;
  securityAlerts: boolean;
  priceAlerts: boolean;
  marketingUpdates: boolean;
  // Service status information
  notificationServices?: {
    smsAvailable: boolean;
    matrixAvailable: boolean;
  };
}

export function NotificationSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for SMS verification
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [expectedCode, setExpectedCode] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // State for Matrix settings
  const [matrixId, setMatrixId] = useState('');
  const [isConfiguringMatrix, setIsConfiguringMatrix] = useState(false);

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

  // Update Matrix ID mutation
  const updateMatrixMutation = useMutation({
    mutationFn: (data: { matrixId: string }) => 
      apiRequest('/api/notification-preferences/matrix', 'POST', data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/notification-preferences'] });
      setIsConfiguringMatrix(false);
      
      toast({
        title: data.isVerified ? "Matrix ID verified" : "Matrix ID saved",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update Matrix ID",
        description: error.response?.data?.message || "Could not update Matrix ID.",
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
  
  // Test Matrix notification
  const testMatrixMutation = useMutation({
    mutationFn: () => apiRequest('/api/notification-preferences/test-matrix', 'POST', {}),
    onSuccess: () => {
      toast({
        title: "Test message sent",
        description: "A test message has been sent to your Matrix account.",
      });
    },
    onError: (error: any) => {
      // Check for specific error types
      if (error.response?.data?.needsConfiguration) {
        toast({
          title: "Matrix service not configured",
          description: "The Matrix service is not properly configured on the server.",
          variant: "destructive",
        });
      } else if (error.response?.data?.needsVerification) {
        toast({
          title: "Matrix ID not verified",
          description: "Please verify your Matrix ID to enable Matrix notifications.",
          variant: "destructive",
        });
      } else if (error.response?.data?.matrixDisabled) {
        toast({
          title: "Matrix notifications disabled",
          description: "Please enable Matrix notifications in your settings.",
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
  
  // Unified test notification
  const testNotificationMutation = useMutation({
    mutationFn: (channel?: string) => 
      apiRequest('/api/notification-preferences/test', 'POST', { channel }),
    onSuccess: (data: any) => {
      const results = data.results || {};
      if (data.success) {
        toast({
          title: "Test notification sent",
          description: `Notification sent successfully through ${Object.entries(results)
            .filter(([_, success]) => success)
            .map(([channel]) => channel === 'sms' ? 'SMS' : 'Matrix')
            .join(' and ')}.`,
        });
      } else {
        toast({
          title: "Test failed",
          description: "Could not send test notification through any channel.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Test failed",
        description: "An error occurred while sending test notifications.",
        variant: "destructive",
      });
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

  // Handle Matrix ID update
  const handleMatrixUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matrixId) {
      toast({
        title: "Matrix ID required",
        description: "Please enter a valid Matrix ID.",
        variant: "destructive",
      });
      return;
    }
    
    // Basic format validation
    if (!matrixId.startsWith('@') || !matrixId.includes(':')) {
      toast({
        title: "Invalid Matrix ID format",
        description: "Matrix ID must be in the format @username:homeserver.org",
        variant: "destructive",
      });
      return;
    }
    
    updateMatrixMutation.mutate({ matrixId });
  };

  const isPhoneVerified = preferences?.isPhoneVerified;
  const isPhoneConfigured = !!preferences?.phoneNumber;
  const isSMSEnabled = preferences?.smsEnabled;
  
  const isMatrixVerified = preferences?.isMatrixVerified;
  const isMatrixConfigured = !!preferences?.matrixId;
  const isMatrixEnabled = preferences?.matrixEnabled;
  
  // Get notification services status
  const notificationServices = preferences?.notificationServices || { 
    smsAvailable: false, 
    matrixAvailable: false 
  };

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
        <Tabs defaultValue="sms" className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="sms">SMS Notifications</TabsTrigger>
            <TabsTrigger value="matrix">Matrix Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sms" className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-medium">SMS Notifications</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Receive notifications via SMS to your mobile phone
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {!notificationServices.smsAvailable && (
                  <div 
                    className="px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs flex items-center"
                    title="The SMS service requires server configuration"
                  >
                    <Info className="h-3 w-3 mr-1" />
                    Service unavailable
                  </div>
                )}
                <Switch 
                  checked={isSMSEnabled || false} 
                  onCheckedChange={(checked) => handleToggle('smsEnabled', checked)}
                  disabled={!isPhoneVerified || !notificationServices.smsAvailable}
                />
              </div>
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
                    disabled={testSmsMutation.isPending || !isSMSEnabled || !notificationServices.smsAvailable}
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
          </TabsContent>
          
          <TabsContent value="matrix" className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-medium">Matrix Notifications</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Receive notifications via Matrix, a secure open-source messaging protocol
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {!notificationServices.matrixAvailable && (
                  <div 
                    className="px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs flex items-center"
                    title="The Matrix service requires server configuration"
                  >
                    <Info className="h-3 w-3 mr-1" />
                    Service unavailable
                  </div>
                )}
                <Switch 
                  checked={isMatrixEnabled || false} 
                  onCheckedChange={(checked) => handleToggle('matrixEnabled', checked)}
                  disabled={!isMatrixVerified || !notificationServices.matrixAvailable}
                />
              </div>
            </div>

            {isMatrixConfigured && isMatrixVerified ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">
                    Matrix ID verified: {preferences?.matrixId}
                  </span>
                </div>
                <div className="flex gap-2 mt-1 sm:mt-0">
                  <Button
                    onClick={() => setIsConfiguringMatrix(true)}
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 sm:px-3"
                  >
                    Change
                  </Button>
                  <Button
                    onClick={() => testMatrixMutation.mutate()}
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 sm:px-3"
                    disabled={testMatrixMutation.isPending || !isMatrixEnabled || !notificationServices.matrixAvailable}
                  >
                    {testMatrixMutation.isPending ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="mr-1 h-3 w-3" />
                    )}
                    Test
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleMatrixUpdate} className="space-y-3 border p-3 rounded-md">
                <div className="space-y-1">
                  <Label htmlFor="matrix-id">Matrix ID</Label>
                  <Input
                    id="matrix-id"
                    placeholder="@username:matrix.org"
                    value={matrixId}
                    onChange={(e) => setMatrixId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your Matrix ID in the format @username:homeserver.org
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button 
                    type="submit" 
                    disabled={updateMatrixMutation.isPending || !matrixId || !notificationServices.matrixAvailable}
                  >
                    {updateMatrixMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isMatrixConfigured ? "Update Matrix ID" : "Add Matrix ID"}
                  </Button>
                  
                  {!notificationServices.matrixAvailable && (
                    <p className="text-xs text-amber-600 flex items-start">
                      <Info className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                      Matrix service is not configured on the server. Please contact administrator.
                    </p>
                  )}
                </div>
              </form>
            )}
          </TabsContent>
        </Tabs>

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
      <CardFooter className="flex flex-col items-start px-3 sm:px-6 pb-4 space-y-2">
        {/* SMS Status */}
        <div className="flex items-start sm:items-center text-xs sm:text-sm text-muted-foreground">
          {isSMSEnabled && isPhoneVerified ? (
            <CheckCircle className="h-4 w-4 mr-2 mt-0.5 sm:mt-0 flex-shrink-0 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 sm:mt-0 flex-shrink-0" />
          )}
          <span>
            SMS Notifications: {
              !notificationServices.smsAvailable 
                ? "Service unavailable (server configuration required)" 
                : !isPhoneVerified 
                  ? "Verify your phone number to enable" 
                  : !isSMSEnabled 
                    ? "Disabled in settings" 
                    : "Active"
            }
          </span>
        </div>
        
        {/* Matrix Status */}
        <div className="flex items-start sm:items-center text-xs sm:text-sm text-muted-foreground">
          {isMatrixEnabled && isMatrixVerified ? (
            <CheckCircle className="h-4 w-4 mr-2 mt-0.5 sm:mt-0 flex-shrink-0 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 sm:mt-0 flex-shrink-0" />
          )}
          <span>
            Matrix Notifications: {
              !notificationServices.matrixAvailable 
                ? "Service unavailable (server configuration required)" 
                : !isMatrixVerified 
                  ? "Add your Matrix ID to enable" 
                  : !isMatrixEnabled 
                    ? "Disabled in settings" 
                    : "Active"
            }
          </span>
        </div>
        
        {/* Combined status for notifications */}
        <div className="flex items-start sm:items-center text-xs sm:text-sm mt-1">
          <Info className="h-4 w-4 mr-2 mt-0.5 sm:mt-0 flex-shrink-0 text-blue-500" />
          <span>
            {(isSMSEnabled && isPhoneVerified) || (isMatrixEnabled && isMatrixVerified)
              ? "You will receive notifications through your enabled channels"
              : "No notification channels are currently active"}
          </span>
        </div>
        
        {/* Test all channels button */}
        {((isSMSEnabled && isPhoneVerified) || (isMatrixEnabled && isMatrixVerified)) && (
          <Button
            onClick={() => testNotificationMutation.mutate()}
            variant="outline"
            size="sm"
            className="mt-2"
            disabled={testNotificationMutation.isPending}
          >
            {testNotificationMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Test All Notification Channels
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
import React, { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Settings, Shield, ClockIcon } from 'lucide-react';
import ChatInterface from './ChatInterface';
import AISettings from './AISettings';
import SecurityHistory from './SecurityHistory';
import TransactionHold from './TransactionHold';
import { AIProvider } from '../contexts/AIContext';
import { AIAssistantProps } from '../types';

/**
 * AIAssistant is the main component that combines the chat interface,
 * transaction escrow system, security history, and AI settings.
 */
const AIAssistant: React.FC<AIAssistantProps> = ({ 
  userId, 
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('chat');
  
  return (
    <AIProvider userId={userId}>
      <Card className={`overflow-hidden border-none shadow-md ${className}`}>
        <CardContent className="p-0">
          <Tabs 
            defaultValue="chat" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="h-[calc(100vh-120px)]"
          >
            <div className="border-b bg-muted/20">
              <TabsList className="bg-transparent h-14 w-full rounded-none justify-center">
                <TabsTrigger 
                  value="chat" 
                  className="flex items-center gap-2 data-[state=active]:bg-background"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="sm:inline hidden">AI Assistant</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="flex items-center gap-2 data-[state=active]:bg-background"
                >
                  <Shield className="h-4 w-4" />
                  <span className="sm:inline hidden">Security</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="hold" 
                  className="flex items-center gap-2 data-[state=active]:bg-background"
                >
                  <ClockIcon className="h-4 w-4" />
                  <span className="sm:inline hidden">Transaction Hold</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="flex items-center gap-2 data-[state=active]:bg-background"
                >
                  <Settings className="h-4 w-4" />
                  <span className="sm:inline hidden">Settings</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="relative flex-1 overflow-hidden h-[calc(100%-3.5rem)]">
              <TabsContent 
                value="chat" 
                className="absolute inset-0 overflow-hidden m-0"
              >
                <ChatInterface 
                  className="h-full" 
                  autoFocus={activeTab === 'chat'}
                  inputPlaceholder="Ask me about your wallet, transactions, or security..."
                />
              </TabsContent>
              
              <TabsContent 
                value="security" 
                className="absolute inset-0 overflow-auto m-0 p-6"
              >
                <SecurityHistory className="h-full" />
              </TabsContent>
              
              <TabsContent 
                value="hold" 
                className="absolute inset-0 overflow-auto m-0 p-6"
              >
                <TransactionHold className="h-full" />
              </TabsContent>
              
              <TabsContent 
                value="settings" 
                className="absolute inset-0 overflow-auto m-0 p-6"
              >
                <AISettings className="h-full" />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </AIProvider>
  );
};

export default AIAssistant;
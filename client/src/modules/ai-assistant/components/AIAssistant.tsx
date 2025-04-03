import React, { useState } from 'react';
import { AIProvider } from '../contexts/AIContext';
import ChatInterface from './ChatInterface';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, ShieldAlert, Clock, Settings, AlertTriangle } from 'lucide-react';
import AISettings from './AISettings';
import SecurityHistory from './SecurityHistory';
import TransactionHold from './TransactionHold';
import { AIAssistantProps } from '../types';

const AIAssistant: React.FC<AIAssistantProps> = ({ userId, className = '' }) => {
  const [activeTab, setActiveTab] = useState('chat');

  // Demo data - in a real app, these would come from the AIContext
  const pendingTransactionCount = 3;
  const unresolvedSecurityIssuesCount = 2;

  return (
    <AIProvider initialConfig={{ userId }}>
      <div className={`flex flex-col ${className}`}>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-[600px] flex flex-col"
            >
              <TabsList className="grid grid-cols-4 rounded-none border-b">
                <TabsTrigger value="chat" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  <div className="flex items-center">
                    <Bot className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Assistant</span>
                  </div>
                </TabsTrigger>
                
                <TabsTrigger value="security" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  <div className="flex items-center">
                    <ShieldAlert className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Security</span>
                    {unresolvedSecurityIssuesCount > 0 && (
                      <Badge variant="warning" className="ml-2 h-5 px-1 bg-orange-500 text-white">
                        {unresolvedSecurityIssuesCount}
                      </Badge>
                    )}
                  </div>
                </TabsTrigger>
                
                <TabsTrigger value="transactions" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Holds</span>
                    {pendingTransactionCount > 0 && (
                      <Badge variant="warning" className="ml-2 h-5 px-1 bg-orange-500 text-white">
                        {pendingTransactionCount}
                      </Badge>
                    )}
                  </div>
                </TabsTrigger>
                
                <TabsTrigger value="settings" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Settings</span>
                  </div>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent
                value="chat"
                className="flex-1 data-[state=active]:flex flex-col overflow-hidden p-0 m-0"
              >
                <ChatInterface />
              </TabsContent>
              
              <TabsContent
                value="security"
                className="flex-1 data-[state=active]:flex flex-col overflow-hidden p-4 m-0"
              >
                <SecurityHistory />
              </TabsContent>
              
              <TabsContent
                value="transactions"
                className="flex-1 data-[state=active]:flex flex-col overflow-hidden p-4 m-0"
              >
                <TransactionHold />
              </TabsContent>
              
              <TabsContent
                value="settings"
                className="flex-1 data-[state=active]:flex flex-col overflow-auto p-4 m-0"
              >
                <AISettings />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AIProvider>
  );
};

export default AIAssistant;
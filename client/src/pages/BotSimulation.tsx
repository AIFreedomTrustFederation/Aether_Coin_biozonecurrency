/**
 * Bot Simulation Page
 * 
 * This page provides access to the bot simulation dashboard, allowing users
 * to manage and monitor autonomous bots that interact with the Aetherion ecosystem.
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bot, Server, Activity, ShieldAlert, Lock } from 'lucide-react';
import SimulationDashboard from '../simulation/Dashboard';

const BotSimulationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Helmet>
        <title>Bot Simulation | Aetherion Ecosystem</title>
        <meta name="description" content="Autonomous bot simulation for the Aetherion ecosystem" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Bot className="mr-2 h-8 w-8" />
                Aetherion Bot Simulation
              </h1>
              <p className="text-gray-400 mt-2">
                Autonomous bot simulation for testing and optimizing the Aetherion ecosystem
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center">
                <Server className="mr-1 h-3 w-3" />
                <span>Simulation v1.0</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center">
                <Activity className="mr-1 h-3 w-3" />
                <span>Development Mode</span>
              </Badge>
            </div>
          </div>
        </header>
        
        <div className="mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Secure Environment Notice</CardTitle>
              <CardDescription className="text-gray-400">
                This simulation environment uses real API endpoints with isolated security
              </CardDescription>
            </CardHeader>
            <CardContent className="text-gray-300">
              <div className="flex items-start space-x-4">
                <ShieldAlert className="h-8 w-8 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="mb-2">
                    The bot simulation connects to actual API endpoints but runs in a sandboxed environment.
                    All transactions and activities are isolated from production data.
                  </p>
                  <p>
                    Bot interactions help identify potential issues, optimize system performance, and
                    validate the security measures of the Aetherion ecosystem.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-700 flex justify-between">
              <div className="flex items-center text-gray-400 text-sm">
                <Lock className="h-4 w-4 mr-1" />
                <span>Zero-trust security enabled</span>
              </div>
              <Button variant="outline" size="sm">View Security Logs</Button>
            </CardFooter>
          </Card>
        </div>
        
        <SimulationDashboard />
      </div>
    </div>
  );
};

export default BotSimulationPage;
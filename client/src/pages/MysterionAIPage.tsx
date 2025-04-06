import React from 'react';
import { AIProvider } from '../modules/ai-assistant/contexts/AIContext';
import ChatInterface from '../modules/ai-assistant/components/ChatInterface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Brain, Sparkles, Lock } from 'lucide-react';

// Mock user ID for demo
const DEMO_USER_ID = 1;

export function MysterionAIPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Mysterion AI Assistant</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col overflow-hidden">
            <CardHeader className="bg-primary/5 pb-2">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Mysterion Chat
              </CardTitle>
              <CardDescription>
                Your quantum-powered AI assistant for all blockchain needs
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <AIProvider userId={DEMO_USER_ID}>
                <ChatInterface />
              </AIProvider>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Tabs defaultValue="features">
            <TabsList className="w-full">
              <TabsTrigger value="features">
                <span className="hidden sm:inline">Features</span>
                <span className="sm:hidden">Features</span>
              </TabsTrigger>
              <TabsTrigger value="security">
                <span className="hidden sm:inline">Security</span>
                <span className="sm:hidden">Security</span>
              </TabsTrigger>
              <TabsTrigger value="tech">
                <span className="hidden sm:inline">Technology</span>
                <span className="sm:hidden">Tech</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="features" className="space-y-4 mt-4">
              <FeatureCard 
                icon={<Shield className="h-5 w-5 text-primary" />}
                title="Transaction Security"
                description="Mysterion analyzes every transaction for potential security risks, spotting phishing attempts and suspicious smart contracts before you confirm."
              />
              
              <FeatureCard 
                icon={<Brain className="h-5 w-5 text-primary" />}
                title="Intelligent Assistance"
                description="Get answers to any blockchain question, from technical details to best practices. Mysterion is trained on the latest crypto knowledge."
              />
              
              <FeatureCard 
                icon={<Lock className="h-5 w-5 text-primary" />}
                title="Credential Management"
                description="Securely store encrypted credentials for DApps and services. Only you can access them when needed."
              />
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quantum-Resistant Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Mysterion leverages a variety of quantum-resistant cryptographic algorithms to ensure your data remains secure even against next-generation attacks:</p>
                  <ul className="list-disc pl-5 mt-3 space-y-1">
                    <li>CRYSTAL-Kyber for key encapsulation</li>
                    <li>SPHINCS+ for digital signatures</li>
                    <li>Recursive Merkle trees for state validation</li>
                    <li>Zero-knowledge STARKs for privacy preservation</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tech" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>The Science Behind Mysterion</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Mysterion combines advanced AI with quantum-secure cryptography:</p>
                  <ul className="list-disc pl-5 mt-3 space-y-1">
                    <li>Built on fractal recursive Mandelbrot sets</li>
                    <li>Layer 2 quantum security wrapping of existing crypto</li>
                    <li>Secure credential storage using homomorphic encryption</li>
                    <li>Multi-quantum state analysis for transaction verification</li>
                    <li>Matrix protocol integration for decentralized notifications</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>{description}</p>
      </CardContent>
    </Card>
  );
}

export default MysterionAIPage;
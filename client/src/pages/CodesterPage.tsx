import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Code, Users, Play, Zap, Database, Server, 
  FileCode, Cpu, Globe, Sparkles, Braces, Share2, 
  BookOpen, Rocket, Lock, Blocks, Bot, Lightbulb
} from 'lucide-react';
import { motion } from 'framer-motion';

const CodeEditor = () => {
  return (
    <div className="code-editor">
      <p>Code Editor Component</p>
    </div>
  );
};

const CodesterPage = () => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
          <Code className="h-6 w-6 text-primary mr-2" />
          <span className="font-medium text-primary">Introducing Codester</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          The Web3-Native Collaborative IDE
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Write, collaborate, deploy, and learn in a seamless environment built for the future of decentralized development.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" className="gap-2">
            <Rocket className="h-5 w-5" />
            Launch Codester
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <BookOpen className="h-5 w-5" />
            View Documentation
          </Button>
        </div>
      </div>

      {/* Feature Tabs */}
      <Tabs defaultValue="editor" className="mb-12">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            <span className="hidden sm:inline">Code Editor</span>
          </TabsTrigger>
          <TabsTrigger value="collaboration" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Collaboration</span>
          </TabsTrigger>
          <TabsTrigger value="blockchain" className="flex items-center gap-2">
            <Blocks className="h-4 w-4" />
            <span className="hidden sm:inline">Blockchain</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">AI Assistant</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Powerful Code Editor</h2>
              <p className="text-muted-foreground mb-4">
                A full-featured code editor with syntax highlighting, intelligent code completion, and integrated debugging for over 40 programming languages.
              </p>
              <ul className="space-y-2">
                {[ 
                  { icon: <Braces className="h-4 w-4 text-primary" />, text: "Syntax highlighting for all major languages" },
                  { icon: <Zap className="h-4 w-4 text-primary" />, text: "Intelligent code completion" },
                  { icon: <Play className="h-4 w-4 text-primary" />, text: "Integrated debugging tools" },
                  { icon: <Server className="h-4 w-4 text-primary" />, text: "Terminal access with full shell support" },
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    {item.icon}
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg overflow-hidden border shadow-lg">
              <div className="bg-muted p-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs text-muted-foreground">SmartContract.sol</div>
              </div>
              <div className="h-[300px] bg-background">
                <img 
                  src="https://placehold.co/600x300/2a2a2a/white?text=Code+Editor+Preview" 
                  alt="Code Editor Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Real-Time Collaboration</h2>
              <p className="text-muted-foreground mb-4">
                Code together in real-time with your team. See live cursors, chat with collaborators, and work on the same codebase simultaneously.
              </p>
              <ul className="space-y-2">
                {[ 
                  { icon: <Users className="h-4 w-4 text-primary" />, text: "Multiple users editing simultaneously" },
                  { icon: <Share2 className="h-4 w-4 text-primary" />, text: "Cursor presence and user tracking" },
                  { icon: <Lock className="h-4 w-4 text-primary" />, text: "Permission-based access control" },
                  { icon: <Globe className="h-4 w-4 text-primary" />, text: "Integrated chat and video communication" },
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    {item.icon}
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg overflow-hidden border shadow-lg">
              <div className="bg-muted p-2 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Live Collaboration</div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Alice</Badge>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Bob</Badge>
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">Carol</Badge>
                </div>
              </div>
              <div className="h-[300px] bg-background">
                <img 
                  src="https://placehold.co/600x300/2a2a2a/white?text=Collaboration+Preview" 
                  alt="Collaboration Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Blockchain Development Tools</h2>
              <p className="text-muted-foreground mb-4">
                Specialized tools for blockchain development, including smart contract templates, testnet connections, and deployment pipelines.
              </p>
              <ul className="space-y-2">
                {[ 
                  { icon: <Blocks className="h-4 w-4 text-primary" />, text: "Smart contract templates and wizards" },
                  { icon: <Database className="h-4 w-4 text-primary" />, text: "Testnet integration for multiple chains" },
                  { icon: <Rocket className="h-4 w-4 text-primary" />, text: "One-click deployment to mainnet" },
                  { icon: <Cpu className="h-4 w-4 text-primary" />, text: "Gas optimization tools" },
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    {item.icon}
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg overflow-hidden border shadow-lg">
              <div className="bg-muted p-2 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Smart Contract Deployment</div>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Testnet Connected</Badge>
              </div>
              <div className="h-[300px] bg-background">
                <img 
                  src="https://placehold.co/600x300/2a2a2a/white?text=Blockchain+Tools+Preview" 
                  alt="Blockchain Tools Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">AI-Powered Development</h2>
              <p className="text-muted-foreground mb-4">
                Leverage AI to accelerate your development workflow with code suggestions, automated testing, and smart contract security analysis.
              </p>
              <ul className="space-y-2">
                {[ 
                  { icon: <Lightbulb className="h-4 w-4 text-primary" />, text: "AI code completion and generation" },
                  { icon: <Bot className="h-4 w-4 text-primary" />, text: "Automated code review and security analysis" },
                  { icon: <Sparkles className="h-4 w-4 text-primary" />, text: "Natural language to code translation" },
                  { icon: <Lock className="h-4 w-4 text-primary" />, text: "Smart contract vulnerability detection" },
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    {item.icon}
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg overflow-hidden border shadow-lg">
              <div className="bg-muted p-2 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">AI Assistant</div>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">Active</Badge>
              </div>
              <div className="h-[300px] bg-background">
                <img 
                  src="https://placehold.co/600x300/2a2a2a/white?text=AI+Assistant+Preview" 
                  alt="AI Assistant Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Feature Grid */}
      {isClient && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[ 
            {
              icon: <FileCode className="h-6 w-6 text-primary" />,
              title: "Multi-Language Support",
              description: "Support for over 40 programming languages with specialized tools for blockchain development."
            },
            {
              icon: <Users className="h-6 w-6 text-primary" />,
              title: "Real-Time Collaboration",
              description: "Code together with your team in real-time with cursor presence and integrated chat."
            },
            {
              icon: <Blocks className="h-6 w-6 text-primary" />,
              title: "Blockchain Integration",
              description: "Built-in tools for smart contract development, testing, and deployment."
            },
            {
              icon: <Bot className="h-6 w-6 text-primary" />,
              title: "AI Assistant",
              description: "AI-powered code completion, suggestions, and security analysis."
            },
            {
              icon: <Rocket className="h-6 w-6 text-primary" />,
              title: "One-Click Deployment",
              description: "Deploy your applications to various platforms with a single click."
            },
            {
              icon: <BookOpen className="h-6 w-6 text-primary" />,
              title: "Interactive Learning",
              description: "Built-in tutorials, challenges, and learning resources for all skill levels."
            },
          ].map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {feature.icon}
                    <CardTitle>{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Live Demo */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Try Codester Now</h2>
          <p className="text-muted-foreground">Experience the power of our code editor with this live demo</p>
        </div>
        
        <div className="border rounded-lg overflow-hidden shadow-lg">
          <CodeEditor />
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-8 rounded-lg border">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Coding?</h2>
        <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
          Join thousands of developers building the future of Web3 with Codester.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" className="gap-2">
            <Rocket className="h-5 w-5" />
            Launch Codester
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <Users className="h-5 w-5" />
            Join Community
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CodesterPage;
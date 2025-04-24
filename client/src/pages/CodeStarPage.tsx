import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { QuantumLoader } from "@/components/ui/quantum-loader";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "wouter";
import { 
  Code,
  FileCode,
  BookOpen,
  Star,
  Braces,
  Layers,
  GitBranch,
  TerminalSquare,
  Home
} from "lucide-react";

// Featured code languages
const codeLanguages = [
  { name: "JavaScript", color: "bg-amber-600", textColor: "text-amber-600" },
  { name: "TypeScript", color: "bg-blue-600", textColor: "text-blue-600" },
  { name: "Python", color: "bg-green-600", textColor: "text-green-600" },
  { name: "Solidity", color: "bg-purple-600", textColor: "text-purple-600" },
  { name: "Rust", color: "bg-orange-600", textColor: "text-orange-600" }
];

// Featured IDE features
const ideFeatures = [
  {
    title: "Smart Code Completion",
    description: "AI-powered code completion that understands your project context",
    icon: Code
  },
  {
    title: "Real-time Collaboration",
    description: "Work together with teammates on the same codebase simultaneously",
    icon: GitBranch
  },
  {
    title: "Integrated Terminal",
    description: "Built-in terminal for running commands without leaving the editor",
    icon: TerminalSquare
  },
  {
    title: "Advanced Syntax Highlighting",
    description: "Beautiful and customizable syntax highlighting for all supported languages",
    icon: FileCode
  },
  {
    title: "Project Templates",
    description: "Start new projects quickly with pre-configured templates",
    icon: Layers
  },
  {
    title: "Documentation Integration",
    description: "Access documentation and examples directly within your editor",
    icon: BookOpen
  }
];

// Main CodeStar component
const CodeStarPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("features");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    setIsClient(true);
    
    return () => clearTimeout(timer);
  }, []);

  const handleTryEditor = () => {
    setLoading(true);
    
    // Simulate editor loading
    setTimeout(() => {
      toast({
        title: "Editor Launched",
        description: "Welcome to the CodeStar integrated development environment!",
        variant: "default"
      });
      setLoading(false);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <QuantumLoader 
          size="lg" 
          variant="cosmos" 
          showLabel 
          labelText="Initializing CodeStar IDE..." 
        />
        <p className="text-gray-400 text-sm mt-8 max-w-md text-center">
          Loading your development environment with quantum-enhanced features...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <Navbar />
      
      <main className="flex-grow container py-8">
        <div className="w-full flex justify-start mb-2">
          <Button 
            asChild
            variant="outline"
            className="flex items-center gap-2"
          >
            <Link to="/">
              <Home className="h-4 w-4" />
              <span>Return to Homepage</span>
            </Link>
          </Button>
        </div>
        
        {/* Hero Section */}
        <section className="py-12 md:py-20">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2 space-y-6">
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-blue-600 hover:bg-blue-700">CodeStar</Badge>
                <Badge className="bg-purple-600 hover:bg-purple-700">Quantum-Enhanced</Badge>
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  IDE Platform
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold">
                <span className="gradient-text">CodeStar</span> Integrated Development Environment
              </h1>
              
              <p className="text-lg text-muted-foreground">
                A next-generation development environment with quantum-enhanced features,
                designed for the modern developer working on blockchain, AI, and traditional applications.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleTryEditor}
                >
                  Try CodeStar IDE
                </Button>
                <Button variant="outline" className="gap-2">
                  <Star className="h-4 w-4" />
                  Explore Features
                </Button>
              </div>
            </div>
            
            <div className="md:w-1/2 relative">
              <div className="relative z-10 shadow-xl rounded-xl overflow-hidden border border-blue-200 dark:border-gray-700">
                <img 
                  src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop"
                  alt="CodeStar IDE Interface" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <h3 className="font-medium text-lg">Intuitive Code Editor</h3>
                    <p className="text-sm opacity-80">Powerful features in a clean interface</p>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-8 -right-8 w-64 h-64 bg-blue-300/20 dark:bg-blue-900/20 rounded-full filter blur-3xl"></div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-purple-300/20 dark:bg-purple-900/20 rounded-full filter blur-3xl"></div>
            </div>
          </div>
        </section>
        
        {/* Tabs Section */}
        <section className="py-12">
          <Tabs defaultValue="features" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-3 w-full max-w-lg">
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="languages">Languages</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="features" className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-display font-bold mb-4">
                  Powerful <span className="gradient-text">Developer</span> Features
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  CodeStar combines the best features from modern IDEs with quantum-enhanced capabilities
                  to provide an unparalleled development experience.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ideFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <Card key={index} className="border-blue-100 dark:border-gray-700 transition-all hover:shadow-md">
                      <CardHeader>
                        <div className="bg-blue-100 dark:bg-blue-900/40 p-3 w-fit rounded-lg text-blue-600 dark:text-blue-400 mb-3">
                          <Icon className="h-6 w-6" />
                        </div>
                        <CardTitle>{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="languages" className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-display font-bold mb-4">
                  Supported <span className="gradient-text">Languages</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  CodeStar supports a wide range of programming languages with advanced syntax highlighting,
                  code completion, and language-specific features.
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {codeLanguages.map((language, index) => (
                  <Card key={index} className="border-blue-100 dark:border-gray-700 transition-all hover:shadow-md text-center">
                    <CardHeader className="pb-2">
                      <div className={`${language.color} mx-auto p-3 w-12 h-12 rounded-lg text-white mb-3 flex items-center justify-center`}>
                        <Braces className="h-6 w-6" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className={`font-medium ${language.textColor}`}>{language.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Full Support</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="text-center mt-8">
                <p className="text-muted-foreground">
                  And many more languages with varying levels of support...
                </p>
                <Button variant="outline" className="mt-4">
                  View All Supported Languages
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="integrations" className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-display font-bold mb-4">
                  Seamless <span className="gradient-text">Integrations</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  CodeStar integrates with your favorite tools and platforms to create a 
                  streamlined development workflow.
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6">
                {["GitHub", "GitLab", "Bitbucket", "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes"].map((tool, index) => (
                  <Badge key={index} variant="outline" className="text-base py-2 px-4">
                    {tool}
                  </Badge>
                ))}
              </div>
              
              <Card className="border-blue-100 dark:border-gray-700 mt-8">
                <CardHeader>
                  <CardTitle>Custom Integrations</CardTitle>
                  <CardDescription>
                    Connect CodeStar with your own tools and services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our flexible API allows you to build custom integrations with internal tools 
                    and specialized services specific to your development workflow.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline">View API Documentation</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
        
        {/* CTA Section */}
        <section className="py-16">
          <Card className="border-blue-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="space-y-4 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-display font-bold">
                    Ready to elevate your development experience?
                  </h3>
                  <p className="text-muted-foreground max-w-xl">
                    Join thousands of developers already using CodeStar to build amazing applications
                    with our quantum-enhanced IDE.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleTryEditor}
                  >
                    Try CodeStar Now
                  </Button>
                  <Button variant="outline">
                    View Documentation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default CodeStarPage;
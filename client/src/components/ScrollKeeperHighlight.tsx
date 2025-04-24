import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollText, ArrowRight, Code, Server, CloudLightning } from "lucide-react";
import { Link } from "react-router-dom";

const ScrollKeeperHighlight = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge className="mb-4 bg-blue-600">New Tools</Badge>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            <span className="text-blue-600">Scroll Keeper</span> Dashboard & <span className="text-cyan-600">CodeStar</span> IDE
          </h2>
          <p className="text-muted-foreground">
            Access our latest development tools designed to enhance your experience within the Aetherion ecosystem
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-blue-100 dark:border-blue-900/50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <ScrollText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Scroll Keeper Dashboard</CardTitle>
                  <CardDescription>Real-time data management platform</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Scroll Keeper provides a powerful real-time dashboard for monitoring and managing data across the Aetherion network. Connect devices, analyze metrics, and optimize performance all in one place.
                </p>
                
                <div className="grid grid-cols-2 gap-3 py-4">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Real-time metrics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CloudLightning className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Network monitoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ScrollText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Data visualization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Resource allocation</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link to="/scroll-keeper" className="flex items-center gap-2">
                  Access Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border-cyan-100 dark:border-cyan-900/50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                  <Code className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <CardTitle>CodeStar IDE</CardTitle>
                  <CardDescription>Quantum-enhanced development environment</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  CodeStar is our next-generation integrated development environment with quantum-enhanced features, designed for modern developers working on blockchain, AI, and traditional applications.
                </p>
                
                <div className="grid grid-cols-2 gap-3 py-4">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-cyan-600" />
                    <span className="text-sm">Smart completion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CloudLightning className="h-4 w-4 text-cyan-600" />
                    <span className="text-sm">Real-time collaboration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-cyan-600" />
                    <span className="text-sm">Integrated terminal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-cyan-600" />
                    <span className="text-sm">Syntax highlighting</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20">
              <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
                <Link to="/codestar" className="flex items-center gap-2">
                  Open CodeStar IDE
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ScrollKeeperHighlight;
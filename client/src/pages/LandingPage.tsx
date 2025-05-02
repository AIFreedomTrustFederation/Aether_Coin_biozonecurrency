import React from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Database, LineChart, BarChart4, GitBranch, Server } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a1a35]">
      <main className="flex-grow flex flex-col">
        {/* Header */}
        <header className="py-12 md:py-20 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#41e0fd] to-[#9b83fc] bg-clip-text text-transparent mb-6">
              Aether_Coin CodeStar
              <br />
              Platform
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Welcome to the CodeStar development environment powered 
              by Aether_Coin blockchain technology.
            </p>
          </div>
        </header>

        {/* Main Features */}
        <section className="py-16 flex-grow">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Feature Cards */}
              <Card className="bg-[#0c1f3f] border-[#1a2a45] hover:border-[#41e0fd] transition-colors">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#9b83fc] flex items-center gap-2">
                    <Code className="h-6 w-6" />
                    Code Complexity Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-6">
                    Visualize and optimize your codebase complexity with
                    AI-powered insights.
                  </p>
                  <Link href="/code-mood-meter">
                    <Button className="bg-[#1a2a45] hover:bg-[#2a3a55] text-[#41e0fd]">
                      Analyze Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-[#0c1f3f] border-[#1a2a45] hover:border-[#41e0fd] transition-colors">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#9b83fc] flex items-center gap-2">
                    <BarChart4 className="h-6 w-6" />
                    Developer Productivity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-6">
                    Track and improve your development productivity with 
                    personalized metrics and insights.
                  </p>
                  <Link href="/productivity">
                    <Button className="bg-[#1a2a45] hover:bg-[#2a3a55] text-[#41e0fd]">
                      View Dashboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="bg-[#0c1f3f] border-[#1a2a45] hover:border-[#41e0fd] transition-colors">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#9b83fc] flex items-center gap-2">
                    <Server className="h-6 w-6" />
                    Brand Showcase
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-6">
                    Explore our innovative brands and technologies within the 
                    Aether_Coin ecosystem.
                  </p>
                  <Link href="/brands">
                    <Button className="bg-[#1a2a45] hover:bg-[#2a3a55] text-[#41e0fd]">
                      View Brands
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-[#0c1f3f] border-[#1a2a45] hover:border-[#41e0fd] transition-colors">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#9b83fc] flex items-center gap-2">
                    <GitBranch className="h-6 w-6" />
                    GitHub Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-6">
                    Connect to GitHub repositories and visualize
                    project activity and collaboration.
                  </p>
                  <a href="https://github.com/aifreedomtrust" target="_blank" rel="noopener noreferrer">
                    <Button className="bg-[#1a2a45] hover:bg-[#2a3a55] text-[#41e0fd]">
                      View GitHub
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#061525] py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Aether_Coin CodeStar Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
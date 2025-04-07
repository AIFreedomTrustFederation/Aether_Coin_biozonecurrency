import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import CodeEditor from '../components/CodeEditor';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Server, Milestone, Cpu, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CodeEditorPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Check if the screen size is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Code Editor | Aetherion DApp</title>
      </Helmet>
      
      <div className="container mx-auto px-2 sm:px-4 h-[calc(100vh-4rem)]">
        <div className="flex justify-between items-center py-3">
          <h1 className="text-xl sm:text-2xl font-bold">Aetherion DApp Builder</h1>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Documentation</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View documentation for smart contract development</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <Tabs defaultValue="editor" className="h-[calc(100%-4rem)]">
          <TabsList className="w-full">
            <TabsTrigger value="editor" className="flex-1">
              <Code className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Code Editor</span>
            </TabsTrigger>
            <TabsTrigger value="compiler" className="flex-1">
              <Cpu className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Compiler</span>
            </TabsTrigger>
            <TabsTrigger value="deployer" className="flex-1">
              <Server className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Deployment</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex-1">
              <Milestone className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="h-[calc(100%-3rem)]">
            <Card className="border">
              <CardContent className="p-0 h-full">
                <CodeEditor />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="compiler" className="h-[calc(100%-3rem)]">
            <Card className="h-full p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-4">Contract Compiler</h2>
              <p>This section will provide advanced compilation options for smart contracts.</p>
              <div className="mt-4 text-center text-muted-foreground">
                Select "Code Editor" tab to access this functionality now.
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="deployer" className="h-[calc(100%-3rem)]">
            <Card className="h-full p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-4">Deployment Manager</h2>
              <p>Manage your contract deployments across different networks.</p>
              <div className="mt-4 text-center text-muted-foreground">
                Select "Code Editor" tab to access deployment functionality now.
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="projects" className="h-[calc(100%-3rem)]">
            <Card className="h-full p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-4">Project Management</h2>
              <p>Organize your smart contracts into projects and manage their lifecycle.</p>
              <div className="mt-4 text-center text-muted-foreground">
                Select "Code Editor" tab to access project features now.
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default CodeEditorPage;
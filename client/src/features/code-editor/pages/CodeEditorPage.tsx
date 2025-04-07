import React from 'react';
import { Helmet } from 'react-helmet';
import CodeEditor from '../components/CodeEditor';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Server, Milestone, Cpu } from 'lucide-react';

const CodeEditorPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Code Editor | Aetherion DApp</title>
      </Helmet>
      <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
        <h1 className="text-2xl font-bold mb-4">Aetherion DApp Builder</h1>
        
        <Tabs defaultValue="editor" className="h-[calc(100%-3rem)]">
          <TabsList className="w-full">
            <TabsTrigger value="editor" className="flex-1">
              <Code className="h-4 w-4 mr-2" />
              Code Editor
            </TabsTrigger>
            <TabsTrigger value="compiler" className="flex-1">
              <Cpu className="h-4 w-4 mr-2" />
              Contract Compiler
            </TabsTrigger>
            <TabsTrigger value="deployer" className="flex-1">
              <Server className="h-4 w-4 mr-2" />
              Deployment Manager
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex-1">
              <Milestone className="h-4 w-4 mr-2" />
              Project Management
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
            <Card className="h-full p-6">
              <h2 className="text-xl font-bold mb-4">Contract Compiler</h2>
              <p>This section will provide advanced compilation options for smart contracts.</p>
              <div className="mt-4 text-center text-muted-foreground">
                Select "Code Editor" tab to access this functionality now.
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="deployer" className="h-[calc(100%-3rem)]">
            <Card className="h-full p-6">
              <h2 className="text-xl font-bold mb-4">Deployment Manager</h2>
              <p>Manage your contract deployments across different networks.</p>
              <div className="mt-4 text-center text-muted-foreground">
                Select "Code Editor" tab to access deployment functionality now.
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="projects" className="h-[calc(100%-3rem)]">
            <Card className="h-full p-6">
              <h2 className="text-xl font-bold mb-4">Project Management</h2>
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
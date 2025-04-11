import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Leaf, 
  Cpu, 
  Calculator, 
  FileText, 
  Share2, 
  PlayCircle, 
  BookOpen, 
  Download,
  Wallet,
  Dices
} from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import { 
  FractalVisualizationDashboard, 
  SacredGeometryCalculator, 
  BiozoecurrencyDocumentation, 
  IULPolicyIntegration 
} from '..';

const BiozoecurrencyPage = () => {
  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto">
        <motion.div
          className="space-y-6 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">Aetherion Biozoecurrency</h1>
              <p className="text-muted-foreground">
                Explore the revolutionary approach to blockchain economics that aligns with natural growth patterns
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Whitepaper
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="default" size="sm">
                <PlayCircle className="h-4 w-4 mr-2" />
                Video Tour
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Natural Growth</h3>
              <p className="text-sm text-muted-foreground">
                Follows mathematical principles found in nature - Fibonacci sequences, Pi ratios, and fractal patterns
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-lg p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                <Dices className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Inverse Incentives</h3>
              <p className="text-sm text-muted-foreground">
                Later adopters benefit from airdrops, death/resurrection cycles, and recursive transformations
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                <Wallet className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-medium mb-2">Self-Repaying Loans</h3>
              <p className="text-sm text-muted-foreground">
                Over-collateralized loans against IUL policies that repay themselves through transaction fees
              </p>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <Tabs defaultValue="documentation" className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
              <TabsTrigger value="documentation" className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2 md:mr-2" />
                <span className="hidden md:inline-block">Documentation</span>
                <span className="md:hidden">Docs</span>
              </TabsTrigger>
              <TabsTrigger value="visualization" className="flex items-center">
                <Cpu className="h-4 w-4 mr-2 md:mr-2" />
                <span className="hidden md:inline-block">Visualization</span>
                <span className="md:hidden">Visual</span>
              </TabsTrigger>
              <TabsTrigger value="calculator" className="flex items-center">
                <Calculator className="h-4 w-4 mr-2 md:mr-2" />
                <span className="hidden md:inline-block">Calculator</span>
                <span className="md:hidden">Calc</span>
              </TabsTrigger>
              <TabsTrigger value="iul" className="flex items-center">
                <Wallet className="h-4 w-4 mr-2 md:mr-2" />
                <span className="hidden md:inline-block">IUL Integration</span>
                <span className="md:hidden">IUL</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="documentation">
              <BiozoecurrencyDocumentation />
            </TabsContent>
            
            <TabsContent value="visualization">
              <FractalVisualizationDashboard />
            </TabsContent>
            
            <TabsContent value="calculator">
              <SacredGeometryCalculator />
            </TabsContent>
            
            <TabsContent value="iul">
              <IULPolicyIntegration />
            </TabsContent>
          </Tabs>
          
          <div className="bg-card border rounded-lg p-6 mt-8">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileText className="h-12 w-12 text-primary" />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-medium mb-2">Complete Whitepaper Available</h3>
                <p className="text-muted-foreground mb-4">
                  Download the full Aetherion whitepaper to learn more about our biozoecurrency model, 
                  mathematical foundations, governance structure, and strategic roadmap.
                </p>
                <div className="flex flex-col xs:flex-row gap-2 justify-center md:justify-start">
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Read Online
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BiozoecurrencyPage;
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, BarChart3, Wallet, Clock, Shield, Newspaper, Gauge, Microscope } from 'lucide-react';

// Sample widget templates data
const widgetTemplates = [
  {
    id: 'price-chart',
    name: 'Price Chart',
    description: 'Real-time cryptocurrency price charts with customizable timeframes',
    icon: BarChart3,
    category: 'analytics',
    popular: true
  },
  {
    id: 'wallet-balance',
    name: 'Wallet Balance',
    description: 'View and monitor your cryptocurrency wallet balances across chains',
    icon: Wallet,
    category: 'portfolio',
    popular: true
  },
  {
    id: 'transaction-feed',
    name: 'Transaction Feed',
    description: 'Track recent transactions with details and verification status',
    icon: Clock,
    category: 'portfolio',
    popular: false
  },
  {
    id: 'ai-monitor',
    name: 'AI Security Monitor',
    description: 'AI-powered security monitoring for suspicious activities',
    icon: Shield,
    category: 'security',
    popular: true
  },
  {
    id: 'news-feed',
    name: 'Crypto News',
    description: 'Stay updated with the latest cryptocurrency news and trends',
    icon: Newspaper,
    category: 'information',
    popular: false
  },
  {
    id: 'gas-tracker',
    name: 'Gas Tracker',
    description: 'Monitor gas prices across different blockchain networks',
    icon: Gauge,
    category: 'utilities',
    popular: false
  },
  {
    id: 'quantum-validator',
    name: 'Quantum Security',
    description: 'Analyze and ensure your wallet is resistant to quantum computing attacks',
    icon: Microscope,
    category: 'security',
    popular: true
  }
];

// Group widgets by category
const categories = [
  { id: 'popular', name: 'Popular' },
  { id: 'analytics', name: 'Analytics' },
  { id: 'portfolio', name: 'Portfolio' },
  { id: 'security', name: 'Security' },
  { id: 'information', name: 'Information' },
  { id: 'utilities', name: 'Utilities' },
];

// Interface for the component props
interface AddWidgetModalProps {
  onAddWidget: (templateId: string) => void;
}

const AddWidgetModal: React.FC<AddWidgetModalProps> = ({ onAddWidget }) => {
  const [open, setOpen] = useState(false);
  
  // Handle adding a widget
  const handleAddWidget = (templateId: string) => {
    onAddWidget(templateId);
    setOpen(false);
  };
  
  // Get widgets for a category
  const getWidgetsForCategory = (categoryId: string) => {
    if (categoryId === 'popular') {
      return widgetTemplates.filter(template => template.popular);
    }
    return widgetTemplates.filter(template => template.category === categoryId);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Widget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
          <DialogDescription>
            Choose a widget to add to your dashboard
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="popular" className="mt-2">
          <TabsList className="grid grid-cols-6 mb-4">
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map(category => (
            <TabsContent key={category.id} value={category.id}>
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-2 gap-4">
                  {getWidgetsForCategory(category.id).map(template => (
                    <Card key={template.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-base flex items-center">
                              <template.icon className="h-5 w-5 text-primary mr-2" />
                              {template.name}
                            </CardTitle>
                            {template.popular && category.id !== 'popular' && (
                              <Badge className="mt-1" variant="secondary">Popular</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <CardDescription className="text-sm">
                          {template.description}
                        </CardDescription>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-end">
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => handleAddWidget(template.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add to Dashboard
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddWidgetModal;
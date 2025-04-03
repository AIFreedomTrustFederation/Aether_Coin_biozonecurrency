import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WidgetTemplate } from '@/types/widget';
import { useWidgets } from '@/hooks/useWidgets';

interface AddWidgetModalProps {
  onAddWidget: (templateId: string) => void;
}

const AddWidgetModal: React.FC<AddWidgetModalProps> = ({ onAddWidget }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  const { widgetTemplates = [], widgetCategories = [] } = useWidgets();

  // Handle widget selection
  const handleSelectWidget = (templateId: string) => {
    onAddWidget(templateId);
    setOpen(false);
  };
  
  // Filter templates based on search and category
  const filteredTemplates = widgetTemplates.filter(template => {
    const matchesSearch = 
      searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = 
      activeCategory === 'all' || 
      template.category === activeCategory;
      
    return matchesSearch && matchesCategory;
  });
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Widget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 my-4">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Input
            className="flex-1"
            placeholder="Search widgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="w-full flex mb-4 h-9 overflow-x-auto">
            <TabsTrigger value="all" className="flex-shrink-0">All</TabsTrigger>
            {widgetCategories.map(category => (
              <TabsTrigger key={category.id} value={category.id} className="flex-shrink-0">
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeCategory} className="mt-0">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map(template => (
                  <WidgetCard 
                    key={template.id} 
                    template={template} 
                    onSelect={handleSelectWidget} 
                  />
                ))}
                
                {filteredTemplates.length === 0 && (
                  <div className="col-span-2 flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-muted-foreground">No widgets found matching your criteria.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

interface WidgetCardProps {
  template: WidgetTemplate;
  onSelect: (templateId: string) => void;
}

const WidgetCard: React.FC<WidgetCardProps> = ({ template, onSelect }) => {
  return (
    <div 
      className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-colors"
      onClick={() => onSelect(template.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          {template.icon && <template.icon className="h-5 w-5 text-primary" />}
          <h3 className="font-medium">{template.name}</h3>
        </div>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
          Add
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        {template.description}
      </p>
    </div>
  );
};

export default AddWidgetModal;
import React, { useState } from 'react';
import { Widget } from '@/types/widget';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getWidgetComponent } from './WidgetRegistry';
import { 
  MoreHorizontal, 
  X, 
  Maximize2, 
  Minimize2, 
  Settings, 
  Copy,
  MoveVertical
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface WidgetContainerProps {
  widget: Widget;
  onRemove: (id: string) => void;
  onUpdate: (id: string, data: Partial<Widget>) => void;
  onDuplicate: (id: string) => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}

const WidgetContainer: React.FC<WidgetContainerProps> = ({
  widget, 
  onRemove, 
  onUpdate, 
  onDuplicate,
  isDragging,
  dragHandleProps
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Get the component for this widget type
  const WidgetComponent = getWidgetComponent(widget.type);
  
  // Handle widget config changes
  const handleConfigChange = (config: any) => {
    onUpdate(widget.id, { config });
  };
  
  return (
    <div 
      className={`
        transition-all duration-200 ease-in-out
        ${isMaximized ? 'fixed inset-4 z-50' : 'relative'}
        ${isDragging ? 'opacity-60 cursor-grabbing' : ''}
      `}
    >
      <Card className="h-full overflow-hidden">
        <div className="widget-header flex items-center justify-between px-3 py-1.5 bg-muted/40 border-b">
          <div 
            className="flex items-center gap-2 cursor-grab active:cursor-grabbing text-sm font-medium"
            {...dragHandleProps}
          >
            <MoveVertical className="h-4 w-4 text-muted-foreground" />
            <span>{widget.name}</span>
          </div>
          
          <div className="flex items-center">
            {isEditing && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsEditing(false)}
                className="h-7 w-7"
              >
                <span className="sr-only">Done</span>
                ✓
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMaximized(!isMaximized)}
              className="h-7 w-7"
            >
              <span className="sr-only">{isMaximized ? 'Minimize' : 'Maximize'}</span>
              {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(!isEditing)}>
                  <Settings className="h-4 w-4 mr-2" />
                  {isEditing ? 'Done Editing' : 'Edit Widget'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(widget.id)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onRemove(widget.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className={`widget-content h-full ${isMaximized ? 'overflow-auto' : ''}`}>
          <WidgetComponent 
            widget={widget} 
            isEditing={isEditing}
            onConfigChange={handleConfigChange}
          />
        </div>
      </Card>
    </div>
  );
};

export default WidgetContainer;
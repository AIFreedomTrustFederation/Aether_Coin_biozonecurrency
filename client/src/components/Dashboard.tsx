import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useWidgets } from '@/hooks/useWidgets';
import WidgetContainer from '@/components/widgets/WidgetContainer';
import { Widget } from '@/types/widget';
import AddWidgetModal from '@/components/widgets/AddWidgetModal';
import { Button } from '@/components/ui/button';
import { PlusCircle, LayoutGrid, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const {
    widgets,
    addWidget,
    updateWidget,
    removeWidget,
  } = useWidgets();

  const [isEditing, setIsEditing] = useState(false);

  // Handle adding a new widget
  const handleAddWidget = (templateId: string) => {
    addWidget(templateId);
  };

  // Handle duplicating a widget
  const handleDuplicateWidget = (widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    addWidget(widget.type);
  };

  // Handle widget position/size updates
  const handleWidgetUpdate = (widgetId: string, updates: Partial<Widget>) => {
    updateWidget(widgetId, updates);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full h-full p-4 lg:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Dashboard</h1>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setIsEditing(!isEditing)}
            >
              <LayoutGrid className="h-4 w-4" />
              {isEditing ? 'Done Editing' : 'Edit Layout'}
            </Button>
            
            <AddWidgetModal onAddWidget={handleAddWidget} />
          </div>
        </div>

        {widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">Your dashboard is empty</p>
            <Button 
              onClick={() => handleAddWidget('price-chart')}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              Add Your First Widget
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* This is a simplified layout. In a real app, you would use a proper grid system 
                that supports drag-and-drop, like react-grid-layout */}
            {widgets.map(widget => (
              <div
                key={widget.id}
                className={`col-span-${widget.position.w} row-span-${widget.position.h}`}
                style={{
                  gridColumn: `span ${widget.position.w}`,
                  gridRow: `span ${widget.position.h}`,
                }}
              >
                <WidgetContainer
                  widget={widget}
                  onRemove={removeWidget}
                  onUpdate={handleWidgetUpdate}
                  onDuplicate={handleDuplicateWidget}
                  dragHandleProps={{}}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default Dashboard;
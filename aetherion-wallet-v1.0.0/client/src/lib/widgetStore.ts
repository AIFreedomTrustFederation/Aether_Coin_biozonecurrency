import create from 'zustand';
import { Widget } from '@/types/widget';
import { nanoid } from './utils';

// Define the store state
interface WidgetState {
  widgets: Widget[];
  selectedWidgetId: string | null;
  
  // Actions
  addWidget: (widget: Widget) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  removeWidget: (id: string) => void;
  selectWidget: (id: string | null) => void;
  moveWidget: (id: string, position: { x: number; y: number }) => void;
  resizeWidget: (id: string, size: { w: number; h: number }) => void;
}

// Create the store
export const useWidgetStore = create<WidgetState>((set) => ({
  widgets: [],
  selectedWidgetId: null,
  
  // Add a new widget
  addWidget: (widget: Widget) => set((state) => ({
    widgets: [...state.widgets, {
      ...widget,
      id: widget.id || `widget-${nanoid()}`
    }]
  })),
  
  // Update a widget
  updateWidget: (id, updates) => set((state) => ({
    widgets: state.widgets.map((widget) => 
      widget.id === id 
        ? { 
            ...widget, 
            ...updates,
            config: { ...widget.config, ...(updates.config || {}) } 
          } 
        : widget
    )
  })),
  
  // Remove a widget
  removeWidget: (id) => set((state) => ({
    widgets: state.widgets.filter((widget) => widget.id !== id),
    selectedWidgetId: state.selectedWidgetId === id ? null : state.selectedWidgetId
  })),
  
  // Select a widget
  selectWidget: (id) => set(() => ({
    selectedWidgetId: id
  })),
  
  // Move a widget
  moveWidget: (id, position) => set((state) => ({
    widgets: state.widgets.map((widget) => 
      widget.id === id 
        ? { 
            ...widget, 
            position: { ...widget.position, ...position } 
          } 
        : widget
    )
  })),
  
  // Resize a widget
  resizeWidget: (id, size) => set((state) => ({
    widgets: state.widgets.map((widget) => 
      widget.id === id 
        ? { 
            ...widget, 
            position: { 
              ...widget.position, 
              w: size.w, 
              h: size.h 
            } 
          } 
        : widget
    )
  })),
}));
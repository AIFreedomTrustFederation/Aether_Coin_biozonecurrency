import React from 'react';
import { cn } from '@/lib/utils';

export interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

export interface QuickAccessSectionProps {
  items: NavItem[];
  isActive: (path: string) => boolean;
  onSelect: (path: string) => void;
}

const QuickAccessSection = ({
  items,
  isActive,
  onSelect
}: QuickAccessSectionProps) => {
  return (
    <div className="py-4 border-b border-border">
      <h3 className="px-4 text-sm font-medium text-muted-foreground mb-2">Quick Access</h3>
      <div className="relative px-4">
        {/* Shadow indicators for scroll */}
        <div className="absolute left-4 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-4 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
        
        <div className="overflow-x-auto scrollbar-hide pb-2">
          <div className="flex space-x-4 min-w-max">
            {items.map((item) => (
              <div
                key={`quick-${item.path}`}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer whitespace-nowrap",
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
                )}
                onClick={() => onSelect(item.path)}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAccessSection;
import React from 'react';
import { cn } from '@/lib/utils';

export interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  category: string;
}

export interface CategorySectionProps {
  category: string;
  items: NavItem[];
  isExpanded: boolean;
  isActive: (path: string) => boolean;
  onToggle: () => void;
  onSelect: (path: string) => void;
}

const CategorySection = ({
  category,
  items,
  isExpanded,
  isActive,
  onToggle,
  onSelect
}: CategorySectionProps) => {
  return (
    <div className="mb-2">
      <div 
        className="flex items-center justify-between px-4 py-2 cursor-pointer text-sm font-medium"
        onClick={onToggle}
      >
        <span className="text-foreground">{category}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {isExpanded && (
        <div className="ml-2 pl-2 border-l border-border">
          {items.map((item) => (
            <div 
              key={item.path}
              className={cn(
                "block px-4 py-2 mb-1 cursor-pointer",
                isActive(item.path) 
                  ? 'text-foreground bg-primary/10 border-l-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-primary/5 border-l-2 border-transparent'
              )}
              onClick={() => onSelect(item.path)}
            >
              <div className="flex items-center">
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategorySection;
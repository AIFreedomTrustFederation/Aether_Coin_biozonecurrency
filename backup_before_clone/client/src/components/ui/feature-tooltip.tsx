import React, { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle, Info } from 'lucide-react';

export interface FeatureTooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  className?: string;
  iconClassName?: string;
  interactive?: boolean;
  showIcon?: boolean;
  tooltipWidth?: string;
}

/**
 * FeatureTooltip - A component that displays contextual help information
 * in a tooltip when hovered or clicked (for mobile)
 */
export function FeatureTooltip({
  content,
  children,
  icon = <HelpCircle />,
  side = 'top',
  sideOffset = 5,
  className = '',
  iconClassName = 'h-4 w-4 text-muted-foreground',
  interactive = false,
  showIcon = true,
  tooltipWidth = 'max-w-[280px]'
}: FeatureTooltipProps) {
  // For interactive tooltips (click to show/hide)
  const [open, setOpen] = useState(false);

  // If component is interactive, manage open state manually
  const tooltipProps = interactive 
    ? { open, onOpenChange: setOpen }
    : {};

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip {...tooltipProps}>
        <TooltipTrigger 
          onClick={interactive ? () => setOpen(!open) : undefined} 
          className={className}
          asChild={!!children}
        >
          {children || (showIcon && <span className={`inline-flex ${iconClassName}`}>{icon}</span>)}
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          sideOffset={sideOffset}
          className={`${tooltipWidth} text-sm p-3 backdrop-blur-sm bg-background/95 border-primary/20 shadow-md`}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * ContextualHelp - A pre-configured tooltip specifically for feature guidance
 */
export function ContextualHelp({
  title,
  description,
  side = 'top',
  sideOffset = 5,
  interactive = false,
  icon = <Info className="h-4 w-4 text-primary" />,
  iconClassName = "h-5 w-5 ml-2 text-primary/70 hover:text-primary transition-colors cursor-help",
}: {
  title: string;
  description: string | React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  interactive?: boolean;
  icon?: React.ReactNode;
  iconClassName?: string;
}) {
  const content = (
    <div className="space-y-2">
      <p className="font-medium text-foreground">{title}</p>
      <div className="text-muted-foreground text-sm">
        {typeof description === 'string' 
          ? <p>{description}</p> 
          : description
        }
      </div>
    </div>
  );

  return (
    <FeatureTooltip
      content={content}
      side={side}
      sideOffset={sideOffset}
      icon={icon}
      iconClassName={iconClassName}
      interactive={interactive}
    />
  );
}
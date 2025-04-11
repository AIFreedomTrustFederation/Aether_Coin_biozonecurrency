import React, { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Simplified props interface to avoid type conflicts 
export interface TouchableProps {
  variant?: 'default' | 'subtle' | 'ghost';
  scale?: number;
  feedback?: boolean;
  delayPressIn?: number;
  className?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  form?: string;
  id?: string;
  name?: string;
  value?: string | number;
  tabIndex?: number;
  'aria-label'?: string;
}

const Touchable = forwardRef<HTMLButtonElement, TouchableProps>(
  (
    {
      variant = 'default',
      scale = 0.97,
      feedback = true,
      delayPressIn = 0,
      className,
      children,
      onClick,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const [isPressed, setIsPressed] = useState(false);

    const getVariantStyles = (): string => {
      switch (variant) {
        case 'subtle':
          return 'bg-muted/80 hover:bg-muted active:bg-muted/90';
        case 'ghost':
          return 'hover:bg-accent/15 active:bg-accent/30';
        default:
          return 'bg-primary/90 hover:bg-primary active:bg-primary/80 text-primary-foreground';
      }
    };

    const handlePressIn = () => {
      if (feedback && !disabled) {
        setTimeout(() => {
          setIsPressed(true);
        }, delayPressIn);
      }
    };

    const handlePressOut = () => {
      if (feedback) {
        setIsPressed(false);
      }
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          'rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          getVariantStyles(),
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        animate={{
          scale: isPressed ? scale : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
        onTouchStart={handlePressIn}
        onTouchEnd={handlePressOut}
        onTouchCancel={handlePressOut}
        onMouseDown={handlePressIn}
        onMouseUp={handlePressOut}
        onMouseLeave={handlePressOut}
        onClick={onClick}
        disabled={disabled}
        type={type}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Touchable.displayName = 'Touchable';

export { Touchable };
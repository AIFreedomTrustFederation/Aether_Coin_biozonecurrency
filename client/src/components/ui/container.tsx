import * as React from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "card" | "hero" | "section" | "full";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

const containerSizeClassMap = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-full",
};

const containerPaddingClassMap = {
  none: "px-0",
  sm: "px-4",
  md: "px-6",
  lg: "px-8",
  xl: "px-10",
};

const containerVariantClassMap = {
  default: "mx-auto",
  card: "mx-auto bg-card text-card-foreground rounded-lg shadow-sm",
  hero: "mx-auto bg-background",
  section: "mx-auto",
  full: "w-full",
};

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ 
    className, 
    children, 
    variant = "default", 
    size = "xl", 
    padding = "md", 
    ...props 
  }, ref) => {
    const sizeClass = containerSizeClassMap[size];
    const paddingClass = containerPaddingClassMap[padding];
    const variantClass = containerVariantClassMap[variant];

    return (
      <div
        ref={ref}
        className={cn(sizeClass, paddingClass, variantClass, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";

export { Container };
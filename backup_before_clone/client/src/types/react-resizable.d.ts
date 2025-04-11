declare module 'react-resizable' {
  import * as React from 'react';
  
  export interface ResizableBoxProps extends React.HTMLAttributes<HTMLDivElement> {
    width: number;
    height: number;
    axis?: 'both' | 'x' | 'y' | 'none';
    handle?: React.ReactNode;
    handleSize?: [number, number];
    lockAspectRatio?: boolean;
    maxConstraints?: [number, number];
    minConstraints?: [number, number];
    onResizeStart?: (e: React.SyntheticEvent, data: ResizeCallbackData) => any;
    onResize?: (e: React.SyntheticEvent, data: ResizeCallbackData) => any;
    onResizeStop?: (e: React.SyntheticEvent, data: ResizeCallbackData) => any;
    resizeHandles?: Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'>;
    transformScale?: number;
  }
  
  export interface ResizeCallbackData {
    node: HTMLElement;
    size: { width: number; height: number };
    handle: string;
  }
  
  export class ResizableBox extends React.Component<ResizableBoxProps> {}
  
  export interface ResizableProps {
    width: number;
    height: number;
    handle?: React.ReactNode;
    handleSize?: [number, number];
    lockAspectRatio?: boolean;
    axis?: 'both' | 'x' | 'y' | 'none';
    minConstraints?: [number, number];
    maxConstraints?: [number, number];
    onResizeStop?: (e: React.SyntheticEvent, data: ResizeCallbackData) => any;
    onResizeStart?: (e: React.SyntheticEvent, data: ResizeCallbackData) => any;
    onResize?: (e: React.SyntheticEvent, data: ResizeCallbackData) => any;
    transformScale?: number;
    resizeHandles?: Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'>;
    draggableOpts?: any;
  }
  
  export class Resizable extends React.Component<ResizableProps> {}
}
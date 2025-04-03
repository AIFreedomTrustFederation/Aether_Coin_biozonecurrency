// Base widget interface
export interface Widget {
  id: string;
  type: string;
  name: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config: Record<string, any>;
}

// Widget template interface for the catalog
export interface WidgetTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  defaultConfig: Record<string, any>;
  defaultSize: {
    w: number;
    h: number;
  };
  icon?: React.ComponentType<{ className?: string }>;
}

// Widget category
export interface WidgetCategory {
  id: string;
  name: string;
  description: string;
}

// Widget configurations for specific widget types
export interface PriceChartConfig {
  symbol?: string;
  timeframe?: string;
  indicators?: string[];
}

export interface WalletBalanceConfig {
  addresses?: string[];
  showFiat?: boolean;
  showChange?: boolean;
}

export interface TransactionFeedConfig {
  limit?: number;
  showDetails?: boolean;
}

export interface AiMonitorConfig {
  alertLevel?: 'low' | 'medium' | 'high';
  showRecommendations?: boolean;
}

export interface NewsFeedConfig {
  sources?: string[];
  limit?: number;
  refreshInterval?: number;
}

export interface GasTrackerConfig {
  networks?: string[];
  refreshInterval?: number;
}

export interface QuantumValidatorConfig {
  scanInterval?: number;
  alertThreshold?: 'low' | 'medium' | 'high';
}

// Dashboard interface
export interface Dashboard {
  id: string;
  name: string;
  userId: string;
  widgets: Widget[];
  layout: any;
  createdAt: string;
  updatedAt: string;
}

// Type guard to check if a widget is of a specific type
export function isWidgetType<T>(
  widget: Widget,
  type: string
): widget is Widget & { config: T } {
  return widget.type === type;
}
import React from 'react';
import { Widget } from '@/types/widget';

// Import all widget components
import PriceChartWidget from './PriceChartWidget';
import WalletBalanceWidget from './WalletBalanceWidget';
import TransactionFeedWidget from './TransactionFeedWidget';
import AiMonitorWidget from './AiMonitorWidget';
import NewsFeedWidget from './NewsFeedWidget';
import GasTrackerWidget from './GasTrackerWidget';
import QuantumValidatorWidget from './QuantumValidatorWidget';

export interface WidgetProps {
  widget: Widget;
  isEditing?: boolean;
  onConfigChange?: (config: any) => void;
  onRemove?: () => void;
}

// Widget type to component mapping
const widgetComponents: Record<string, React.FC<WidgetProps>> = {
  'price-chart': PriceChartWidget,
  'wallet-balance': WalletBalanceWidget,
  'transaction-feed': TransactionFeedWidget,
  'ai-monitor': AiMonitorWidget,
  'news-feed': NewsFeedWidget,
  'gas-tracker': GasTrackerWidget,
  'quantum-validator': QuantumValidatorWidget
};

export const getWidgetComponent = (type: string): React.FC<WidgetProps> => {
  return widgetComponents[type] || DefaultWidget;
};

// Fallback widget for unknown types
const DefaultWidget: React.FC<WidgetProps> = ({ widget }) => {
  return (
    <div className="border rounded-lg p-4 text-center">
      <h3 className="font-medium">Unknown Widget Type</h3>
      <p className="text-sm text-muted-foreground mt-2">
        Widget type '{widget.type}' is not registered.
      </p>
    </div>
  );
};

export default widgetComponents;
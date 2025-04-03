import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WidgetProps } from './WidgetRegistry';
import { isWidgetType } from '@/types/widget';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Newspaper,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Bookmark,
  RefreshCw
} from 'lucide-react';

// Sample news data
const sampleNews = [
  {
    id: 'news1',
    title: 'Bitcoin Surges Past $44K, Analysts Point to ETF Approval Rumors',
    summary: 'Bitcoin has seen a remarkable 8% gain in the last 24 hours, pushing above $44,000 for the first time since...',
    source: 'CryptoNews',
    url: 'https://cryptonews.com/bitcoin-surge-44k',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    sentiment: 'bullish',
    category: 'market',
    coins: ['BTC', 'ETH'],
    image: 'https://example.com/btc-chart.jpg'
  },
  {
    id: 'news2',
    title: 'Ethereum Layer 2 Solutions Report 400% Growth in Users This Quarter',
    summary: 'Ethereum scaling solutions have seen unprecedented adoption in Q1 2025, with Optimism and Arbitrum leading the charge with a combined...',
    source: 'BlockchainInsider',
    url: 'https://blockchaininsider.com/ethereum-l2-growth',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    sentiment: 'bullish',
    category: 'technology',
    coins: ['ETH', 'OP', 'ARB'],
    image: 'https://example.com/ethereum-network.jpg'
  },
  {
    id: 'news3',
    title: 'New Regulations Could Impact DeFi Platforms, Experts Warn',
    summary: 'A proposed regulatory framework could bring significant compliance challenges for decentralized finance protocols, according to legal experts...',
    source: 'CoinDesk',
    url: 'https://coindesk.com/defi-regulation-impact',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    sentiment: 'bearish',
    category: 'regulation',
    coins: ['AAVE', 'UNI', 'COMP'],
    image: 'https://example.com/defi-regulation.jpg'
  },
  {
    id: 'news4',
    title: 'Solana Faces Network Congestion Amid NFT Launch Frenzy',
    summary: 'The Solana blockchain experienced temporary slowdowns yesterday as a highly anticipated NFT collection launch led to unprecedented network traffic...',
    source: 'NFTNow',
    url: 'https://nftnow.com/solana-congestion',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    sentiment: 'neutral',
    category: 'technology',
    coins: ['SOL'],
    image: 'https://example.com/solana-network.jpg'
  },
  {
    id: 'news5',
    title: 'Leading Central Banks Accelerate CBDC Development Plans',
    summary: 'Central banks from major economies have announced accelerated timelines for their central bank digital currency projects, citing concerns about stablecoins and...',
    source: 'Financial Times',
    url: 'https://ft.com/cbdc-development',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    sentiment: 'neutral',
    category: 'regulation',
    coins: ['USDC', 'USDT', 'DAI'],
    image: 'https://example.com/cbdc-concept.jpg'
  },
  {
    id: 'news6',
    title: 'Major Security Vulnerability Patched in Popular Wallet Software',
    summary: 'A critical security update has been released for users of a widely used cryptocurrency wallet after researchers discovered a vulnerability that could potentially...',
    source: 'CryptoSecurity',
    url: 'https://cryptosecurity.com/wallet-vulnerability',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36), // 1.5 days ago
    sentiment: 'bearish',
    category: 'security',
    coins: [],
    image: 'https://example.com/security-update.jpg'
  }
];

// Format relative time
const formatRelativeTime = (timestamp: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) {
    return `${diffDay}d ago`;
  } else if (diffHour > 0) {
    return `${diffHour}h ago`;
  } else if (diffMin > 0) {
    return `${diffMin}m ago`;
  } else {
    return 'Just now';
  }
};

const NewsFeedWidget: React.FC<WidgetProps> = ({ widget, isEditing, onConfigChange }) => {
  // Type guard
  if (!isWidgetType(widget, 'news-feed')) {
    return <div>Invalid widget configuration</div>;
  }
  
  // Default config values
  const sources = widget.config.sources || [];
  const limit = widget.config.limit || 5;
  const refreshInterval = widget.config.refreshInterval || 15;
  const categories = widget.config.categories || [];
  const sentiment = widget.config.sentiment || 'all';
  
  // Local state for editing
  const [editSettings, setEditSettings] = useState({
    sources: [...sources],
    limit,
    refreshInterval,
    categories: [...categories],
    sentiment,
  });
  
  // Handle settings change
  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...editSettings, [key]: value };
    setEditSettings(newSettings);
    
    if (onConfigChange) {
      onConfigChange(newSettings);
    }
  };
  
  // Filter news based on settings
  const filteredNews = sampleNews
    .filter(news => {
      // Filter by sources
      if (editSettings.sources.length > 0 && !editSettings.sources.includes(news.source)) {
        return false;
      }
      
      // Filter by category
      if (editSettings.categories.length > 0 && !editSettings.categories.includes(news.category)) {
        return false;
      }
      
      // Filter by sentiment
      if (editSettings.sentiment !== 'all' && news.sentiment !== editSettings.sentiment) {
        return false;
      }
      
      return true;
    })
    .slice(0, editSettings.limit);
  
  // Available sources and categories
  const availableSources = Array.from(new Set(sampleNews.map(news => news.source)));
  const availableCategories = Array.from(new Set(sampleNews.map(news => news.category)));
  
  // Get sentiment icon
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  // Get category badge
  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      market: 'bg-blue-100 text-blue-800',
      technology: 'bg-purple-100 text-purple-800',
      regulation: 'bg-amber-100 text-amber-800',
      security: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={`text-xs ${colors[category] || 'bg-gray-100 text-gray-800'}`}>
        {category}
      </Badge>
    );
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 pt-4 px-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Crypto News</h3>
          </div>
          
          {!isEditing && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => {/* Would refresh feed */}}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="limit">Number of articles: {editSettings.limit}</Label>
              </div>
              <Slider 
                id="limit"
                min={1}
                max={10}
                step={1}
                value={[editSettings.limit]}
                onValueChange={(value) => handleSettingChange('limit', value[0])}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="refreshInterval">Refresh Interval (minutes): {editSettings.refreshInterval}</Label>
              <Slider 
                id="refreshInterval"
                min={5}
                max={60}
                step={5}
                value={[editSettings.refreshInterval]}
                onValueChange={(value) => handleSettingChange('refreshInterval', value[0])}
              />
            </div>
            
            <div className="space-y-2">
              <Label>News Sources</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableSources.map((source) => (
                  <div key={source} className="flex items-center space-x-2">
                    <Checkbox
                      id={`source-${source}`}
                      checked={editSettings.sources.includes(source)}
                      onCheckedChange={(checked) => {
                        const sources = checked 
                          ? [...editSettings.sources, source]
                          : editSettings.sources.filter(s => s !== source);
                        handleSettingChange('sources', sources);
                      }}
                    />
                    <Label htmlFor={`source-${source}`}>{source}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={editSettings.categories.includes(category)}
                      onCheckedChange={(checked) => {
                        const categories = checked 
                          ? [...editSettings.categories, category]
                          : editSettings.categories.filter(c => c !== category);
                        handleSettingChange('categories', categories);
                      }}
                    />
                    <Label htmlFor={`category-${category}`}>{category}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sentiment">Sentiment Filter</Label>
              <Select 
                value={editSettings.sentiment} 
                onValueChange={(value) => handleSettingChange('sentiment', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by sentiment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All News</SelectItem>
                  <SelectItem value="bullish">Bullish Only</SelectItem>
                  <SelectItem value="bearish">Bearish Only</SelectItem>
                  <SelectItem value="neutral">Neutral Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100%-2rem)]">
            <div className="space-y-3 pr-3">
              {filteredNews.length > 0 ? (
                filteredNews.map((news) => (
                  <div key={news.id} className="space-y-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm line-clamp-2">{news.title}</h4>
                      {getSentimentIcon(news.sentiment)}
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {news.summary}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{news.source}</span>
                        {getCategoryBadge(news.category)}
                      </div>
                      <span className="text-muted-foreground">
                        {formatRelativeTime(news.timestamp)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex gap-1">
                        {news.coins.slice(0, 3).map((coin) => (
                          <Badge key={coin} variant="outline" className="text-xs">
                            {coin}
                          </Badge>
                        ))}
                        {news.coins.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{news.coins.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs"
                        asChild
                      >
                        <a href={news.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Read
                        </a>
                      </Button>
                    </div>
                    
                    {/* Divider except for last item */}
                    {news.id !== filteredNews[filteredNews.length - 1].id && (
                      <div className="h-px bg-muted my-2" />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No news articles match your current filters
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsFeedWidget;
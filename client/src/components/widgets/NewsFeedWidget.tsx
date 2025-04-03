import React, { useState, useEffect } from 'react';
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
import { useQuery } from '@tanstack/react-query';
import { 
  Newspaper,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Bookmark,
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react';

// Interface for news data
interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  timestamp: Date;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  category: string;
  coins: string[];
  image?: string;
}

// Interface for CryptoCompare API response
interface CryptoCompareNewsResponse {
  Type: number;
  Message: string;
  Data: Array<{
    id: string;
    guid: string;
    published_on: number;
    imageurl: string;
    title: string;
    url: string;
    body: string;
    tags: string;
    categories: string;
    upvotes: string;
    downvotes: string;
    lang: string;
    source: string;
    source_info: {
      name: string;
      img: string;
      lang: string;
    };
  }>;
}

// Fallback sample news data in case of API failure
const fallbackNews: NewsArticle[] = [
  {
    id: 'fallback1',
    title: 'No news data available at the moment',
    summary: 'Please check your connection and try again later. This is a placeholder while we try to reconnect to the news service.',
    source: 'System',
    url: '#',
    timestamp: new Date(),
    sentiment: 'neutral',
    category: 'system',
    coins: [],
    image: ''
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
  
  // Fetch cryptocurrency news from the API
  const {
    data: newsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/services/cryptocompare/news', editSettings.limit],
    queryFn: async () => {
      const response = await fetch(`/api/services/cryptocompare/news?limit=${editSettings.limit * 2}`);
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      return response.json() as Promise<CryptoCompareNewsResponse>;
    },
    // Refresh every X minutes where X is the user's refresh interval setting
    refetchInterval: editSettings.refreshInterval * 60 * 1000,
  });

  // Process and transform the news data
  const processedNews = React.useMemo((): NewsArticle[] => {
    if (!newsData?.Data || newsData.Data.length === 0) {
      return fallbackNews;
    }

    return newsData.Data.map(article => {
      // Extract coins mentioned in the article
      const coinMentions = extractCoinMentions(article.title + ' ' + article.body);
      
      // Determine article sentiment based on content analysis
      const sentiment = determineSentiment(article.title, article.body);
      
      // Determine primary category
      const categories = article.categories ? article.categories.split('|') : [];
      const primaryCategory = determinePrimaryCategory(categories);

      return {
        id: article.id,
        title: article.title,
        summary: extractSummary(article.body),
        source: article.source_info.name,
        url: article.url,
        timestamp: new Date(article.published_on * 1000),
        sentiment,
        category: primaryCategory,
        coins: coinMentions,
        image: article.imageurl
      };
    });
  }, [newsData]);

  // Helper function to extract a summary from the full article body
  const extractSummary = (body: string): string => {
    // Get first ~200 characters, trying to end at a sentence
    const maxLength = 200;
    if (body.length <= maxLength) return body;
    
    let summary = body.substring(0, maxLength);
    const lastPeriod = summary.lastIndexOf('.');
    if (lastPeriod > maxLength / 2) {
      summary = summary.substring(0, lastPeriod + 1);
    } else {
      // If no good sentence break, just add ellipsis
      summary += '...';
    }
    return summary;
  };

  // Helper function to extract coin mentions from text
  const extractCoinMentions = (text: string): string[] => {
    const commonCoins = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'ADA', 'AVAX', 'DOGE', 'DOT', 
      'MATIC', 'LINK', 'UNI', 'LTC', 'SHIB', 'TRX', 'DAI', 'ATOM', 'BCH'];
    
    const mentions = commonCoins.filter(coin => 
      text.toUpperCase().includes(coin) || 
      text.includes(getCoinName(coin))
    );
    
    return mentions;
  };

  // Helper to get full coin name
  const getCoinName = (symbol: string): string => {
    const coinNames: Record<string, string> = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'USDT': 'Tether',
      'BNB': 'Binance',
      'SOL': 'Solana',
      'XRP': 'Ripple',
      'ADA': 'Cardano',
      'AVAX': 'Avalanche',
      'DOGE': 'Dogecoin',
      'DOT': 'Polkadot',
      'MATIC': 'Polygon',
      'LINK': 'Chainlink',
      'UNI': 'Uniswap',
      'LTC': 'Litecoin',
      'SHIB': 'Shiba Inu',
      'TRX': 'Tron',
      'DAI': 'Dai',
      'ATOM': 'Cosmos',
      'BCH': 'Bitcoin Cash'
    };
    return coinNames[symbol] || symbol;
  };

  // Naive sentiment analysis based on keywords
  const determineSentiment = (title: string, body: string): 'bullish' | 'bearish' | 'neutral' => {
    const text = (title + ' ' + body).toLowerCase();
    
    const bullishTerms = ['surge', 'soar', 'gain', 'rally', 'bull', 'bullish', 'rise', 'uptrend', 'increase', 'growth'];
    const bearishTerms = ['drop', 'fall', 'crash', 'bear', 'bearish', 'decline', 'dump', 'sink', 'plummet', 'collapse'];
    
    const bullishCount = bullishTerms.filter(term => text.includes(term)).length;
    const bearishCount = bearishTerms.filter(term => text.includes(term)).length;
    
    if (bullishCount > bearishCount) return 'bullish';
    if (bearishCount > bullishCount) return 'bearish';
    return 'neutral';
  };

  // Determine primary category from a list of categories
  const determinePrimaryCategory = (categories: string[]): string => {
    const categoryMap: Record<string, string> = {
      'MARKET': 'market',
      'BLOCKCHAIN': 'technology',
      'TECHNOLOGY': 'technology',
      'REGULATION': 'regulation',
      'MINING': 'technology',
      'TRADING': 'market',
      'DEFI': 'technology',
      'NFT': 'technology',
      'BUSINESS': 'market',
      'SPONSORED': 'sponsored',
      'ICO': 'market',
      'EXCHANGE': 'market',
      'SECURITY': 'security'
    };
    
    // Look for known categories
    for (const category of categories) {
      const normalized = category.trim().toUpperCase();
      if (categoryMap[normalized]) {
        return categoryMap[normalized];
      }
    }
    
    // Default to 'other' if no match
    return 'other';
  };

  // Filter news based on settings
  const filteredNews = processedNews
    .filter((news: NewsArticle) => {
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
  
  // Available sources and categories from all news data
  const availableSources = Array.from(new Set(processedNews.map((news: NewsArticle) => news.source)));
  const availableCategories = Array.from(new Set(processedNews.map((news: NewsArticle) => news.category)));
  
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
                filteredNews.map((news: NewsArticle) => (
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
                        {news.coins.slice(0, 3).map((coin: string) => (
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
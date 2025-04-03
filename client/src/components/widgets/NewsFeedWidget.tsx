import React, { useState } from 'react';
import { WidgetProps } from './WidgetRegistry';
import { NewsFeedConfig } from '@/types/widget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw, Newspaper, Calendar, ExternalLink, MessageCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Mock news data (would come from API in real implementation)
const NEWS_DATA = [
  {
    id: 'news1',
    title: 'Ethereum 3.0 Upgrade on Track for July Release',
    summary: 'The much-anticipated Ethereum 3.0 upgrade, codenamed "Quantum Leap," is on schedule for its July release, promising significant improvements in scalability and reduced energy consumption.',
    source: 'CoinDesk',
    url: 'https://coindesk.com/ethereum-3-upgrade',
    publishedAt: new Date('2025-04-03T08:15:00Z'),
    category: 'technology',
    sentiment: 'positive',
    relatedAssets: ['ETH']
  },
  {
    id: 'news2',
    title: 'Bitcoin Surges Past $100K Amid Institutional Adoption',
    summary: 'Bitcoin has broken the $100,000 barrier for the first time, as more financial institutions add the cryptocurrency to their balance sheets and treasury reserves.',
    source: 'CoinTelegraph',
    url: 'https://cointelegraph.com/bitcoin-100k-milestone',
    publishedAt: new Date('2025-04-02T16:30:22Z'),
    category: 'markets',
    sentiment: 'positive',
    relatedAssets: ['BTC']
  },
  {
    id: 'news3',
    title: 'Central Banks of G7 Nations Explore CBDC Integration',
    summary: 'The central banks of G7 nations announced a collaborative framework for integrating their central bank digital currencies (CBDCs) to facilitate cross-border payments.',
    source: 'Bloomberg Crypto',
    url: 'https://bloomberg.com/g7-cbdc-integration',
    publishedAt: new Date('2025-04-02T12:45:15Z'),
    category: 'regulation',
    sentiment: 'neutral',
    relatedAssets: []
  },
  {
    id: 'news4',
    title: 'Solana DeFi Protocol Surpasses $50B in Total Value Locked',
    summary: 'A leading Solana-based DeFi protocol has exceeded $50 billion in total value locked (TVL), signaling growing confidence in the Solana ecosystem despite earlier technical challenges.',
    source: 'DeFi Pulse',
    url: 'https://defipulse.com/solana-protocol-milestone',
    publishedAt: new Date('2025-04-01T21:10:30Z'),
    category: 'defi',
    sentiment: 'positive',
    relatedAssets: ['SOL']
  },
  {
    id: 'news5',
    title: 'New Regulatory Framework for Crypto in EU Takes Effect',
    summary: 'The European Union\'s comprehensive regulatory framework for cryptocurrencies, known as MiCA 2.0, has officially taken effect, providing clarity for businesses operating in the space.',
    source: 'Crypto Briefing',
    url: 'https://cryptobriefing.com/eu-mica-framework',
    publishedAt: new Date('2025-04-01T09:20:45Z'),
    category: 'regulation',
    sentiment: 'neutral',
    relatedAssets: []
  },
  {
    id: 'news6',
    title: 'Major Security Vulnerability Patched in Popular DeFi Protocol',
    summary: 'Developers of a leading DeFi protocol have patched a critical security vulnerability that could have led to the loss of user funds. No assets were compromised before the fix was implemented.',
    source: 'CoinDesk',
    url: 'https://coindesk.com/defi-vulnerability-patched',
    publishedAt: new Date('2025-03-31T14:05:12Z'),
    category: 'security',
    sentiment: 'negative',
    relatedAssets: []
  }
];

const NewsFeedWidget: React.FC<WidgetProps> = ({ widget }) => {
  const config = widget.config as NewsFeedConfig;
  const sources = config.sources || ['coindesk', 'cointelegraph'];
  const limit = config.limit || 5;
  const refreshInterval = config.refreshInterval || 30;
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter news by sources and limit
  const filteredNews = NEWS_DATA
    .filter(news => sources.some(source => 
      news.source.toLowerCase().includes(source.toLowerCase())
    ))
    .slice(0, limit);
  
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60); // minutes
    
    if (diff < 60) {
      return `${diff}m ago`;
    } else if (diff < 1440) {
      return `${Math.floor(diff / 60)}h ago`;
    } else {
      return `${Math.floor(diff / 1440)}d ago`;
    }
  };
  
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Newspaper className="h-5 w-5 mr-2" />
            Crypto News
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 overflow-auto">
        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, idx) => (
              <div key={idx} className="flex flex-col space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex space-x-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Newspaper className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="font-medium">No News Available</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try adding more news sources or check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNews.map(news => (
              <div key={news.id} className="border-b border-muted pb-3 last:border-0 last:pb-0">
                <div className="space-y-2">
                  <a 
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:text-primary flex items-start"
                  >
                    {news.title}
                    <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0 mt-1" />
                  </a>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {news.summary}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatTime(news.publishedAt)}
                    </span>
                    <span>•</span>
                    <span>{news.source}</span>
                    
                    {news.sentiment && (
                      <>
                        <span>•</span>
                        <Badge variant="outline" className={`text-[10px] px-1 ${getSentimentColor(news.sentiment)}`}>
                          {news.sentiment}
                        </Badge>
                      </>
                    )}
                    
                    {news.relatedAssets.length > 0 && (
                      <>
                        <span>•</span>
                        {news.relatedAssets.map(asset => (
                          <Badge key={asset} variant="secondary" className="text-[10px] px-1">
                            {asset}
                          </Badge>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground text-center mt-4">
          Updated every {refreshInterval} minutes
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsFeedWidget;
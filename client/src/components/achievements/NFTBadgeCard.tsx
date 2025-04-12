import React from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Medal } from 'lucide-react';

interface NFTBadgeCardProps {
  badge: {
    id: number;
    achievementId: number;
    tokenId: string;
    metadata: {
      name: string;
      description: string;
      attributes: Array<{
        trait_type: string;
        value: string;
      }>;
    };
    imageUrl: string;
    badgeRarity: string;
    mintedAt: string;
    contractAddress: string;
    chainId: number;
  };
  onViewOnBlockchain: () => void;
}

const getRarityColor = (rarity: string) => {
  switch (rarity.toLowerCase()) {
    case 'common':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'uncommon':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'rare':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'epic':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'legendary':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'mythic':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const NFTBadgeCard: React.FC<NFTBadgeCardProps> = ({ badge, onViewOnBlockchain }) => {
  const rarityColor = getRarityColor(badge.badgeRarity);
  
  return (
    <Card className="overflow-hidden border-2 border-amber-300 hover:shadow-md transition-shadow duration-200">
      <div className="relative">
        <div className="aspect-[1/1] bg-slate-100 overflow-hidden">
          {badge.imageUrl ? (
            <img 
              src={badge.imageUrl} 
              alt={badge.metadata.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Medal className="h-12 w-12 text-amber-400" />
            </div>
          )}
        </div>
        
        <Badge className={`absolute top-2 right-2 ${rarityColor}`}>
          {badge.badgeRarity}
        </Badge>
      </div>
      
      <CardContent className="pt-4">
        <h3 className="font-semibold text-sm mb-1 truncate">{badge.metadata.name}</h3>
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{badge.metadata.description}</p>
        
        <div className="grid grid-cols-2 gap-1 mt-2">
          {badge.metadata.attributes.slice(0, 4).map((attr, index) => (
            <div key={index} className="text-xs">
              <span className="text-gray-500">{attr.trait_type}:</span>
              <span className="ml-1 font-medium">{attr.value}</span>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          Minted: {formatDate(badge.mintedAt)}
        </div>
        
        <div className="text-xs text-gray-500 mt-1 truncate">
          Token ID: {badge.tokenId.slice(0, 10)}...
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          variant="outline" 
          size="sm"
          className="w-full text-xs flex items-center gap-1"
          onClick={onViewOnBlockchain}
        >
          <ExternalLink className="h-3 w-3" />
          View on Blockchain
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NFTBadgeCard;
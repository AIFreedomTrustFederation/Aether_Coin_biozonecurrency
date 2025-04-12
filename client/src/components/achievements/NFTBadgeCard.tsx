import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Medal } from "lucide-react";

interface NFTBadgeCardProps {
  badge: {
    id: number;
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

const NFTBadgeCard: React.FC<NFTBadgeCardProps> = ({ badge, onViewOnBlockchain }) => {
  const { 
    tokenId,
    metadata,
    imageUrl,
    badgeRarity,
    mintedAt
  } = badge;

  // Rarity colors
  const rarityColors = {
    common: "bg-gray-100 text-gray-800 border-gray-200",
    uncommon: "bg-green-100 text-green-800 border-green-200",
    rare: "bg-blue-100 text-blue-800 border-blue-200",
    epic: "bg-purple-100 text-purple-800 border-purple-200",
    legendary: "bg-amber-100 text-amber-800 border-amber-200",
    mythic: "bg-red-100 text-red-800 border-red-200",
  };

  const rarityColor = rarityColors[badgeRarity.toLowerCase()] || rarityColors.common;
  
  return (
    <Card className="overflow-hidden border-2 border-forest-200 hover:shadow-md transition-all duration-300">
      <div className="relative">
        <div className="h-40 bg-gradient-to-br from-forest-50 to-forest-100 flex items-center justify-center">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={metadata.name} 
              className="h-full w-full object-cover" 
            />
          ) : (
            <Medal className="h-16 w-16 text-forest-400" />
          )}
        </div>
        
        <div className="absolute top-2 right-2">
          <Badge className={rarityColor}>
            {badgeRarity}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-3">
        <h3 className="font-semibold text-forest-800 truncate">
          {metadata.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Token ID: {tokenId.slice(0, 8)}...{tokenId.slice(-4)}
        </p>
        {mintedAt && (
          <p className="text-xs text-gray-500 mt-1">
            Minted: {new Date(mintedAt).toLocaleDateString()}
          </p>
        )}
      </CardContent>
      
      <CardFooter className="p-3 pt-0">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-xs" 
          onClick={onViewOnBlockchain}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          View on Blockchain
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NFTBadgeCard;
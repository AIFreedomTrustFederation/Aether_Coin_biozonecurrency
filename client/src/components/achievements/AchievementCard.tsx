import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Check, Lock } from "lucide-react";

interface AchievementCardProps {
  achievement: {
    id: number;
    name: string;
    description: string;
    category: string;
    difficulty: string;
    pointsValue: number;
    imageUrl: string;
    requirementDescription: string;
  };
  earned: boolean;
  userAchievement?: any;
  categoryIcon: React.ReactNode;
  difficultyClass: string;
  onMintNFT: (achievementId: number) => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  earned,
  userAchievement,
  categoryIcon,
  difficultyClass,
  onMintNFT,
}) => {
  const {
    id,
    name,
    description,
    difficulty,
    pointsValue,
    imageUrl,
    requirementDescription,
  } = achievement;

  // Determine if the achievement NFT has been minted
  const nftMinted = earned && userAchievement?.nftMinted;

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${
      earned ? "border-forest-500 shadow-md" : "opacity-75"
    }`}>
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-forest-100 to-forest-200 flex items-center justify-center">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={name} 
              className="h-full w-full object-cover" 
            />
          ) : (
            <Award className="h-20 w-20 text-forest-400" />
          )}
        </div>
        
        {earned && (
          <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1">
            <Check className="h-5 w-5" />
          </div>
        )}
        
        {!earned && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <Lock className="h-12 w-12 text-white opacity-75" />
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold line-clamp-2">{name}</CardTitle>
          <div className="flex-shrink-0">
            {categoryIcon}
          </div>
        </div>
        <div className="flex items-center justify-between mt-1">
          <Badge className={difficultyClass}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Badge>
          <span className="text-sm font-semibold text-amber-600">+{pointsValue} pts</span>
        </div>
      </CardHeader>
      
      <CardContent>
        <CardDescription className="line-clamp-2 mb-2">{description}</CardDescription>
        <div className="text-xs text-gray-500 border-t pt-2">
          <strong>Requirement:</strong> {requirementDescription}
        </div>
      </CardContent>
      
      {earned && (
        <CardFooter className="pt-0">
          <div className="w-full">
            {earned && !nftMinted && (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => onMintNFT(id)}
              >
                <Award className="mr-2 h-4 w-4" />
                Mint NFT Badge
              </Button>
            )}
            {nftMinted && (
              <div className="flex justify-center text-sm text-green-600 font-medium">
                <Award className="mr-2 h-4 w-4" />
                NFT Badge Minted
              </div>
            )}
            <div className="text-xs text-center text-gray-500 mt-1">
              Earned on {userAchievement?.dateEarned ? new Date(userAchievement.dateEarned).toLocaleDateString() : 'Unknown'}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default AchievementCard;
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Lock, Medal } from 'lucide-react';

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
  userAchievement?: {
    id: number;
    userId: number;
    achievementId: number;
    dateEarned: string;
    nftTokenId?: string;
    nftMinted: boolean;
    transactionHash?: string;
  };
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
  onMintNFT
}) => {
  const canMintNFT = earned && userAchievement && !userAchievement.nftMinted;
  
  return (
    <Card className={earned ? "border-2 border-forest-400" : ""}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center mb-2">
          <Badge variant="outline" className={`${difficultyClass} flex items-center gap-1`}>
            <Medal className="h-3 w-3" />
            {achievement.difficulty}
          </Badge>
          
          <Badge variant="outline" className="bg-slate-100 flex items-center gap-1">
            {categoryIcon}
            {achievement.category.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </Badge>
        </div>
        <CardTitle className="flex items-center gap-2 text-lg">
          {earned && <CheckCircle className="h-5 w-5 text-green-500" />}
          {achievement.name}
        </CardTitle>
        <CardDescription>{achievement.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="text-sm mb-2">
          <span className="font-medium">Required: </span>
          {achievement.requirementDescription}
        </div>
        
        <div className="aspect-[4/3] bg-slate-100 rounded-md overflow-hidden mb-2 flex items-center justify-center">
          {achievement.imageUrl ? (
            <img 
              src={achievement.imageUrl} 
              alt={achievement.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-400 flex flex-col items-center">
              <Medal className="h-12 w-12 mb-2" />
              <span>Achievement Badge</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center">
            <span className="font-medium text-forest-800">{achievement.pointsValue}</span>
            <span className="ml-1 text-sm text-gray-500">points</span>
          </div>
          
          {earned && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Earned {userAchievement?.dateEarned ? new Date(userAchievement.dateEarned).toLocaleDateString() : ''}
            </Badge>
          )}
          
          {!earned && (
            <Badge variant="outline" className="text-gray-400 border-gray-200 flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Locked
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        {canMintNFT && (
          <Button 
            onClick={() => onMintNFT(achievement.id)}
            className="w-full bg-amber-500 hover:bg-amber-600"
          >
            Mint as NFT Badge
          </Button>
        )}
        
        {earned && userAchievement?.nftMinted && (
          <Button 
            variant="outline" 
            className="w-full border-forest-200 text-forest-800"
            disabled
          >
            NFT Badge Minted
          </Button>
        )}
        
        {!earned && (
          <Button 
            variant="outline" 
            className="w-full text-gray-500"
            disabled
          >
            Complete to unlock
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AchievementCard;
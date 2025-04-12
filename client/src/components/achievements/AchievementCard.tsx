import React from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Check, Gem, Lock, Medal } from 'lucide-react';

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

const getDifficultyInfo = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return { 
        label: 'Beginner', 
        class: 'bg-green-100 text-green-800 border-green-200',
        gems: 1
      };
    case 'intermediate':
      return { 
        label: 'Intermediate', 
        class: 'bg-blue-100 text-blue-800 border-blue-200',
        gems: 2
      };
    case 'advanced':
      return { 
        label: 'Advanced', 
        class: 'bg-purple-100 text-purple-800 border-purple-200',
        gems: 3
      };
    case 'expert':
      return { 
        label: 'Expert', 
        class: 'bg-amber-100 text-amber-800 border-amber-200',
        gems: 4
      };
    case 'master':
      return { 
        label: 'Master', 
        class: 'bg-red-100 text-red-800 border-red-200',
        gems: 5
      };
    default:
      return { 
        label: 'Unknown', 
        class: 'bg-gray-100 text-gray-800 border-gray-200',
        gems: 0
      };
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

const AchievementCard: React.FC<AchievementCardProps> = ({ 
  achievement, 
  earned, 
  userAchievement, 
  categoryIcon, 
  difficultyClass, 
  onMintNFT 
}) => {
  const difficultyInfo = getDifficultyInfo(achievement.difficulty);
  
  // Generate gem indicators based on difficulty
  const renderGems = () => {
    const gems = [];
    for (let i = 0; i < difficultyInfo.gems; i++) {
      gems.push(
        <Gem key={i} className="h-3 w-3 text-amber-500" />
      );
    }
    return (
      <div className="flex items-center gap-0.5">
        {gems}
      </div>
    );
  };

  return (
    <Card className={`overflow-hidden transition-all duration-200 ${
      earned 
        ? 'border-2 border-green-500 hover:shadow-md hover:shadow-green-100' 
        : 'border border-gray-200 opacity-75 hover:opacity-100'
    }`}>
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
          {achievement.imageUrl ? (
            <img 
              src={achievement.imageUrl} 
              alt={achievement.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <Award className="h-16 w-16 text-white" />
          )}
          
          {earned && (
            <div className="absolute top-0 right-0 m-2 rounded-full bg-green-500 p-1">
              <Check className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
        
        <Badge className={`absolute top-2 left-2 ${difficultyInfo.class}`}>
          {difficultyInfo.label}
        </Badge>
      </div>
      
      <CardHeader className="pt-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{achievement.name}</CardTitle>
          <div className="flex items-center gap-1">
            {categoryIcon}
            <span className="text-xs font-medium">{achievement.pointsValue} pts</span>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-1">
          {renderGems()}
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <CardDescription className="text-xs">
          {achievement.description}
        </CardDescription>
        
        <div className="mt-3 border-t pt-2">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Requirement:</span> {achievement.requirementDescription}
          </p>
        </div>
        
        {earned && userAchievement && (
          <div className="mt-2">
            <p className="text-xs text-green-600 font-medium">
              Earned on {formatDate(userAchievement.dateEarned)}
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        {earned ? (
          userAchievement?.nftMinted ? (
            <Button 
              variant="outline" 
              size="sm"
              className="w-full text-xs flex items-center gap-1"
              disabled
            >
              <Medal className="h-3 w-3" />
              NFT Badge Minted
            </Button>
          ) : (
            <Button 
              variant="default" 
              size="sm"
              className="w-full text-xs flex items-center gap-1"
              onClick={() => onMintNFT(achievement.id)}
            >
              <Medal className="h-3 w-3" />
              Mint NFT Badge
            </Button>
          )
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            className="w-full text-xs flex items-center gap-1"
            disabled
          >
            <Lock className="h-3 w-3" />
            Not Yet Earned
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AchievementCard;
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Unlock, Award, Shield, CheckCircle, Zap, Fingerprint } from "lucide-react";
import AchievementCard from "@/components/achievements/AchievementCard";
import NFTBadgeCard from "@/components/achievements/NFTBadgeCard";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

// Mock user ID (in a real app, this would come from authentication)
const CURRENT_USER_ID = 1;

// Achievement category icons
const categoryIcons = {
  account_security: <Shield className="h-5 w-5 text-blue-500" />,
  wallet_security: <Fingerprint className="h-5 w-5 text-indigo-500" />,
  communication_security: <Lock className="h-5 w-5 text-green-500" />,
  quantum_security: <Zap className="h-5 w-5 text-purple-500" />,
  transaction_security: <CheckCircle className="h-5 w-5 text-amber-500" />,
  node_operations: <Unlock className="h-5 w-5 text-red-500" />,
  special_events: <Award className="h-5 w-5 text-pink-500" />,
};

const difficultyColors = {
  beginner: "bg-green-100 text-green-800 border-green-200",
  intermediate: "bg-blue-100 text-blue-800 border-blue-200",
  advanced: "bg-purple-100 text-purple-800 border-purple-200",
  expert: "bg-amber-100 text-amber-800 border-amber-200",
  master: "bg-red-100 text-red-800 border-red-200",
};

const Achievements = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  
  // Fetch all achievements
  const { data: achievements, isLoading: isLoadingAchievements } = useQuery({
    queryKey: ['/api/achievements'],
    retry: 1,
  });
  
  // Fetch user's earned achievements
  const { data: userAchievements, isLoading: isLoadingUserAchievements } = useQuery({
    queryKey: ['/api/achievements/user', CURRENT_USER_ID],
    retry: 1,
    enabled: !!CURRENT_USER_ID,
  });
  
  // Fetch user's NFT badges
  const { data: nftBadges, isLoading: isLoadingBadges } = useQuery({
    queryKey: ['/api/nft-badges/user', CURRENT_USER_ID],
    retry: 1,
    enabled: !!CURRENT_USER_ID,
  });
  
  // Fetch user's security score
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/users', CURRENT_USER_ID],
    retry: 1,
    enabled: !!CURRENT_USER_ID,
  });

  // Filter achievements by category
  const filteredAchievements = achievements?.filter(achievement => 
    activeCategory === 'all' || achievement.category === activeCategory
  ) || [];
  
  // Calculate achievements stats
  const totalAchievements = achievements?.length || 0;
  const earnedAchievements = userAchievements?.length || 0;
  const completionPercentage = totalAchievements > 0 ? (earnedAchievements / totalAchievements) * 100 : 0;
  
  // Group achievements by category for the summary
  const achievementsByCategory = achievements?.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = {
        total: 0,
        earned: 0,
      };
    }
    acc[achievement.category].total += 1;
    return acc;
  }, {}) || {};
  
  // Count earned achievements by category
  userAchievements?.forEach(ua => {
    const category = ua.achievement.category;
    if (achievementsByCategory[category]) {
      achievementsByCategory[category].earned += 1;
    }
  });

  const isLoading = isLoadingAchievements || isLoadingUserAchievements || isLoadingBadges || isLoadingProfile;

  // This would be connected to your wallet system in a real implementation
  const handleMintNFT = async (achievementId) => {
    try {
      toast({
        title: "NFT Minting Initiated",
        description: "Your achievement badge is being minted as an NFT...",
      });
      
      // This would call your blockchain service to mint the NFT
      // For now, we'll just simulate success
      setTimeout(() => {
        toast({
          title: "NFT Minted Successfully",
          description: "Your achievement badge has been minted as an NFT.",
          variant: "success",
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Minting Failed",
        description: error.message || "Failed to mint the NFT badge.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-forest-800 mb-2">Security Achievements</h1>
        <p className="text-lg text-gray-600 mb-8">
          Complete security tasks to earn achievements and collect NFT badges
        </p>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-forest-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Achievement Progress Overview */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Achievement Progress</CardTitle>
                <CardDescription>
                  Track your security journey with Aetherion Wallet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">
                      {earnedAchievements} of {totalAchievements} achievements earned
                    </span>
                    <span className="text-sm font-medium">{Math.round(completionPercentage)}%</span>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-forest-50 to-forest-100 rounded-lg p-4 border border-forest-200">
                    <p className="text-sm text-gray-500 mb-1">Security Score</p>
                    <p className="text-3xl font-bold text-forest-800">
                      {userProfile?.securityScore || 0}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
                    <p className="text-sm text-gray-500 mb-1">NFT Badges</p>
                    <p className="text-3xl font-bold text-amber-800">
                      {nftBadges?.length || 0}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <p className="text-sm text-gray-500 mb-1">Ranking</p>
                    <p className="text-3xl font-bold text-purple-800">
                      {userProfile?.securityScore > 500 ? "Master" : 
                       userProfile?.securityScore > 300 ? "Expert" : 
                       userProfile?.securityScore > 150 ? "Advanced" : 
                       userProfile?.securityScore > 50 ? "Intermediate" : "Beginner"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievement Tabs */}
            <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveCategory}>
              <div className="border-b">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    All
                  </TabsTrigger>
                  <TabsTrigger value="account_security" className="flex items-center gap-2">
                    {categoryIcons.account_security}
                    Account
                  </TabsTrigger>
                  <TabsTrigger value="wallet_security" className="flex items-center gap-2">
                    {categoryIcons.wallet_security}
                    Wallet
                  </TabsTrigger>
                  <TabsTrigger value="quantum_security" className="flex items-center gap-2">
                    {categoryIcons.quantum_security}
                    Quantum
                  </TabsTrigger>
                  <TabsTrigger value="transaction_security" className="flex items-center gap-2">
                    {categoryIcons.transaction_security}
                    Transaction
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all" className="mt-6">
                <h2 className="text-2xl font-semibold mb-4">All Achievements</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAchievements.map(achievement => {
                    // Check if user has earned this achievement
                    const userAchievement = userAchievements?.find(ua => 
                      ua.achievementId === achievement.id
                    );
                    
                    return (
                      <AchievementCard 
                        key={achievement.id}
                        achievement={achievement}
                        earned={!!userAchievement}
                        userAchievement={userAchievement}
                        categoryIcon={categoryIcons[achievement.category]}
                        difficultyClass={difficultyColors[achievement.difficulty]}
                        onMintNFT={handleMintNFT}
                      />
                    );
                  })}
                </div>
              </TabsContent>
              
              {/* Create tab content for each category - similar structure to 'all' */}
              {Object.keys(categoryIcons).map(category => (
                <TabsContent key={category} value={category} className="mt-6">
                  <h2 className="text-2xl font-semibold mb-4">
                    {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Achievements
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAchievements.map(achievement => {
                      // Check if user has earned this achievement
                      const userAchievement = userAchievements?.find(ua => 
                        ua.achievementId === achievement.id
                      );
                      
                      return (
                        <AchievementCard 
                          key={achievement.id}
                          achievement={achievement}
                          earned={!!userAchievement}
                          userAchievement={userAchievement}
                          categoryIcon={categoryIcons[achievement.category]}
                          difficultyClass={difficultyColors[achievement.difficulty]}
                          onMintNFT={handleMintNFT}
                        />
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* NFT Badge Collection */}
            {nftBadges && nftBadges.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>My NFT Badge Collection</CardTitle>
                  <CardDescription>
                    Your achievements minted as unique NFT badges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {nftBadges.map(badge => (
                      <NFTBadgeCard 
                        key={badge.id}
                        badge={badge}
                        onViewOnBlockchain={() => window.open(`https://example.com/token/${badge.tokenId}`, '_blank')}
                      />
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" onClick={() => window.open('https://example.com/badges', '_blank')}>
                    View All on Blockchain
                  </Button>
                </CardFooter>
              </Card>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Achievements;
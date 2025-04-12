import React from "react";
import { Progress } from "@/components/ui/progress";
import { Shield, Fingerprint, Lock, Zap, CheckCircle, Unlock, Award } from "lucide-react";

interface CategorySummary {
  total: number;
  earned: number;
}

interface AchievementProgressSummaryProps {
  achievementsByCategory: Record<string, CategorySummary>;
}

const AchievementProgressSummary: React.FC<AchievementProgressSummaryProps> = ({ 
  achievementsByCategory 
}) => {
  // Category icons
  const categoryIcons = {
    account_security: <Shield className="h-5 w-5 text-blue-500" />,
    wallet_security: <Fingerprint className="h-5 w-5 text-indigo-500" />,
    communication_security: <Lock className="h-5 w-5 text-green-500" />,
    quantum_security: <Zap className="h-5 w-5 text-purple-500" />,
    transaction_security: <CheckCircle className="h-5 w-5 text-amber-500" />,
    node_operations: <Unlock className="h-5 w-5 text-red-500" />,
    special_events: <Award className="h-5 w-5 text-pink-500" />,
  };

  // Format category name for display
  const formatCategoryName = (category: string): string => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-forest-800">Achievement Progress by Category</h3>
      
      <div className="space-y-3">
        {Object.entries(achievementsByCategory).map(([category, summary]) => {
          const { total, earned } = summary;
          const percentage = total > 0 ? (earned / total) * 100 : 0;
          
          return (
            <div key={category} className="space-y-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {categoryIcons[category] || <Award className="h-5 w-5" />}
                  <span className="text-sm font-medium">{formatCategoryName(category)}</span>
                </div>
                <span className="text-sm text-forest-700">
                  {earned}/{total} ({Math.round(percentage)}%)
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementProgressSummary;
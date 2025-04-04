import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, Shield, Zap, TrendingUp, Eye } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { motion, AnimatePresence } from 'framer-motion';
import type { RiskAssessment, RiskLevel } from '@/lib/singularity-coin';

const riskLevelVariants = cva('text-sm font-medium rounded-full px-2 py-0.5', {
  variants: {
    level: {
      'Low': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Moderate': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Elevated': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'High': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'Critical': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    }
  },
  defaultVariants: {
    level: 'Moderate'
  }
});

// Emotion variants for the face SVG
const faceVariants = {
  calm: { background: 'hsl(var(--success))', color: 'white' },
  cautious: { background: 'hsl(var(--info))', color: 'white' },
  nervous: { background: 'hsl(var(--warning))', color: 'white' },
  alarmed: { background: 'hsl(var(--destructive) / 0.8)', color: 'white' },
  panicked: { background: 'hsl(var(--destructive))', color: 'white' },
};

const moodDescriptions = {
  'Calm': 'Your portfolio is well-protected with multiple quantum security layers. Current market conditions are stable.',
  'Cautious': 'Some minor risk factors detected. Your assets remain secure but increased vigilance is advised.',
  'Nervous': 'Elevated risk detected in multiple areas. Consider increasing security measures.',
  'Alarmed': 'High risk level detected. Immediate review of security settings and asset allocation recommended.',
  'Panicked': 'Critical risk level detected. Urgent action required to secure assets against current threats.'
};

const riskActionRecommendations = {
  'Low': [
    'Continue regular security reviews',
    'Maintain quantum wrapping for all assets',
    'Review staking positions quarterly'
  ],
  'Moderate': [
    'Increase monitoring frequency',
    'Review asset quantum security levels',
    'Verify all connected applications'
  ],
  'Elevated': [
    'Enable additional security notifications',
    'Consider rebalancing high-risk assets',
    'Upgrade quantum security layers'
  ],
  'High': [
    'Immediately review all connected applications',
    'Increase fractal sharding protection',
    'Move assets to quantum vault storage'
  ],
  'Critical': [
    'Move all assets to cold storage',
    'Apply maximum quantum security wrapping',
    'Disconnect external applications immediately'
  ]
};

interface MoodFaceProps {
  mood: 'Calm' | 'Cautious' | 'Nervous' | 'Alarmed' | 'Panicked';
  size?: number;
}

const MoodFace: React.FC<MoodFaceProps> = ({ mood, size = 80 }) => {
  // Different SVG paths based on mood
  const eyeVariants = {
    Calm: "M15,16 Q17,13 19,16", // Slightly curved, calm eyes
    Cautious: "M15,16 L19,16", // Straight, neutral eyes
    Nervous: "M15,16 Q17,17 19,16", // Slightly worried eyes
    Alarmed: "M15,16 Q17,18 19,16", // More worried eyes
    Panicked: "M15,16 Q17,19 19,16", // Very worried eyes
  };

  const mouthVariants = {
    Calm: "M12,22 Q18,25 24,22", // Happy smile
    Cautious: "M12,23 Q18,24 24,23", // Slight smile
    Nervous: "M12,24 L24,24", // Straight line
    Alarmed: "M12,24 Q18,22 24,24", // Slight frown
    Panicked: "M12,25 Q18,21 24,25", // Deep frown
  };

  // Animation for the eyes and mouth
  const transition = { 
    type: "spring", 
    stiffness: 300, 
    damping: 20,
    duration: 0.5
  };

  // Dynamic colors based on mood
  const bgColors = {
    Calm: "hsl(142 69% 58%)",
    Cautious: "hsl(217 91% 60%)",
    Nervous: "hsl(45 93% 58%)",
    Alarmed: "hsl(24 94% 50%)",
    Panicked: "hsl(0 84% 60%)"
  };

  return (
    <motion.svg 
      width={size} 
      height={size} 
      viewBox="0 0 36 36" 
      initial={false}
      animate={{
        backgroundColor: bgColors[mood],
      }}
      transition={transition}
      className="rounded-full shadow-lg"
    >
      {/* Face background */}
      <circle cx="18" cy="18" r="18" fill="currentColor" />
      
      {/* Left eye */}
      <motion.path
        d="M10,16 Q13,13 16,16" 
        stroke="white" 
        strokeWidth="1.5"
        fill="none"
        initial={false}
        animate={{ d: eyeVariants[mood] }}
        transition={transition}
        transform="translate(-5, 0)"
      />
      
      {/* Right eye */}
      <motion.path
        d="M20,16 Q23,13 26,16" 
        stroke="white" 
        strokeWidth="1.5"
        fill="none"
        initial={false}
        animate={{ d: eyeVariants[mood] }}
        transition={transition}
        transform="translate(5, 0)"
      />
      
      {/* Mouth */}
      <motion.path
        d="M12,22 Q18,25 24,22" 
        stroke="white" 
        strokeWidth="1.5"
        fill="none"
        initial={false}
        animate={{ d: mouthVariants[mood] }}
        transition={transition}
      />
    </motion.svg>
  );
};

interface RiskFactorBarProps {
  name: string;
  value: number;
  impact: 'Low' | 'Medium' | 'High';
  description: string;
}

const RiskFactorBar: React.FC<RiskFactorBarProps> = ({ name, value, impact, description }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate the progress bar
    const timer = setTimeout(() => setProgress(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const impactColor = impact === 'High' ? 'text-red-500' : 
                     impact === 'Medium' ? 'text-yellow-500' : 
                     'text-green-500';

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{name}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={`text-xs font-medium ${impactColor}`}>
                  {impact} Impact
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className="text-sm font-medium">{Math.round(value)}%</span>
      </div>
      <Progress value={progress} className="h-2" 
        // Gradient colors based on value
        style={{
          background: 'linear-gradient(to right, hsl(var(--success)) 0%, hsl(var(--warning)) 50%, hsl(var(--destructive)) 100%)',
          backgroundClip: 'content-box',
          opacity: value / 100
        }}
      />
    </div>
  );
};

export interface RiskMoodIndicatorProps {
  riskAssessment: RiskAssessment;
  className?: string;
}

const RiskMoodIndicator: React.FC<RiskMoodIndicatorProps> = ({ riskAssessment, className = '' }) => {
  const { 
    mood, 
    overallRisk, 
    securityScore, 
    riskFactors, 
    marketRisk, 
    securityRisk, 
    quantumThreatLevel,
    lastUpdated 
  } = riskAssessment;

  // Calculate which risk overview icon to show
  const getRiskIcon = (risk: RiskLevel) => {
    switch(risk) {
      case 'Low':
      case 'Moderate':
        return <Shield className="h-4 w-4 text-green-500" />;
      case 'Elevated':
        return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'High':
      case 'Critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Risk Assessment</CardTitle>
          <Badge variant="outline" className={riskLevelVariants({ level: overallRisk })}>
            {overallRisk} Risk
          </Badge>
        </div>
        <CardDescription>
          Dynamic mood-based portfolio risk analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="text-xl font-bold">Current Mood</div>
                <div className="text-2xl font-bold tracking-tight leading-none">
                  {mood}
                </div>
                <div className="text-sm text-muted-foreground max-w-[240px]">
                  {moodDescriptions[mood]}
                </div>
              </div>
              
              <div className="mr-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mood}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MoodFace mood={mood} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="bg-muted/40 p-3 rounded-lg space-y-1.5">
                <div className="flex items-center text-sm font-medium text-muted-foreground gap-1.5">
                  <TrendingUp className="h-4 w-4" />
                  <span>Market</span>
                </div>
                <Badge variant="outline" className={riskLevelVariants({ level: marketRisk })}>
                  {marketRisk}
                </Badge>
              </div>
              <div className="bg-muted/40 p-3 rounded-lg space-y-1.5">
                <div className="flex items-center text-sm font-medium text-muted-foreground gap-1.5">
                  <Shield className="h-4 w-4" />
                  <span>Security</span>
                </div>
                <Badge variant="outline" className={riskLevelVariants({ level: securityRisk })}>
                  {securityRisk}
                </Badge>
              </div>
              <div className="bg-muted/40 p-3 rounded-lg space-y-1.5">
                <div className="flex items-center text-sm font-medium text-muted-foreground gap-1.5">
                  <Zap className="h-4 w-4" />
                  <span>Quantum</span>
                </div>
                <Badge variant="outline" className={riskLevelVariants({ level: quantumThreatLevel })}>
                  {quantumThreatLevel}
                </Badge>
              </div>
            </div>
            
            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">Security Score</div>
                <div className="text-sm font-medium">{Math.round(securityScore)}%</div>
              </div>
              <Progress value={securityScore} className="h-2" />
            </div>
            
            <div className="text-xs text-muted-foreground mt-4">
              Last updated: {lastUpdated.toLocaleString()}
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            <div className="space-y-3">
              {riskFactors.map((factor, index) => (
                <RiskFactorBar 
                  key={index}
                  name={factor.name}
                  value={factor.value}
                  impact={factor.impact}
                  description={factor.description}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="actions" className="space-y-4">
            <div className="space-y-3">
              <div className="text-sm font-medium pb-1">Recommended Actions</div>
              <div className="space-y-2">
                {riskActionRecommendations[overallRisk].map((action, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-muted/40 rounded-md">
                    <div className="mt-0.5">
                      {getRiskIcon(overallRisk)}
                    </div>
                    <div className="text-sm">{action}</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RiskMoodIndicator;
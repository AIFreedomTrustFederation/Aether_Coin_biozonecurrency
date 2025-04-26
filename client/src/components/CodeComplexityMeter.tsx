import React, { useState } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Smile, Meh, Frown, Zap, Code, FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define our complexity levels and their corresponding mood
type ComplexityLevel = 'simple' | 'moderate' | 'complex' | 'nightmare';
type MoodData = {
  icon: React.ReactNode;
  color: string;
  label: string;
  description: string;
};

// Mapping of complexity levels to mood data
const moodMap: Record<ComplexityLevel, MoodData> = {
  simple: {
    icon: <Smile className="h-8 w-8" />,
    color: 'bg-green-500',
    label: 'Joyful Simplicity',
    description: 'This code is clean, readable, and maintainable. A true pleasure to work with!'
  },
  moderate: {
    icon: <Meh className="h-8 w-8" />,
    color: 'bg-yellow-500',
    label: 'Manageable Complexity',
    description: 'Some complexity exists, but the code remains understandable with reasonable effort.'
  },
  complex: {
    icon: <Frown className="h-8 w-8" />,
    color: 'bg-orange-500',
    label: 'Concerning Complexity',
    description: 'This code has significant complexity issues that could lead to maintenance challenges.'
  },
  nightmare: {
    icon: <span className="relative">
      <Frown className="h-8 w-8" />
      <span className="absolute -top-1 -right-1 text-red-500 text-2xl">⚠</span>
    </span>,
    color: 'bg-red-500',
    label: 'Nightmare Material',
    description: 'Extreme complexity detected! This code requires urgent refactoring.'
  }
};

// Function to calculate complexity score based on code metrics
const calculateComplexityScore = (
  linesOfCode: number, 
  cyclomaticComplexity: number,
  dependencyCount: number
): number => {
  // Calculate a score between 0-100 where higher means more complex
  const locScore = Math.min(linesOfCode / 10, 30);
  const cycScore = Math.min(cyclomaticComplexity * 5, 50);
  const depScore = Math.min(dependencyCount * 2, 20);
  
  return Math.min(locScore + cycScore + depScore, 100);
};

// Function to determine complexity level from score
const getComplexityLevel = (score: number): ComplexityLevel => {
  if (score < 30) return 'simple';
  if (score < 60) return 'moderate';
  if (score < 85) return 'complex';
  return 'nightmare';
};

// Sample analysis function (this would be replaced with actual code analysis)
const analyzeCode = async (codeText: string): Promise<{
  linesOfCode: number;
  cyclomaticComplexity: number;
  dependencyCount: number;
  score: number;
  level: ComplexityLevel;
}> => {
  // In a real implementation, this would parse and analyze the code
  // For this demo, we'll use some heuristics based on the text
  
  const linesOfCode = codeText.split('\n').length;
  
  // Estimate cyclomatic complexity by counting conditions
  const conditions = (codeText.match(/if|while|for|switch|catch|\?/g) || []).length;
  const cyclomaticComplexity = conditions + 1;
  
  // Estimate dependencies by counting import statements
  const dependencyCount = (codeText.match(/import |require\(/g) || []).length;
  
  // Calculate the complexity score
  const score = calculateComplexityScore(linesOfCode, cyclomaticComplexity, dependencyCount);
  
  // Determine the complexity level
  const level = getComplexityLevel(score);
  
  // Simulate an API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    linesOfCode,
    cyclomaticComplexity,
    dependencyCount,
    score,
    level
  };
};

export interface CodeComplexityMeterProps {
  initialCodeText?: string;
  onAnalysisComplete?: (result: any) => void;
  className?: string;
}

const CodeComplexityMeter: React.FC<CodeComplexityMeterProps> = ({ 
  initialCodeText = '',
  onAnalysisComplete,
  className = ''
}) => {
  const [codeText, setCodeText] = useState(initialCodeText);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeClick = async () => {
    if (!codeText.trim()) {
      setError('Please provide some code to analyze');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const analysisResult = await analyzeCode(codeText);
      setResult(analysisResult);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult);
      }
    } catch (err) {
      setError('Failed to analyze code: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderMoodMeter = () => {
    if (!result) return null;
    
    const { score, level } = result;
    const mood = moodMap[level];
    
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Complexity Score: {score.toFixed(0)}/100</span>
          <div className="flex items-center">
            {mood.icon}
            <span className="ml-2 font-medium">{mood.label}</span>
          </div>
        </div>
        
        <Progress 
          value={score} 
          className={`h-2 mb-2 ${mood.color}`}
        />
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {mood.description}
        </p>
        
        <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
            <div className="font-medium">Lines of Code</div>
            <div className="text-xl">{result.linesOfCode}</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
            <div className="font-medium">Cyclomatic</div>
            <div className="text-xl">{result.cyclomaticComplexity}</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
            <div className="font-medium">Dependencies</div>
            <div className="text-xl">{result.dependencyCount}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileCode className="mr-2 h-5 w-5" />
          Code Complexity Mood Meter
        </CardTitle>
        <CardDescription>
          Analyze your code with a single click to understand its complexity level
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <textarea
            value={codeText}
            onChange={(e) => setCodeText(e.target.value)}
            placeholder="Paste your code here..."
            className="w-full h-40 p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isAnalyzing}
          />
          
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          {renderMoodMeter()}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleAnalyzeClick} 
          disabled={isAnalyzing || !codeText.trim()}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Zap className="mr-2 h-4 w-4 animate-pulse" />
              Analyzing...
            </>
          ) : (
            <>
              <Code className="mr-2 h-4 w-4" />
              Analyze Complexity
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CodeComplexityMeter;
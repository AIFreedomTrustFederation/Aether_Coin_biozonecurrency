/**
 * Code Complexity Analysis Service
 * 
 * Provides functions to analyze code complexity and returns metrics
 * that can be used for the Code Complexity Mood Meter.
 */

// Types for code analysis
export interface CodeMetrics {
  linesOfCode: number;
  cyclomaticComplexity: number;
  dependencyCount: number;
  commentRatio: number;
  functionCount: number;
  maxNestingDepth: number;
  avgFunctionLength: number;
}

export interface ComplexityResult {
  metrics: CodeMetrics;
  score: number;
  level: ComplexityLevel;
}

export type ComplexityLevel = 'simple' | 'moderate' | 'complex' | 'nightmare';

/**
 * Analyze code complexity
 * @param code The source code to analyze
 * @param language Optional language hint (javascript, typescript, python, etc.)
 * @returns Promise with analysis results
 */
export async function analyzeCodeComplexity(
  code: string, 
  language?: string
): Promise<ComplexityResult> {
  try {
    // If we have OpenAI API access, we could use it for more sophisticated analysis
    if (process.env.OPENAI_API_KEY) {
      return await analyzeWithAI(code, language);
    }
    
    // Fallback to basic analysis
    return performBasicAnalysis(code, language);
  } catch (error) {
    console.error('Error in code complexity analysis:', error);
    throw new Error('Failed to analyze code complexity');
  }
}

/**
 * Perform basic code analysis using regex and heuristics
 */
function performBasicAnalysis(code: string, language?: string): Promise<ComplexityResult> {
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      // Calculate metrics
      const lines = code.split('\n');
      const linesOfCode = lines.filter(line => line.trim().length > 0).length;
      
      // Count comment lines
      const commentPattern = language === 'python' 
        ? /#.*/g 
        : /\/\/.*|\/\*[\s\S]*?\*\//g;
      const commentMatches = (code.match(commentPattern) || []) as string[];
      const commentLines = commentMatches.reduce((count: number, comment: string) => 
        count + comment.split('\n').length, 0);
      
      // Estimate cyclomatic complexity by counting conditions
      const conditions = (code.match(/if|else if|while|for|switch|case|catch|\?|&&|\|\|/g) || []).length;
      const cyclomaticComplexity = Math.max(1, conditions);
      
      // Estimate function count
      const functionPattern = language === 'python'
        ? /def\s+\w+\s*\(/g
        : /function\s+\w+\s*\(|const\s+\w+\s*=\s*(\([^)]*\)|async\s*\([^)]*\))\s*=>/g;
      const functionMatches = code.match(functionPattern) || [];
      const functionCount = functionMatches.length;
      
      // Dependency count (imports)
      const importPattern = language === 'python'
        ? /import\s+|from\s+\w+\s+import/g
        : /import\s+|require\(/g;
      const dependencyCount = (code.match(importPattern) || []).length;
      
      // Max nesting depth estimation
      let maxDepth = 0;
      let currentDepth = 0;
      for (const line of lines) {
        const openBraces = (line.match(/{|\(|\[/g) || []).length;
        const closeBraces = (line.match(/}|\)|\]/g) || []).length;
        currentDepth += openBraces - closeBraces;
        maxDepth = Math.max(maxDepth, currentDepth);
      }
      
      // Calculate average function length (rough estimation)
      const avgFunctionLength = functionCount > 0 ? linesOfCode / functionCount : linesOfCode;
      
      // Comment ratio
      const commentRatio = linesOfCode > 0 ? commentLines / linesOfCode : 0;
      
      const metrics: CodeMetrics = {
        linesOfCode,
        cyclomaticComplexity,
        dependencyCount,
        commentRatio,
        functionCount,
        maxNestingDepth: maxDepth,
        avgFunctionLength
      };
      
      // Calculate complexity score
      const score = calculateComplexityScore(metrics);
      
      // Determine complexity level
      const level = getComplexityLevel(score);
      
      resolve({
        metrics,
        score,
        level
      });
    }, 1000); // Simulate 1 second of analysis time
  });
}

/**
 * Use AI to analyze code complexity (requires OpenAI API key)
 */
async function analyzeWithAI(code: string, language?: string): Promise<ComplexityResult> {
  try {
    // For demonstration, we'll just fall back to the basic analysis
    // In a real implementation, you would call the OpenAI API here
    console.log('AI-based code analysis would be used here if properly implemented');
    return await performBasicAnalysis(code, language);
  } catch (error) {
    console.error('Error in AI code analysis:', error);
    // Fallback to basic analysis
    return performBasicAnalysis(code, language);
  }
}

/**
 * Calculate a complexity score based on metrics
 * @param metrics Code metrics
 * @returns Complexity score (0-100)
 */
function calculateComplexityScore(metrics: CodeMetrics): number {
  // Weighted scoring system
  const locScore = Math.min(metrics.linesOfCode / 20, 25);
  const ccScore = Math.min(metrics.cyclomaticComplexity * 2.5, 30);
  const depScore = Math.min(metrics.dependencyCount * 2, 15);
  const nestingScore = Math.min(metrics.maxNestingDepth * 3, 15);
  const fnLengthScore = Math.min(metrics.avgFunctionLength / 5, 15);
  
  // Comment ratio reduces score (more comments = better)
  const commentBonus = Math.min(metrics.commentRatio * 30, 10);
  
  // Calculate the total score (0-100 scale where higher is more complex)
  let score = locScore + ccScore + depScore + nestingScore + fnLengthScore - commentBonus;
  
  // Ensure the score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Determine complexity level from score
 * @param score Complexity score (0-100)
 * @returns Complexity level
 */
function getComplexityLevel(score: number): ComplexityLevel {
  if (score < 30) return 'simple';
  if (score < 60) return 'moderate';
  if (score < 85) return 'complex';
  return 'nightmare';
}
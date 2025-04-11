/**
 * Quantum Security Panel Component
 * 
 * This component integrates with the Monaco editor to provide
 * quantum security analysis and enhancements for smart contracts.
 */

import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Check, Zap, Cpu, Key, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { useAetherionIntegration } from '../../integration';
import { EditorInstance } from '../types';
import { ContractValidationResult } from '../../integration/services/QuantumEditorBridge';

interface QuantumSecurityPanelProps {
  editor: EditorInstance | null;
  currentLanguage: string;
}

export const QuantumSecurityPanel: React.FC<QuantumSecurityPanelProps> = ({
  editor,
  currentLanguage
}) => {
  const { editor: editorBridge, quantum, ai } = useAetherionIntegration();
  const [validationResult, setValidationResult] = useState<ContractValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSecuring, setIsSecuring] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  
  // Validate the current contract code
  const validateContract = async () => {
    if (!editor) return;
    
    try {
      setIsValidating(true);
      const contractCode = editor.getValue();
      
      const result = await editorBridge.validateSmartContract(
        contractCode, 
        currentLanguage as 'solidity' | 'rust'
      );
      
      setValidationResult(result);
      
      // Highlight issues in the editor
      editorBridge.highlightIssuesInEditor(editor, result);
    } catch (error) {
      console.error('Error validating contract:', error);
    } finally {
      setIsValidating(false);
    }
  };
  
  // Apply quantum security enhancements to the contract
  const secureContract = async () => {
    if (!editor) return;
    
    try {
      setIsSecuring(true);
      const contractCode = editor.getValue();
      
      const securedCode = editorBridge.injectQuantumResistance(
        contractCode, 
        currentLanguage as 'solidity' | 'rust'
      );
      
      // Update the editor with the secured code
      editor.setValue(securedCode);
      
      // Re-validate the secured contract
      await validateContract();
    } catch (error) {
      console.error('Error securing contract:', error);
    } finally {
      setIsSecuring(false);
    }
  };
  
  // Get AI recommendations for the current contract
  const getAiRecommendations = async () => {
    if (!editor) return;
    
    try {
      setIsLoadingAi(true);
      const contractCode = editor.getValue();
      
      const recommendation = await ai.askAI(
        'Analyze this smart contract code for security vulnerabilities and suggest quantum security improvements',
        {
          currentCode: contractCode,
          currentLanguage,
          securityState: quantum,
          appContext: 'editor'
        }
      );
      
      setAiRecommendation(recommendation);
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
    } finally {
      setIsLoadingAi(false);
    }
  };
  
  // Apply a suggestion to the editor
  const applySuggestion = (suggestion: { line: number; replacement?: string }) => {
    if (!editor || !suggestion.replacement) return;
    
    // Get the current model
    const model = editor.getModel();
    if (!model) return;
    
    // Get the line text
    const lineContent = model.getLineContent(suggestion.line);
    
    // Replace the line in the editor
    editor.executeEdits('quantum-security', [{
      range: {
        startLineNumber: suggestion.line,
        startColumn: 1,
        endLineNumber: suggestion.line,
        endColumn: lineContent.length + 1
      },
      text: suggestion.replacement
    }]);
  };
  
  // Render vulnerability badges
  const renderSeverityBadge = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge variant="warning" className="bg-yellow-500">Warning</Badge>;
      case 'info':
        return <Badge variant="outline">Info</Badge>;
    }
  };
  
  // Jump to a specific line in the editor
  const jumpToLine = (line: number) => {
    if (!editor) return;
    
    editor.revealLineInCenter(line);
    editor.setPosition({ lineNumber: line, column: 1 });
  };
  
  // Calculate stats from validation result
  const getStats = () => {
    if (!validationResult) {
      return {
        criticalCount: 0,
        warningCount: 0,
        infoCount: 0,
        suggestionCount: 0
      };
    }
    
    const criticalCount = validationResult.vulnerabilities.filter(v => v.severity === 'critical').length;
    const warningCount = validationResult.vulnerabilities.filter(v => v.severity === 'warning').length;
    const infoCount = validationResult.vulnerabilities.filter(v => v.severity === 'info').length;
    
    return {
      criticalCount,
      warningCount,
      infoCount,
      suggestionCount: validationResult.optimizationSuggestions.length
    };
  };
  
  const stats = getStats();
  
  return (
    <div className="h-full overflow-auto">
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Shield className="text-primary h-5 w-5 mr-2" />
            <h2 className="text-lg font-semibold">Quantum Security Analysis</h2>
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={validateContract}
              disabled={!editor || isValidating}
            >
              {isValidating ? "Analyzing..." : "Analyze Contract"}
            </Button>
            
            <Button 
              size="sm" 
              onClick={secureContract}
              disabled={!editor || isSecuring}
            >
              {isSecuring ? "Securing..." : "Secure Contract"}
            </Button>
          </div>
        </div>
        
        {validationResult && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Security Score</CardTitle>
                <Badge 
                  className={validationResult.valid ? "bg-green-500" : "bg-red-500"}
                >
                  {validationResult.valid ? "SECURE" : "VULNERABLE"}
                </Badge>
              </div>
              <CardDescription>
                {validationResult.valid 
                  ? "No critical vulnerabilities detected" 
                  : `${stats.criticalCount} critical vulnerabilities found`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Security Score</span>
                  <span className="font-semibold">{validationResult.securityScore}/100</span>
                </div>
                <Progress 
                  value={validationResult.securityScore} 
                  className={`h-2 ${
                    validationResult.securityScore > 80 ? "bg-green-500" :
                    validationResult.securityScore > 60 ? "bg-yellow-500" :
                    validationResult.securityScore > 40 ? "bg-orange-500" :
                    "bg-red-500"
                  }`}
                />
                
                <div className="grid grid-cols-4 gap-2 pt-2">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground">Critical</span>
                    <span className={`font-semibold ${stats.criticalCount > 0 ? "text-red-500" : ""}`}>
                      {stats.criticalCount}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground">Warnings</span>
                    <span className={`font-semibold ${stats.warningCount > 0 ? "text-yellow-500" : ""}`}>
                      {stats.warningCount}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground">Info</span>
                    <span className="font-semibold">{stats.infoCount}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground">Suggestions</span>
                    <span className="font-semibold text-blue-500">{stats.suggestionCount}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Tabs defaultValue="vulnerabilities">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="vulnerabilities">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Vulnerabilities
            </TabsTrigger>
            <TabsTrigger value="optimizations">
              <Zap className="h-4 w-4 mr-1" />
              Optimizations
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Cpu className="h-4 w-4 mr-1" />
              AI Assistance
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="vulnerabilities" className="space-y-4 py-2">
            {!validationResult && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No Analysis</AlertTitle>
                <AlertDescription>
                  Click "Analyze Contract" to check for vulnerabilities
                </AlertDescription>
              </Alert>
            )}
            
            {validationResult && validationResult.vulnerabilities.length === 0 && (
              <Alert>
                <Check className="h-4 w-4 text-green-500" />
                <AlertTitle>No Vulnerabilities</AlertTitle>
                <AlertDescription>
                  No vulnerabilities were detected in the contract
                </AlertDescription>
              </Alert>
            )}
            
            {validationResult && validationResult.vulnerabilities.map((vulnerability, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm flex items-center">
                      <button 
                        onClick={() => jumpToLine(vulnerability.line)}
                        className="hover:underline flex items-center"
                      >
                        Line {vulnerability.line}
                      </button>
                    </CardTitle>
                    {renderSeverityBadge(vulnerability.severity)}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm">{vulnerability.message}</p>
                  
                  {vulnerability.suggestion && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span className="font-semibold">Suggestion: </span>
                      {vulnerability.suggestion}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="optimizations" className="space-y-4 py-2">
            {!validationResult && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No Analysis</AlertTitle>
                <AlertDescription>
                  Click "Analyze Contract" to find optimization opportunities
                </AlertDescription>
              </Alert>
            )}
            
            {validationResult && validationResult.optimizationSuggestions.length === 0 && (
              <Alert>
                <Check className="h-4 w-4 text-green-500" />
                <AlertTitle>No Optimizations</AlertTitle>
                <AlertDescription>
                  No optimization opportunities were identified
                </AlertDescription>
              </Alert>
            )}
            
            {validationResult && validationResult.optimizationSuggestions.map((suggestion, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm flex items-center">
                      <button 
                        onClick={() => jumpToLine(suggestion.line)}
                        className="hover:underline flex items-center"
                      >
                        Line {suggestion.line}
                      </button>
                    </CardTitle>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                      Optimization
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm">{suggestion.message}</p>
                </CardContent>
                {suggestion.replacement && (
                  <CardFooter className="pt-0">
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      onClick={() => applySuggestion(suggestion)}
                      className="w-full"
                    >
                      Apply Suggestion
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="ai" className="space-y-4 py-2">
            <div className="flex justify-end">
              <Button 
                size="sm" 
                variant="outline"
                onClick={getAiRecommendations}
                disabled={isLoadingAi}
              >
                {isLoadingAi ? "Loading AI..." : "Get AI Recommendations"}
              </Button>
            </div>
            
            {!aiRecommendation && !isLoadingAi && (
              <div className="text-center py-8">
                <Cpu className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  AI-powered security analysis and recommendations
                </p>
              </div>
            )}
            
            {isLoadingAi && (
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <Cpu className="h-12 w-12 mx-auto text-primary" />
                  <p className="mt-2">
                    Analyzing with quantum AI...
                  </p>
                </div>
              </div>
            )}
            
            {aiRecommendation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Cpu className="h-4 w-4 mr-2 text-primary" />
                    AI Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert">
                    <p>{aiRecommendation}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
        <Separator />
        
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center">
            <Key className="h-4 w-4 mr-1" />
            Quantum Security Status
          </h3>
          
          <div className="grid grid-cols-2 gap-2">
            <Card>
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-1 text-primary" />
                    <span className="text-xs">Quantum Resistant</span>
                  </div>
                  <Badge 
                    variant={validationResult?.quantumResistant ? "default" : "outline"}
                    className={validationResult?.quantumResistant 
                      ? "" 
                      : "text-muted-foreground"
                    }
                  >
                    {validationResult?.quantumResistant ? "Yes" : "No"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 mr-1 text-primary" />
                    <span className="text-xs">Temporal Security</span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline" className="bg-violet-500/10 text-violet-500">
                          {Math.round((quantum.temporalCoherence || 0) * 100)}%
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        Temporal coherence in the quantum network
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
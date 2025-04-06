import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clipboard, Download, ExternalLink, Check, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeEditorProps {
  code: {
    contractCode: string;
    testCode?: string;
    uiCode?: string;
    apiCode?: string;
    docs?: string;
    securityReport?: {
      issues: {
        severity: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        location: string;
        recommendation: string;
      }[];
      score: number;
      passedChecks: string[];
      failedChecks: string[];
    };
  };
  projectName: string;
}

export default function CodeEditor({ code, projectName }: CodeEditorProps) {
  const [activeTab, setActiveTab] = useState('contract');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      
      toast({
        title: 'Copied to clipboard',
        description: 'Code successfully copied to clipboard',
        variant: 'default',
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      
      toast({
        title: 'Copy failed',
        description: 'Could not copy code to clipboard',
        variant: 'destructive',
      });
    }
  };
  
  const downloadFile = (content: string, filename: string, extension: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${filename}.${extension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: 'File downloaded',
      description: `${filename}.${extension} has been saved`,
      variant: 'default',
    });
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 hover:bg-red-700';
      case 'high':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'medium':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'low':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };
  
  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };
  
  const formatSecurityScore = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };
  
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{projectName}</CardTitle>
            <CardDescription>
              Generated smart contract and supporting code
            </CardDescription>
          </div>
          
          {code.securityReport && (
            <div className="flex flex-col items-end">
              <div className="flex items-center mb-1">
                <ShieldCheck className="mr-1" size={16} />
                <span>Security Score:</span>
                <span className={`ml-2 font-bold ${getSecurityScoreColor(code.securityReport.score)}`}>
                  {code.securityReport.score}/100 ({formatSecurityScore(code.securityReport.score)})
                </span>
              </div>
              
              <div className="flex space-x-1">
                {code.securityReport.issues.length > 0 ? (
                  <>
                    <Badge variant="destructive" className="flex items-center">
                      <AlertTriangle className="mr-1" size={12} />
                      {code.securityReport.issues.length} Issues
                    </Badge>
                    
                    {code.securityReport.issues.some(i => i.severity === 'critical' || i.severity === 'high') && (
                      <Badge variant="destructive" className="flex items-center">
                        Critical Vulnerabilities
                      </Badge>
                    )}
                  </>
                ) : (
                  <Badge variant="default" className="bg-green-500 flex items-center">
                    <Check className="mr-1" size={12} />
                    No Issues Found
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <div className="px-6">
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="contract">Contract</TabsTrigger>
              <TabsTrigger value="tests" disabled={!code.testCode}>Tests</TabsTrigger>
              <TabsTrigger value="ui" disabled={!code.uiCode}>UI</TabsTrigger>
              <TabsTrigger value="docs" disabled={!code.docs}>Docs</TabsTrigger>
              <TabsTrigger value="security" disabled={!code.securityReport}>Security</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="contract" className="flex-1 flex flex-col mt-0 px-6 pb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Smart Contract Code</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(code.contractCode)}
                >
                  {copied ? <Check size={16} /> : <Clipboard size={16} />}
                  <span className="ml-1">{copied ? 'Copied' : 'Copy'}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadFile(code.contractCode, `${projectName.replace(/\s+/g, '')}.sol`, 'sol')}
                >
                  <Download size={16} />
                  <span className="ml-1">Download</span>
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-slate-900 text-slate-50 rounded-md p-4 font-mono text-sm">
              <pre>{code.contractCode}</pre>
            </div>
          </TabsContent>
          
          <TabsContent value="tests" className="flex-1 flex flex-col mt-0 px-6 pb-6">
            {code.testCode ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Test Code</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(code.testCode!)}
                    >
                      <Clipboard size={16} />
                      <span className="ml-1">Copy</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(code.testCode!, `${projectName.replace(/\s+/g, '')}.test`, 'js')}
                    >
                      <Download size={16} />
                      <span className="ml-1">Download</span>
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto bg-slate-900 text-slate-50 rounded-md p-4 font-mono text-sm">
                  <pre>{code.testCode}</pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                No test code available
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="ui" className="flex-1 flex flex-col mt-0 px-6 pb-6">
            {code.uiCode ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">UI Component Code</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(code.uiCode!)}
                    >
                      <Clipboard size={16} />
                      <span className="ml-1">Copy</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(code.uiCode!, `${projectName.replace(/\s+/g, '')}UI`, 'jsx')}
                    >
                      <Download size={16} />
                      <span className="ml-1">Download</span>
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto bg-slate-900 text-slate-50 rounded-md p-4 font-mono text-sm">
                  <pre>{code.uiCode}</pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                No UI code available
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="docs" className="flex-1 flex flex-col mt-0 px-6 pb-6">
            {code.docs ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Documentation</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(code.docs!)}
                    >
                      <Clipboard size={16} />
                      <span className="ml-1">Copy</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(code.docs!, `${projectName.replace(/\s+/g, '')}-docs`, 'md')}
                    >
                      <Download size={16} />
                      <span className="ml-1">Download</span>
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-800 rounded-md p-4 text-sm">
                  <pre className="whitespace-pre-wrap font-sans">{code.docs}</pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                No documentation available
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="security" className="flex-1 flex flex-col mt-0 px-6 pb-6">
            {code.securityReport ? (
              <div className="flex-1 overflow-y-auto">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Security Analysis</h3>
                  
                  <div className="flex items-center mb-4">
                    <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center mr-4 relative" 
                      style={{ 
                        borderColor: code.securityReport.score >= 90 
                          ? '#10b981' 
                          : code.securityReport.score >= 70 
                            ? '#f59e0b' 
                            : code.securityReport.score >= 50 
                              ? '#f97316' 
                              : '#ef4444' 
                      }}
                    >
                      <span className="text-xl font-bold">{code.securityReport.score}</span>
                      <span className="text-xs absolute -bottom-6 w-full text-center">
                        {formatSecurityScore(code.securityReport.score)}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {code.securityReport.issues.length === 0 
                          ? 'No security issues were found!' 
                          : `Found ${code.securityReport.issues.length} security issues that should be addressed.`}
                      </p>
                      
                      <div className="flex gap-2">
                        <Badge className="bg-green-500">
                          {code.securityReport.passedChecks.length} Checks Passed
                        </Badge>
                        {code.securityReport.failedChecks.length > 0 && (
                          <Badge variant="destructive">
                            {code.securityReport.failedChecks.length} Checks Failed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {code.securityReport.issues.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Issues Found</h3>
                    <div className="space-y-3">
                      {code.securityReport.issues.map((issue, index) => (
                        <Card key={index} className="overflow-hidden">
                          <CardHeader className={`py-2 ${getSeverityColor(issue.severity)} text-white`}>
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-sm font-medium">{issue.description}</CardTitle>
                              <Badge variant="secondary" className="uppercase">{issue.severity}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-3">
                            <div className="mb-3">
                              <span className="text-sm font-medium">Location:</span>
                              <span className="text-sm ml-2 text-muted-foreground">{issue.location}</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Recommendation:</span>
                              <p className="text-sm mt-1 text-muted-foreground">{issue.recommendation}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Passed Security Checks</h3>
                  <ul className="space-y-1">
                    {code.securityReport.passedChecks.map((check, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Check size={16} className="text-green-500 mr-2" />
                        {check}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {code.securityReport.failedChecks.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Failed Security Checks</h3>
                    <ul className="space-y-1">
                      {code.securityReport.failedChecks.map((check, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <XCircle size={16} className="text-red-500 mr-2" />
                          {check}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                No security report available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
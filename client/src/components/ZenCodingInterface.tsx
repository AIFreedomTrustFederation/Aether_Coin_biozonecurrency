import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/context/AuthContext';
import Editor from '@monaco-editor/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Code,
  Copy,
  Download,
  Cpu,
  MessageSquare,
  Loader2,
  AlertTriangle,
  Check,
  XCircle,
  PlayCircle,
  Plus,
  Database,
  Server,
  Globe,
  Zap,
  Network,
  Save,
  Wand2,
  Shield,
} from 'lucide-react';

// Schema for natural language to code form
const naturalLanguageFormSchema = z.object({
  prompt: z.string().min(10, {
    message: "Prompt must be at least 10 characters.",
  }),
  language: z.string({
    required_error: "Please select a programming language",
  }),
  apiKey: z.string().optional(),
});

type NaturalLanguageFormValues = z.infer<typeof naturalLanguageFormSchema>;

// Schema for code analysis form
const codeAnalysisFormSchema = z.object({
  code: z.string().min(1, {
    message: "Code cannot be empty.",
  }),
  language: z.string({
    required_error: "Please select a programming language",
  }),
  apiKey: z.string().optional(),
});

type CodeAnalysisFormValues = z.infer<typeof codeAnalysisFormSchema>;

// Schema for project creation form
const projectCreationFormSchema = z.object({
  name: z.string().min(3, {
    message: "Project name must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Project description must be at least 10 characters.",
  }),
  inviteMatrixIds: z.array(z.string()).optional(),
});

type ProjectCreationFormValues = z.infer<typeof projectCreationFormSchema>;

// Interface for generated code
interface GeneratedCode {
  code: string;
  explanation: string;
}

// Interface for code analysis
interface CodeAnalysis {
  analysis: string;
  suggestions: string[];
  securityIssues: string[];
  performanceIssues: string[];
}

// Interface for BioZone Coding project
interface BioZoneCodingProject {
  projectId: string;
  matrixRoomId: string;
  accessUrl: string;
  secretKey: string;
}

// Programming languages supported by the system
const programmingLanguages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
];

export function BioZoneCodingUI() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('generate');
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [codeAnalysis, setCodeAnalysis] = useState<CodeAnalysis | null>(null);
  const [createdProject, setCreatedProject] = useState<BioZoneCodingProject | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const editorRef = useRef<any>(null);
  const analysisEditorRef = useRef<any>(null);
  
  // Form for natural language to code
  const nlForm = useForm<NaturalLanguageFormValues>({
    resolver: zodResolver(naturalLanguageFormSchema),
    defaultValues: {
      prompt: "",
      language: "javascript",
      apiKey: "",
    },
  });
  
  // Form for code analysis
  const analysisForm = useForm<CodeAnalysisFormValues>({
    resolver: zodResolver(codeAnalysisFormSchema),
    defaultValues: {
      code: "// Enter code to analyze",
      language: "javascript",
      apiKey: "",
    },
  });
  
  // Form for project creation
  const projectForm = useForm<ProjectCreationFormValues>({
    resolver: zodResolver(projectCreationFormSchema),
    defaultValues: {
      name: "",
      description: "",
      inviteMatrixIds: [],
    },
  });
  
  // Query to fetch Mysterion status
  const { data: mysterionStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['/api/mysterion/status'],
    queryFn: () => apiRequest('/api/mysterion/status'),
  });
  
  // Update the code in the analysis editor when language changes
  useEffect(() => {
    if (analysisEditorRef.current) {
      const language = analysisForm.watch('language');
      
      // Set some default code based on the selected language
      let defaultCode = "// Enter code to analyze";
      
      switch (language) {
        case 'javascript':
          defaultCode = "// Enter JavaScript code to analyze\nfunction example() {\n  console.log('Hello, world!');\n  return true;\n}";
          break;
        case 'typescript':
          defaultCode = "// Enter TypeScript code to analyze\nfunction example(): boolean {\n  console.log('Hello, world!');\n  return true;\n}";
          break;
        case 'python':
          defaultCode = "# Enter Python code to analyze\ndef example():\n    print('Hello, world!')\n    return True";
          break;
        default:
          defaultCode = `// Enter ${language} code to analyze`;
      }
      
      if (analysisForm.getValues('code') === '// Enter code to analyze') {
        analysisForm.setValue('code', defaultCode);
      }
    }
  }, [analysisForm.watch('language')]);
  
  // Mutation to generate code
  const generateCodeMutation = useMutation({
    mutationFn: (data: NaturalLanguageFormValues) => apiRequest('/api/mysterion/generate-code', {
      method: 'POST',
      body: data,
    }),
    onSuccess: (data) => {
      setGeneratedCode(data);
      
      // Set the generated code in the editor
      if (editorRef.current) {
        editorRef.current.setValue(data.code);
      }
      
      toast({
        title: "Code generated successfully",
        description: "The AI has generated code based on your description.",
      });
    },
    onError: (error) => {
      console.error('Error generating code:', error);
      toast({
        title: "Error generating code",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to analyze code
  const analyzeCodeMutation = useMutation({
    mutationFn: (data: CodeAnalysisFormValues) => apiRequest('/api/mysterion/analyze-code', {
      method: 'POST',
      body: data,
    }),
    onSuccess: (data) => {
      setCodeAnalysis(data);
      toast({
        title: "Code analysis complete",
        description: "The AI has analyzed your code and provided feedback.",
      });
    },
    onError: (error) => {
      console.error('Error analyzing code:', error);
      toast({
        title: "Error analyzing code",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to create a new BioZone Coding project
  const createProjectMutation = useMutation({
    mutationFn: (data: ProjectCreationFormValues) => apiRequest('/api/mysterion/biozone-coding/projects', {
      method: 'POST',
      body: data,
    }),
    onSuccess: (data) => {
      setCreatedProject(data);
      setIsCreatingProject(false);
      
      toast({
        title: "Project created successfully",
        description: "Your BioZone Coding project has been created with Matrix integration.",
      });
      
      projectForm.reset();
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      toast({
        title: "Error creating project",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission for natural language to code
  const onNLSubmit = (data: NaturalLanguageFormValues) => {
    setGeneratedCode(null);
    generateCodeMutation.mutate(data);
  };
  
  // Handle form submission for code analysis
  const onAnalysisSubmit = (data: CodeAnalysisFormValues) => {
    // Get the current code from the editor
    if (analysisEditorRef.current) {
      data.code = analysisEditorRef.current.getValue();
    }
    
    setCodeAnalysis(null);
    analyzeCodeMutation.mutate(data);
  };
  
  // Handle form submission for project creation
  const onProjectSubmit = (data: ProjectCreationFormValues) => {
    setCreatedProject(null);
    createProjectMutation.mutate(data);
  };
  
  // Handle editor mounting
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };
  
  // Handle analysis editor mounting
  const handleAnalysisEditorDidMount = (editor: any) => {
    analysisEditorRef.current = editor;
  };
  
  // Copy code to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The code has been copied to your clipboard.",
    });
  };
  
  // Download code as a file
  const downloadCode = (code: string, language: string) => {
    const fileExtension = getFileExtension(language);
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated_code${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Get file extension based on language
  const getFileExtension = (language: string): string => {
    switch (language) {
      case 'javascript':
        return '.js';
      case 'typescript':
        return '.ts';
      case 'python':
        return '.py';
      case 'go':
        return '.go';
      case 'rust':
        return '.rs';
      case 'java':
        return '.java';
      case 'csharp':
        return '.cs';
      case 'cpp':
        return '.cpp';
      case 'php':
        return '.php';
      case 'swift':
        return '.swift';
      case 'kotlin':
        return '.kt';
      case 'ruby':
        return '.rb';
      case 'html':
        return '.html';
      case 'css':
        return '.css';
      case 'sql':
        return '.sql';
      default:
        return '.txt';
    }
  };
  
  // Render service status
  const renderServiceStatus = () => {
    if (isLoadingStatus) {
      return (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Checking service status...</span>
        </div>
      );
    }
    
    if (!mysterionStatus) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Unable to connect to Mysterion services. Please try again later.
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">LLM Service</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="flex items-center">
              {mysterionStatus.llm.isInitialized ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Check className="h-3 w-3 mr-1" /> Ready
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Initializing
                </Badge>
              )}
              {mysterionStatus.llm.simulationMode && (
                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                  Simulation Mode
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Matrix Service</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="flex items-center">
              {mysterionStatus.matrix.isInitialized ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Check className="h-3 w-3 mr-1" /> Ready
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Initializing
                </Badge>
              )}
              {mysterionStatus.matrix.simulationMode && (
                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                  Simulation Mode
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Render matrix ID input fields
  const renderMatrixIdInputs = () => {
    const inviteMatrixIds = projectForm.watch('inviteMatrixIds') || [];
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <FormLabel>Matrix IDs to Invite</FormLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              projectForm.setValue('inviteMatrixIds', [...inviteMatrixIds, '']);
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        {inviteMatrixIds.map((id, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              placeholder="@username:domain.com"
              value={id}
              onChange={(e) => {
                const newIds = [...inviteMatrixIds];
                newIds[index] = e.target.value;
                projectForm.setValue('inviteMatrixIds', newIds);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                const newIds = [...inviteMatrixIds];
                newIds.splice(index, 1);
                projectForm.setValue('inviteMatrixIds', newIds);
              }}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <FormDescription>
          Enter Matrix IDs of users to invite to this project.
        </FormDescription>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-3xl font-bold">BioZone Coding UI</h1>
        <p className="text-muted-foreground">
          Harness the power of quantum-resistant LLM technology to transform natural language into secure, optimized code for the Aetherion ecosystem.
        </p>
      </div>
      
      {renderServiceStatus()}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="generate" className="flex items-center space-x-2">
            <Wand2 className="h-4 w-4" />
            <span>Generate Code</span>
          </TabsTrigger>
          <TabsTrigger value="analyze" className="flex items-center space-x-2">
            <Cpu className="h-4 w-4" />
            <span>Analyze Code</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>BioZone Projects</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Generate Code Tab */}
        <TabsContent value="generate">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Natural Language to Code</CardTitle>
                <CardDescription>
                  Describe what you want to build, and the AI will generate the code for you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...nlForm}>
                  <form onSubmit={nlForm.handleSubmit(onNLSubmit)} className="space-y-4">
                    <FormField
                      control={nlForm.control}
                      name="prompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the code you want to generate..."
                              className="min-h-[200px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Be as specific as possible about what you want the code to do.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={nlForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {programmingLanguages.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                  {lang.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the programming language for the generated code.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={nlForm.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="sk-fractalllm-..." {...field} />
                          </FormControl>
                          <FormDescription>
                            {isAdmin 
                              ? "As an admin, you can use this service without an API key."
                              : "Enter your LLM API key to use this service."}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={generateCodeMutation.isPending}
                    >
                      {generateCodeMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Generate Code
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Generated Code</CardTitle>
                  <CardDescription>
                    The AI-generated code based on your description.
                  </CardDescription>
                </div>
                {generatedCode && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedCode.code)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadCode(
                        generatedCode.code,
                        nlForm.getValues('language')
                      )}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="h-[400px] border rounded-md overflow-hidden">
                  <Editor
                    height="400px"
                    language={nlForm.watch('language')}
                    value={generatedCode?.code || "// Generated code will appear here"}
                    options={{
                      readOnly: false,
                      minimap: { enabled: false },
                      fontSize: 14,
                    }}
                    onMount={handleEditorDidMount}
                  />
                </div>
                
                {generatedCode && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Explanation</h3>
                    <div className="text-sm p-3 bg-muted rounded-md">
                      {generatedCode.explanation}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Analyze Code Tab */}
        <TabsContent value="analyze">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Code Analysis</CardTitle>
                <CardDescription>
                  Analyze your code for suggestions, security issues, and performance improvements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...analysisForm}>
                  <form onSubmit={analysisForm.handleSubmit(onAnalysisSubmit)} className="space-y-4">
                    <FormField
                      control={analysisForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {programmingLanguages.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                  {lang.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the programming language of your code.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={analysisForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code to Analyze</FormLabel>
                          <FormControl>
                            <div className="h-[300px] border rounded-md overflow-hidden">
                              <Editor
                                height="300px"
                                language={analysisForm.watch('language')}
                                value={field.value}
                                options={{
                                  minimap: { enabled: false },
                                  fontSize: 14,
                                }}
                                onChange={(value) => field.onChange(value)}
                                onMount={handleAnalysisEditorDidMount}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Enter or paste the code you want to analyze.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={analysisForm.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="sk-fractalllm-..." {...field} />
                          </FormControl>
                          <FormDescription>
                            {isAdmin 
                              ? "As an admin, you can use this service without an API key."
                              : "Enter your LLM API key to use this service."}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={analyzeCodeMutation.isPending}
                    >
                      {analyzeCodeMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Cpu className="h-4 w-4 mr-2" />
                          Analyze Code
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>
                  AI-powered analysis of your code.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyzeCodeMutation.isPending ? (
                  <div className="flex flex-col items-center justify-center h-[400px] border rounded-md p-4">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p>Analyzing your code...</p>
                  </div>
                ) : codeAnalysis ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-md">
                      <h3 className="font-medium mb-2">Overall Analysis</h3>
                      <p className="text-sm">{codeAnalysis.analysis}</p>
                    </div>
                    
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="suggestions">
                        <AccordionTrigger className="flex items-center">
                          <div className="flex items-center">
                            <Wand2 className="h-4 w-4 mr-2 text-blue-500" />
                            <span>Suggestions ({codeAnalysis.suggestions.length})</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {codeAnalysis.suggestions.length > 0 ? (
                            <ul className="space-y-2 pl-6 list-disc">
                              {codeAnalysis.suggestions.map((suggestion, index) => (
                                <li key={index} className="text-sm">{suggestion}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">No suggestions found.</p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="security">
                        <AccordionTrigger className="flex items-center">
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-red-500" />
                            <span>Security Issues ({codeAnalysis.securityIssues.length})</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {codeAnalysis.securityIssues.length > 0 ? (
                            <ul className="space-y-2 pl-6 list-disc">
                              {codeAnalysis.securityIssues.map((issue, index) => (
                                <li key={index} className="text-sm">{issue}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">No security issues found.</p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="performance">
                        <AccordionTrigger className="flex items-center">
                          <div className="flex items-center">
                            <Zap className="h-4 w-4 mr-2 text-amber-500" />
                            <span>Performance Issues ({codeAnalysis.performanceIssues.length})</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {codeAnalysis.performanceIssues.length > 0 ? (
                            <ul className="space-y-2 pl-6 list-disc">
                              {codeAnalysis.performanceIssues.map((issue, index) => (
                                <li key={index} className="text-sm">{issue}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">No performance issues found.</p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] border rounded-md p-4">
                    <Code className="h-8 w-8 mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Enter some code and click "Analyze" to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Zen Projects Tab */}
        <TabsContent value="projects">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>BioZone Coding Projects</CardTitle>
                  <CardDescription>
                    Create and manage quantum-resistant AI-assisted coding projects with Matrix collaboration for the Aetherion ecosystem.
                  </CardDescription>
                </div>
                <Button onClick={() => setIsCreatingProject(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </CardHeader>
              <CardContent>
                {createdProject ? (
                  <div className="border rounded-md p-4 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <h3 className="font-medium text-lg">Project Created Successfully</h3>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Project ID</h4>
                        <div className="flex items-center space-x-2">
                          <code className="text-xs bg-muted p-1 rounded">
                            {createdProject.projectId}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(createdProject.projectId)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-1">Matrix Room</h4>
                        <div className="flex items-center space-x-2">
                          <code className="text-xs bg-muted p-1 rounded">
                            {createdProject.matrixRoomId}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(createdProject.matrixRoomId)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="md:col-span-2">
                        <h4 className="font-medium text-sm mb-1">API Secret Key</h4>
                        <div className="flex items-center space-x-2">
                          <code className="text-xs bg-muted p-1 rounded flex-1 overflow-x-auto">
                            {createdProject.secretKey}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(createdProject.secretKey)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          This key is shown only once. Make sure to copy it now.
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Access Instructions</h4>
                      <p className="text-sm mb-2">
                        Your Matrix-integrated BioZone Coding space is ready. Use the following URL to access it:
                      </p>
                      <div className="flex items-center space-x-2 mb-4">
                        <code className="text-xs bg-muted p-2 rounded flex-1 overflow-x-auto">
                          {createdProject.accessUrl}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(createdProject.accessUrl)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline"
                          onClick={() => window.open(createdProject.accessUrl, '_blank')}
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Open Room
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setCreatedProject(null)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Another
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] border rounded-md p-4">
                    <Globe className="h-8 w-8 mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Click "New Project" to create a BioZone Coding workspace.</p>
                    <Button onClick={() => setIsCreatingProject(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Project
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Create Project Dialog */}
      <Dialog open={isCreatingProject} onOpenChange={setIsCreatingProject}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create BioZone Coding Project</DialogTitle>
            <DialogDescription>
              Create a new quantum-resistant AI-assisted coding project with Matrix collaboration for the Aetherion ecosystem.
            </DialogDescription>
          </DialogHeader>
          <Form {...projectForm}>
            <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} className="space-y-4 pt-4">
              <FormField
                control={projectForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome Project" {...field} />
                    </FormControl>
                    <FormDescription>
                      Give your project a descriptive name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={projectForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the purpose of your project..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe what you're building. This will help the AI assistant understand your project.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={projectForm.control}
                name="inviteMatrixIds"
                render={() => (
                  <FormItem>
                    {renderMatrixIdInputs()}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreatingProject(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
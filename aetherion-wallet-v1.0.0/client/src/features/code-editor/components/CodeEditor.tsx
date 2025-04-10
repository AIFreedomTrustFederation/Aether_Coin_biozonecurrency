import React, { useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2, Play, Save, FileText, FolderOpen, RefreshCw, Menu } from 'lucide-react';

// Default theme setup for the editor
const lightTheme = 'vs';
const darkTheme = 'vs-dark';

// Supported language modes for the editor
const languages = [
  { label: 'Solidity', value: 'sol' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JSON', value: 'json' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'Python', value: 'python' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
];

// Sample file system structure for initial demo
const initialFiles: Record<string, string> = {
  'SimpleStorage.sol': `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private storedData;
    
    function set(uint256 x) public {
        storedData = x;
    }
    
    function get() public view returns (uint256) {
        return storedData;
    }
}`,
  'TokenContract.sol': `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AetherionToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("Aetherion", "AET") {
        _mint(msg.sender, initialSupply);
    }
}`,
  'README.md': `
# Aetherion Smart Contracts

This workspace contains sample smart contracts that can be deployed to various blockchain networks.

## Getting Started
1. Edit the contracts in the editor
2. Compile using the "Compile" button
3. Deploy using the "Deploy" button

For more documentation, visit the Aetherion documentation at https://docs.aetherion.io
`,
};

// VS Code-like editor interface for smart contract and DApp development
const CodeEditor = () => {
  const [theme, setTheme] = useState(darkTheme);
  const [language, setLanguage] = useState('sol');
  const [files, setFiles] = useState(initialFiles);
  const [currentFile, setCurrentFile] = useState('SimpleStorage.sol');
  const [value, setValue] = useState(initialFiles[currentFile]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationResult, setCompilationResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showExplorer, setShowExplorer] = useState(true);
  
  // Check if the screen size is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setShowExplorer(!mobile);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Handle editor value change
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setValue(value);
      setFiles(prev => ({
        ...prev,
        [currentFile]: value
      }));
    }
  };

  // Language selector handler
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

  // File selector handler
  const handleFileChange = (fileName: string) => {
    setCurrentFile(fileName);
    setValue(files[fileName]);
    
    // Set language based on file extension
    const extension = fileName.split('.').pop();
    if (extension) {
      const languageMatch = languages.find(lang => lang.value === extension);
      if (languageMatch) {
        setLanguage(languageMatch.value);
      } else if (extension === 'sol') {
        setLanguage('sol');
      }
    }
  };

  // Compile the current file (simulated)
  const handleCompile = useCallback(() => {
    setIsCompiling(true);
    setCompilationResult('');
    
    // Simulate compilation process
    setTimeout(() => {
      if (currentFile.endsWith('.sol')) {
        setCompilationResult(`
Successfully compiled ${currentFile}
No errors found.

Generated ABI:
[
  {
    "inputs": [],
    "name": "get",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "x", "type": "uint256"}],
    "name": "set",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]`);
      } else {
        setCompilationResult(`File type not supported for compilation. Only Solidity files can be compiled.`);
      }
      setIsCompiling(false);
    }, 2000);
  }, [currentFile]);

  // Create a new file
  const createNewFile = () => {
    const fileName = prompt('Enter file name:');
    if (fileName && fileName.trim() !== '') {
      if (files[fileName]) {
        alert('File already exists!');
        return;
      }
      
      // Detect language from extension
      const extension = fileName.split('.').pop();
      let template = '';
      
      if (extension === 'sol') {
        template = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ${fileName.split('.')[0]} {
    // Your contract code here
}`;
      } else if (extension === 'js') {
        template = `// JavaScript file
console.log('Hello from ${fileName}');`;
      } else if (extension === 'ts') {
        template = `// TypeScript file
const greeting: string = 'Hello from ${fileName}';
console.log(greeting);`;
      } else if (extension === 'json') {
        template = `{
  "name": "${fileName.split('.')[0]}",
  "description": "Sample JSON file",
  "version": "1.0.0"
}`;
      } else if (extension === 'md') {
        template = `# ${fileName.split('.')[0]}

This is a markdown file.
`;
      }
      
      setFiles(prev => ({
        ...prev,
        [fileName]: template
      }));
      
      setCurrentFile(fileName);
      setValue(template);
    }
  };

  // Simulate a deployment (for demo purposes)
  const handleDeploy = () => {
    if (!currentFile.endsWith('.sol')) {
      alert('Only Solidity files can be deployed');
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setCompilationResult(prev => `${prev}\n\nDeploying contract to test network...
Transaction hash: 0x${Math.random().toString(16).substring(2)}
Contract deployed at: 0x${Math.random().toString(16).substring(2)}
Gas used: ${Math.floor(Math.random() * 1000000)}
`);
      setIsLoading(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-2 border-b overflow-x-auto">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={createNewFile}>
            <FileText className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">New File</span>
          </Button>
          <Button variant="outline" size="sm">
            <FolderOpen className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Open Folder</span>
          </Button>
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className={`${isMobile ? 'w-[90px]' : 'w-[150px]'}`}>
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map(lang => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleCompile}
            disabled={isCompiling || isLoading}
          >
            {isCompiling ? (
              <>
                <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
                <span className="hidden sm:inline">Compiling...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Compile</span>
              </>
            )}
          </Button>
          
          <Button 
            variant="default" 
            size="sm"
            onClick={handleDeploy}
            disabled={isLoading || isCompiling || !currentFile.endsWith('.sol')}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
                <span className="hidden sm:inline">Deploying...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Deploy</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col h-[calc(100vh-13rem)]">
        <div className="flex flex-1 overflow-hidden relative">
          {/* Toggle sidebar button for mobile */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-2 top-2 z-10 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowExplorer(!showExplorer)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          
          {/* File explorer */}
          {showExplorer && (
            <div className={`${isMobile ? 'absolute z-10 h-full bg-background shadow-lg' : ''} w-60 border-r overflow-y-auto`}>
              <div className="p-2 font-semibold text-sm flex justify-between items-center">
                <span>Explorer</span>
                {isMobile && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => setShowExplorer(false)}
                  >
                    <span className="sr-only">Close</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </Button>
                )}
              </div>
              <Separator />
              <div className="p-1">
                {Object.keys(files).map(fileName => (
                  <div 
                    key={fileName}
                    className={`p-2 text-sm rounded cursor-pointer flex items-center ${currentFile === fileName ? 'bg-accent' : 'hover:bg-muted'}`}
                    onClick={() => {
                      handleFileChange(fileName);
                      if (isMobile) setShowExplorer(false);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {fileName}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Main edit area (Monaco Editor) */}
          <div className="flex-1">
            <Editor
              height="100%"
              theme={theme}
              language={language}
              value={value}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: !isMobile },
                lineNumbers: true,
                fontSize: isMobile ? 12 : 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                quickSuggestions: true,
              }}
              loading={<div className="h-full w-full flex items-center justify-center">Loading editor...</div>}
            />
          </div>
        </div>
        
        {/* Terminal and output at the bottom */}
        <div className="h-60 border-t">
          <Tabs defaultValue="terminal" className="h-full">
            <TabsList className="w-full">
              <TabsTrigger value="terminal" className="flex-1">Terminal</TabsTrigger>
              <TabsTrigger value="output" className="flex-1">Output</TabsTrigger>
              <TabsTrigger value="problems" className="flex-1">Problems</TabsTrigger>
            </TabsList>
            
            <TabsContent value="terminal" className="h-[calc(100%-40px)] p-2">
              <div className="bg-black text-white p-3 h-full rounded font-mono text-xs overflow-y-auto">
                <div>$ npx hardhat node</div>
                <div>Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/</div>
                <div>Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266</div>
                <div>Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80</div>
                <div className="text-green-400">Ready to deploy contracts.</div>
                <div className="mt-2">$ _</div>
              </div>
            </TabsContent>
            
            <TabsContent value="output" className="h-[calc(100%-40px)] overflow-y-auto p-2">
              <Card className="h-full">
                <CardHeader className="p-3">
                  <CardTitle className="text-sm">Compilation Output</CardTitle>
                  <CardDescription className="text-xs">Results from smart contract compilation</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs whitespace-pre-wrap">
                    {compilationResult || 'No compilation results yet. Click "Compile" to start compilation.'}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="problems" className="h-[calc(100%-40px)] p-2">
              <div className="text-sm p-3">No problems detected.</div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
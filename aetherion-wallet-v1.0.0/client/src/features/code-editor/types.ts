/**
 * Types for the VS Code editor integration
 */

// Monaco editor instance type
export interface EditorInstance {
  // Basic Monaco editor functionality
  getValue: () => string;
  setValue: (value: string) => void;
  
  // Monaco editor model and viewstate
  getModel: () => any;
  getPosition: () => { lineNumber: number; column: number };
  
  // Monaco editor decorations
  deltaDecorations: (oldDecorations: string[], newDecorations: any[]) => string[];
  
  // Monaco editor actions
  executeEdits: (source: string, edits: any[]) => boolean;
  
  // VS Code specific functionality (when using Monaco in VS Code mode)
  createContextKey?: (key: string, defaultValue: any) => any;
  updateOptions?: (options: any) => void;
}

// Smart contract compilation result
export interface CompilationResult {
  success: boolean;
  bytecode?: string;
  abi?: any[];
  errors?: Array<{
    message: string;
    location?: {
      file?: string;
      line: number;
      column: number;
    };
    severity: 'error' | 'warning' | 'info';
  }>;
}

// Editor action type for plugin system
export interface EditorAction {
  id: string;
  label: string;
  keybindings?: number[];
  contextMenuGroupId?: string;
  contextMenuOrder?: number;
  run: (editor: EditorInstance) => void | Promise<void>;
}

// Extension/plugin type for the editor
export interface EditorExtension {
  id: string;
  name: string;
  description: string;
  activate: (editor: EditorInstance) => void | Promise<void>;
  deactivate?: () => void | Promise<void>;
  commands?: EditorAction[];
}

// Terminal instance within the editor
export interface TerminalInstance {
  id: string;
  name: string;
  write: (data: string) => void;
  clear: () => void;
  onData: (callback: (data: string) => void) => { dispose: () => void };
  dispose: () => void;
}

// File explorer item
export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileItem[];
  size?: number;
  lastModified?: Date;
}

// Editor configuration
export interface EditorConfig {
  theme: 'vs' | 'vs-dark' | 'hc-black';
  fontSize: number;
  fontFamily: string;
  lineNumbers: 'on' | 'off' | 'relative';
  tabSize: number;
  insertSpaces: boolean;
  autoClosingBrackets: 'always' | 'languageDefined' | 'beforeWhitespace' | 'never';
  minimap: {
    enabled: boolean;
    side: 'right' | 'left';
  };
  folding: boolean;
  wordWrap: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  formatOnType: boolean;
  formatOnPaste: boolean;
  formatOnSave: boolean;
}

// Editor context (for React context)
export interface EditorContext {
  currentFile: string | null;
  openFiles: string[];
  editor: EditorInstance | null;
  terminal: TerminalInstance | null;
  fileTree: FileItem[];
  config: EditorConfig;
  
  // Actions
  openFile: (path: string) => Promise<void>;
  closeFile: (path: string) => void;
  saveFile: (path: string, content?: string) => Promise<void>;
  createFile: (path: string, content?: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  
  // VS Code specific actions
  runCommand: (command: string) => Promise<void>;
  runTask: (task: string) => Promise<void>;
  
  // Extensions
  registerExtension: (extension: EditorExtension) => void;
  unregisterExtension: (id: string) => void;
}

// Available language modes
export type EditorLanguage = 
  'javascript' | 
  'typescript' | 
  'json' | 
  'html' | 
  'css' | 
  'solidity' | 
  'rust' | 
  'markdown' | 
  'python' | 
  'go' | 
  'shell';

// File type associations
export const languageForExtension: Record<string, EditorLanguage> = {
  '.js': 'javascript',
  '.ts': 'typescript',
  '.json': 'json',
  '.html': 'html',
  '.css': 'css',
  '.sol': 'solidity',
  '.rs': 'rust',
  '.md': 'markdown',
  '.py': 'python',
  '.go': 'go',
  '.sh': 'shell',
};
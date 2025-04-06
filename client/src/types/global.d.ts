// Global Window Interface extensions for Node.js polyfills
interface Window {
  global: Window;
  process: any; // Using 'any' to avoid TypeScript errors
  Buffer: any; // Using 'any' to avoid TypeScript errors
}
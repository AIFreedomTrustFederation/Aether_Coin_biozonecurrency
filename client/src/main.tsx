// Main entry point for the application

// Define types for our global extensions
declare global {
  interface Window {
    browserUtils: {
      textToBytes: (text: string) => Uint8Array;
      bytesToText: (bytes: Uint8Array) => string;
      bytesToHex: (bytes: Uint8Array) => string;
      hexToBytes: (hex: string) => Uint8Array;
      getRandomBytes: (size: number) => Uint8Array;
      sha256: (data: string | Uint8Array) => Promise<Uint8Array>;
    };
    Buffer: any; // Using any to avoid conflicts with Node.js types
  }
}

// Create a binary data utility that works directly with browser APIs
const browserUtils = {
  // Convert string to binary
  textToBytes: (text: string): Uint8Array => {
    return new TextEncoder().encode(text);
  },
  
  // Convert binary to string
  bytesToText: (bytes: Uint8Array): string => {
    return new TextDecoder().decode(bytes);
  },
  
  // Convert binary to hex string
  bytesToHex: (bytes: Uint8Array): string => {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },
  
  // Convert hex string to binary
  hexToBytes: (hex: string): Uint8Array => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  },
  
  // Generate random bytes
  getRandomBytes: (size: number): Uint8Array => {
    const bytes = new Uint8Array(size);
    window.crypto.getRandomValues(bytes);
    return bytes;
  },
  
  // Hash data using SHA-256
  sha256: async (data: string | Uint8Array): Promise<Uint8Array> => {
    const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', bytes);
    return new Uint8Array(hashBuffer);
  }
};

// Make our utilities available globally
window.browserUtils = browserUtils;

// Import our polyfills
import './utils/polyfills';

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add custom styles to support the Fractal Navigation
const customStyles = document.createElement('style');
customStyles.textContent = `
  .shadow-glow {
    box-shadow: 0 0 10px hsl(var(--primary));
  }
  
  .fractal-node.active {
    background-color: hsl(var(--primary));
  }
  
  .fractal-node.active::before {
    opacity: 1;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 0.8;
    }
    70% {
      transform: scale(2);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }
  
  .nav-item {
    transition: all 0.3s ease;
  }
  
  .nav-item:hover, .nav-item.active {
    border-left: 3px solid hsl(var(--primary));
  }
  
  .card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;
document.head.appendChild(customStyles);

createRoot(document.getElementById("root")!).render(<App />);

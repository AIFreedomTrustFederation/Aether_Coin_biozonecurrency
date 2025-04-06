// Import polyfills first to ensure they are loaded before any code that might need them
import { Buffer } from 'buffer';

// Polyfill for 'global'
if (typeof window !== 'undefined') {
  window.global = window;
}

// Polyfill for 'Buffer'
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

// Polyfill for 'process'
if (typeof window !== 'undefined') {
  window.process = {
    env: {},
    version: '',
    nextTick: (fn: Function) => setTimeout(fn, 0),
    browser: true
  } as any;
}

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

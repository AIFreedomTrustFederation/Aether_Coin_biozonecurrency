import { useState, useEffect } from 'react';
import { Code, Eye, EyeOff } from 'lucide-react';

// CSS to inject with higher specificity
const cssToInject = `
  .aetherion-toggle-dev-console {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(124, 58, 237, 0.9);
    color: white;
    padding: 10px 16px;
    border-radius: 12px;
    font-size: 14px;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 10000000;
    font-family: sans-serif;
    border: none;
    transition: all 0.2s ease;
    backdrop-filter: blur(4px);
  }
  
  .aetherion-toggle-dev-console:hover {
    background: rgba(124, 58, 237, 1);
    transform: translateY(-2px);
  }
  
  .aetherion-toggle-dev-console svg {
    width: 18px;
    height: 18px;
  }
  
  /* Fix pointer events for all navigation elements */
  html body a, 
  html body button,
  html body .nav-item,
  html body [role="link"],
  html body [role="button"] {
    pointer-events: auto !important;
  }
  
  /* Ensure clicks work on all important elements */
  html body header *, 
  html body nav *, 
  html body aside *,
  html body .mobile-menu *, 
  html body [class*="sidebar"] * {
    pointer-events: auto !important;
  }
`;

const DevToolsToggle = () => {
  const [devToolsVisible, setDevToolsVisible] = useState(true);
  
  // Inject button directly into body to ensure it's outside of React components
  useEffect(() => {
    // Inject CSS
    const style = document.createElement('style');
    style.textContent = cssToInject;
    document.head.appendChild(style);
    
    // Create button element with unique class name
    const button = document.createElement('button');
    button.className = 'aetherion-toggle-dev-console';
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 16l4-4-4-4"></path>
        <path d="M6 8l-4 4 4 4"></path>
        <path d="M14.5 4l-5 16"></path>
      </svg>
      <span>Toggle Dev Console</span>
    `;
    
    // Add click event
    button.addEventListener('click', () => {
      // Try to find the console using Replit-specific and common DOM locators
      const consoleSelectors = [
        // Replit specific
        '.jsx-3184167669', '.jsx-230647805', '.jsx-1307940033', '.jsx-2818342538',
        '.wrap-container', '.console-container', '.output-container', '.terminal-container',
        
        // Common browser dev console selectors
        'div[role="tabpanel"]', '.devtools', '.console-view', '.split-view',
        
        // Generic tab and identifiers that could be consoles
        'div[id*="console"]', 'div[id*="terminal"]', 'div[class*="console"]', 
        'div[class*="terminal"]', '[data-cy*="console"]', '[data-testid*="console"]',
        
        // Mobile Chrome Developer Tools elements
        '.mobile-panel', '#mobile-panel', '.mobile-toolbar',
        
        // Additional Replit-specific elements
        'div[class*="replitTop"]', 'div[class*="replitRight"]', 'div[class*="replitBottom"]'
      ];
      
      // Get all potential console elements
      let devTools = [];
      
      // Try all selectors individually to maximize chances of finding console elements
      consoleSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          devTools = [...devTools, ...elements];
        }
      });
      
      // Toggle state
      const newState = !devToolsVisible;
      setDevToolsVisible(newState);
      
      // Apply visibility change to all found elements
      if (devTools.length > 0) {
        devTools.forEach(element => {
          if (element) {
            element.style.display = newState ? '' : 'none';
          }
        });
      } else {
        // Fallback: If no specific console elements found, try higher-level containers
        // This is a more aggressive approach that might affect other UI elements
        const contentContainers = document.querySelectorAll('body > div:not(:first-child)');
        contentContainers.forEach(container => {
          container.style.display = newState ? '' : 'none';
        });
      }
      
      // Update button text and icon
      const iconSvg = newState ? 
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 16l4-4-4-4"></path>
          <path d="M6 8l-4 4 4 4"></path>
          <path d="M14.5 4l-5 16"></path>
        </svg>` : 
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 9l10 3 10-3"></path>
          <path d="M2 15l10 3 10-3"></path>
        </svg>`;
      
      button.innerHTML = `${iconSvg}<span>${newState ? 'Hide Dev Console' : 'Show Dev Console'}</span>`;
      
      console.log('DevTools toggle clicked, elements affected:', devTools.length);
    });
    
    // Append to body
    document.body.appendChild(button);
    
    // Cleanup on unmount
    return () => {
      button.remove();
      style.remove();
    };
  }, [devToolsVisible]); // Add dependency to react to state changes
  
  // Empty render as we're injecting the button directly
  return null;
};

export default DevToolsToggle;
import { useState, useEffect } from 'react';
import { Code, Eye, EyeOff } from 'lucide-react';

// CSS to inject
const cssToInject = `
  .toggle-dev-console {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 99999;
    font-family: sans-serif;
    border: none;
  }
  
  .toggle-dev-console svg {
    width: 16px;
    height: 16px;
  }
  
  .dev-tools-hidden {
    display: none !important;
  }
  
  /* Make sure the MobileMenu appears above any developer tools */
  [class*="mobile-menu"],
  [class*="mobileMenu"] {
    z-index: 999999 !important;
  }
  
  /* Ensure header is visible */
  header {
    z-index: 999998 !important;
  }
  
  /* Fix pointer events for both menus */
  nav a, 
  button,
  .nav-item {
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
    
    // Create button element
    const button = document.createElement('button');
    button.className = 'toggle-dev-console';
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
      <span>Toggle Dev Console</span>
    `;
    
    // Add click event
    button.addEventListener('click', () => {
      // Try to find the console using common DOM locators in development environments
      const consoleSelectors = [
        // Common browser dev console selectors
        'div[role="tabpanel"]', '.devtools', '.console-view', 
        
        // Replit specific
        '.jsx-3184167669', '.wrap-container', '.console-container',
        
        // Generic tab identifiers that could be consoles
        'div[id*="console"]', 'div[id*="terminal"]', 'div[class*="console"]', 
        'div[class*="terminal"]', '[data-cy*="console"]', '[data-testid*="console"]',
        
        // Mobile Chrome Developer Tools elements
        '.mobile-panel', '#mobile-panel',
        
        // Specific Chrome Developer Tools elements
        '.developer-tools-panel', '.developer-tools-view'
      ];
      
      // Create a combined selector string
      const combinedSelector = consoleSelectors.join(', ');
      
      // Get all potential console elements
      const devTools = document.querySelectorAll(combinedSelector);
      
      setDevToolsVisible(!devToolsVisible);
      
      if (devTools.length === 0) {
        // If no console elements were found, try getting higher-level containers
        // and modifying their position to push them down
        const contentContainers = document.querySelectorAll('body > div');
        contentContainers.forEach((container, index) => {
          if (index > 0) { // skip the first div which is likely our app
            if (devToolsVisible) {
              container.style.display = 'none';
            } else {
              container.style.display = '';
            }
          }
        });
      } else {
        // Toggle visibility of found console elements
        devTools.forEach(element => {
          if (element) {
            if (devToolsVisible) {
              element.style.display = 'none';
            } else {
              element.style.display = '';
            }
          }
        });
      }
      
      // Update button text
      button.querySelector('span').textContent = devToolsVisible ? 'Show Dev Console' : 'Hide Dev Console';
      
      console.log('DevTools toggle clicked, elements affected:', devTools.length);
    });
    
    // Append to body
    document.body.appendChild(button);
    
    // Cleanup on unmount
    return () => {
      button.remove();
      style.remove();
    };
  }, []);
  
  // Empty render as we're injecting the button directly
  return null;
};

export default DevToolsToggle;
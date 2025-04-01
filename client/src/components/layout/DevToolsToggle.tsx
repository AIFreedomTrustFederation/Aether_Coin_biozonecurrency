import { useEffect } from 'react';

// Simple button component that injects a CSS-only solution
const DevToolsToggle = () => {
  useEffect(() => {
    // Inject CSS that handles both the button and fixes for our app
    const injectCSS = () => {
      const css = `
        /* Rocket button to help with mobile navigation */
        #rocket-toggle {
          position: fixed;
          bottom: 80px;
          right: 20px;
          width: 60px;
          height: 60px;
          background-color: #7c3aed;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          z-index: 2147483647;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          border: none;
          cursor: pointer;
        }
        
        /* CSS to fix the UI elements */
        header {
          position: relative !important;
          z-index: 9999999 !important;
        }
        
        .mobile-menu {
          position: fixed !important;
          z-index: 9999999 !important;
        }
        
        button, a, .nav-item {
          pointer-events: auto !important;
        }
      `;
      
      const styleElement = document.createElement('style');
      styleElement.textContent = css;
      document.head.appendChild(styleElement);
      
      return styleElement;
    };
    
    // Create toggle button
    const createButton = () => {
      const button = document.createElement('button');
      button.id = 'rocket-toggle';
      button.innerHTML = '🚀';
      document.body.appendChild(button);
      
      // Simple click handler that just redirects to the home page
      button.onclick = () => {
        window.location.href = '/';
      };
      
      return button;
    };
    
    // Run it all
    const styleElement = injectCSS();
    const button = createButton();
    
    // Clean up
    return () => {
      if (styleElement) styleElement.remove();
      if (button) button.remove();
    };
  }, []);
  
  return null;
};

export default DevToolsToggle;
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
          bottom: 70px;
          right: 20px;
          width: 65px;
          height: 65px;
          background: linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          z-index: 2147483647;
          box-shadow: 0 4px 20px rgba(124, 58, 237, 0.6);
          border: 2px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform: translateZ(0);
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(124, 58, 237, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(124, 58, 237, 0);
          }
        }
        
        #rocket-toggle:active {
          transform: scale(0.9) translateZ(0);
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
      
      // Click handler that toggles the mobile menu by finding and clicking the hamburger button
      button.onclick = () => {
        // Find the hamburger button in the header and click it
        const hamburgerBtn = document.querySelector('header button[aria-label="Toggle mobile menu"]');
        if (hamburgerBtn) {
          (hamburgerBtn as HTMLElement).click();
        } else {
          // Fallback to home page if button not found
          window.location.href = '/';
        }
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
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
        
        /* Strong CSS selectors to hide Replit dev tools when the hide-dev-tools class is active */
        .hide-dev-tools iframe,
        .hide-dev-tools [class*="jsx-"],
        .hide-dev-tools [class*="replit"],
        .hide-dev-tools [id*="replit"],
        .hide-dev-tools [class*="console"],
        .hide-dev-tools [class*="terminal"],
        .hide-dev-tools [role="tabpanel"],
        .hide-dev-tools div[class*="View"],
        .hide-dev-tools div[class*="panel"],
        .hide-dev-tools div[class*="tabs"],
        .hide-dev-tools div[id*="tab"],
        .hide-dev-tools div[class*="inspector"],
        .hide-dev-tools div[class*="debugger"],
        .hide-dev-tools div[class*="monitor"] {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          max-height: 0 !important;
          max-width: 0 !important;
          overflow: hidden !important;
        }
        
        /* Ensure our app UI elements are visible and interactive */
        header {
          position: relative !important;
          z-index: 2147483647 !important;
        }
        
        .mobile-menu {
          position: fixed !important;
          z-index: 2147483647 !important;
        }
        
        /* Make all interactive elements actually interactive */
        #root button, 
        #root a, 
        header *, 
        .mobile-menu *, 
        .nav-item, 
        [role="button"], 
        [role="link"],
        [role="tab"],
        [role="menuitem"] {
          pointer-events: auto !important;
          position: relative !important;
          z-index: 500 !important;
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
      
      // Click handler that toggles between app mode and dev mode
      button.onclick = () => {
        const isInDevMode = !document.body.classList.contains('hide-dev-tools');
        
        // Toggle between app mode and dev mode
        if (isInDevMode) {
          // We're in dev mode, switch to app mode
          
          // Hide all Replit dev tools
          const hideDevTools = () => {
            // Add our hide-dev-tools class to the body to hide all developer interface elements
            document.body.classList.add('hide-dev-tools');
            
            // Update button to show we're in app mode
            button.innerHTML = '🚀';
            button.setAttribute('title', 'App Mode: Click to switch to Dev Mode');
            
            // Hide all divs that might be part of the dev console
            document.querySelectorAll('body > div').forEach(div => {
              // Skip the first div which likely contains our app
              if (div.id !== 'root' && !div.contains(document.getElementById('root'))) {
                (div as HTMLElement).style.display = 'none';
              }
            });
            
            // Set pointer-events to none for all iframes
            document.querySelectorAll('iframe').forEach(iframe => {
              (iframe as HTMLElement).style.pointerEvents = 'none';
            });
          };
          
          // Hide all dev tools
          hideDevTools();
          
          // Then open the mobile menu
          setTimeout(() => {
            const hamburgerBtn = document.querySelector('header button[aria-label="Toggle mobile menu"]');
            if (hamburgerBtn) {
              (hamburgerBtn as HTMLElement).click();
            }
          }, 100);
        } else {
          // We're in app mode, switch to dev mode
          
          // Show all Replit dev tools
          const showDevTools = () => {
            // Remove our hide-dev-tools class from the body
            document.body.classList.remove('hide-dev-tools');
            
            // Update button to show we're in dev mode
            button.innerHTML = '⚙️';
            button.setAttribute('title', 'Dev Mode: Click to switch to App Mode');
            
            // Show all divs
            document.querySelectorAll('body > div').forEach(div => {
              (div as HTMLElement).style.display = '';
            });
            
            // Restore pointer-events for all iframes
            document.querySelectorAll('iframe').forEach(iframe => {
              (iframe as HTMLElement).style.pointerEvents = 'auto';
            });
            
            // Close the mobile menu if it's open
            const mobileMenu = document.querySelector('.mobile-menu');
            if (mobileMenu && window.getComputedStyle(mobileMenu).display !== 'none') {
              const closeBtn = mobileMenu.querySelector('button[aria-label="Close"]');
              if (closeBtn) {
                (closeBtn as HTMLElement).click();
              }
            }
          };
          
          // Show all dev tools
          showDevTools();
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
import { useEffect } from 'react';

// Component that injects a button to toggle between app and developer mode
const DevToolsToggle = () => {
  useEffect(() => {
    // Super aggressive developer tools hiding function
    const autoHideDevTools = () => {
      setTimeout(() => {
        // Apply our CSS class to body
        document.body.classList.add('hide-dev-tools');
        
        // 1. Hide all body direct children except our app root
        document.querySelectorAll('body > *').forEach(element => {
          const el = element as HTMLElement;
          if (el.id !== 'root' && 
              !el.contains(document.getElementById('root')) && 
              el.id !== 'rocket-toggle') {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
            el.style.position = 'absolute';
            el.style.zIndex = '-9999';
          }
        });
        
        // 2. Hide all iframes completely
        document.querySelectorAll('iframe').forEach(iframe => {
          const el = iframe as HTMLElement;
          el.style.display = 'none';
          el.style.width = '0';
          el.style.height = '0';
          el.style.border = 'none';
          el.style.position = 'absolute';
          el.style.pointerEvents = 'none';
          el.style.opacity = '0';
        });
        
        // 3. Find and hide all console and developer tools by common class/id patterns
        const devToolSelectors = [
          '[id*="console"]', 
          '[class*="console"]',
          '[id*="element"]', 
          '[class*="element"]',
          '[id*="network"]', 
          '[class*="network"]',
          '[id*="storage"]', 
          '[class*="storage"]',
          '[id*="resource"]', 
          '[class*="resource"]',
          '[id*="setting"]', 
          '[class*="setting"]',
          '[id*="panel"]', 
          '[class*="panel"]',
          '[id*="tab"]', 
          '[class*="tab"]',
          '[role="tablist"]',
          '[role="tabpanel"]',
          '[role="tab"]'
        ];
        
        // Join all selectors and find matching elements
        const allDevElements = document.querySelectorAll(devToolSelectors.join(','));
        allDevElements.forEach(element => {
          const el = element as HTMLElement;
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
        });
        
        // 4. Update button icon
        const rocketButton = document.getElementById('rocket-toggle');
        if (rocketButton) {
          rocketButton.innerHTML = '🚀';
          rocketButton.setAttribute('title', 'App Mode: Click to switch to Dev Mode');
        }
      }, 300);
    };
    
    // Run auto-hide on startup
    autoHideDevTools();
    
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
        
        /* Extremely strong CSS selectors to hide all Replit dev tools without exceptions */
        .hide-dev-tools body > div:not(:first-child),
        .hide-dev-tools body > div:not(#root),
        .hide-dev-tools body > header:not(.app-header),
        .hide-dev-tools body > aside,
        .hide-dev-tools body > footer:not(.app-footer),
        .hide-dev-tools body > iframe,
        .hide-dev-tools iframe,
        .hide-dev-tools [class*="jsx-"],
        .hide-dev-tools [class*="replit"],
        .hide-dev-tools [id*="replit"],
        .hide-dev-tools [class*="console"],
        .hide-dev-tools [class*="terminal"],
        .hide-dev-tools [class*="localStorage"],
        .hide-dev-tools [class*="sessionStorage"],
        .hide-dev-tools [class*="cookie"],
        .hide-dev-tools [class*="script"],
        .hide-dev-tools [class*="devtools"],
        .hide-dev-tools [class*="inspector"],
        .hide-dev-tools [class*="debugger"],
        .hide-dev-tools [class*="developer"],
        .hide-dev-tools [class*="network"],
        .hide-dev-tools [class*="resources"],
        .hide-dev-tools [class*="settings"],
        .hide-dev-tools [class*="application"],
        .hide-dev-tools [class*="storage"],
        .hide-dev-tools [class*="elements"],
        .hide-dev-tools [role="tabpanel"],
        .hide-dev-tools [role="tablist"],
        .hide-dev-tools [role="toolbar"],
        .hide-dev-tools [role="menubar"],
        .hide-dev-tools div[class*="View"],
        .hide-dev-tools div[class*="Panel"],
        .hide-dev-tools div[class*="panel"],
        .hide-dev-tools div[class*="tabs"],
        .hide-dev-tools div[id*="tab"],
        .hide-dev-tools body > div > div > div:nth-child(n+2):not(.app-content) {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          max-height: 0 !important;
          max-width: 0 !important;
          overflow: hidden !important;
          position: absolute !important;
          z-index: -9999 !important;
          transform: scale(0) !important;
          filter: opacity(0) !important;
        }
        
        /* Hide specific Replit console elements */
        .hide-dev-tools #console,
        .hide-dev-tools #elements, 
        .hide-dev-tools #network,
        .hide-dev-tools #resources,
        .hide-dev-tools #settings,
        .hide-dev-tools header + div[class]:not(.app-container),
        .hide-dev-tools div[role="tablist"],
        .hide-dev-tools div[role="tab"],
        .hide-dev-tools body > script + div,
        .hide-dev-tools body > div > div[role="main"] {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
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
          
          // Hide all Replit dev tools - super aggressive approach
          const hideDevTools = () => {
            // Apply our CSS class to body
            document.body.classList.add('hide-dev-tools');
            
            // Update button to show we're in app mode
            button.innerHTML = '🚀';
            button.setAttribute('title', 'App Mode: Click to switch to Dev Mode');
            
            // Hide all body direct children except our app root
            document.querySelectorAll('body > *').forEach(element => {
              const el = element as HTMLElement;
              if (el.id !== 'root' && 
                  !el.contains(document.getElementById('root')) && 
                  el.id !== 'rocket-toggle') {
                el.style.display = 'none';
                el.style.visibility = 'hidden';
                el.style.opacity = '0';
                el.style.pointerEvents = 'none';
                el.style.position = 'absolute';
                el.style.zIndex = '-9999';
              }
            });
            
            // Hide all iframes completely
            document.querySelectorAll('iframe').forEach(iframe => {
              const el = iframe as HTMLElement;
              el.style.display = 'none';
              el.style.width = '0';
              el.style.height = '0';
              el.style.border = 'none';
              el.style.position = 'absolute';
              el.style.pointerEvents = 'none';
              el.style.opacity = '0';
            });
            
            // Find and hide all console elements
            const devToolSelectors = [
              '[id*="console"]', 
              '[class*="console"]',
              '[id*="element"]', 
              '[class*="element"]',
              '[id*="network"]', 
              '[class*="network"]',
              '[id*="storage"]', 
              '[class*="storage"]',
              '[id*="resource"]', 
              '[class*="resource"]',
              '[id*="setting"]', 
              '[class*="setting"]',
              '[id*="panel"]', 
              '[class*="panel"]',
              '[id*="tab"]', 
              '[class*="tab"]',
              '[role="tablist"]',
              '[role="tabpanel"]',
              '[role="tab"]'
            ];
            
            // Hide all console elements
            const allDevElements = document.querySelectorAll(devToolSelectors.join(','));
            allDevElements.forEach(element => {
              const el = element as HTMLElement;
              el.style.display = 'none';
              el.style.visibility = 'hidden';
              el.style.opacity = '0';
              el.style.pointerEvents = 'none';
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
          
          // Show all Replit dev tools - complete restore
          const showDevTools = () => {
            // Remove our hide-dev-tools class from the body
            document.body.classList.remove('hide-dev-tools');
            
            // Update button to show we're in dev mode
            button.innerHTML = '🛠️';
            button.setAttribute('title', 'Dev Mode: Click to switch to App Mode');
            
            // Restore all body direct children
            document.querySelectorAll('body > *').forEach(element => {
              const el = element as HTMLElement;
              el.style.display = '';
              el.style.visibility = '';
              el.style.opacity = '';
              el.style.pointerEvents = '';
              el.style.position = '';
              el.style.zIndex = '';
            });
            
            // Restore all iframes
            document.querySelectorAll('iframe').forEach(iframe => {
              const el = iframe as HTMLElement;
              el.style.display = '';
              el.style.width = '';
              el.style.height = '';
              el.style.border = '';
              el.style.position = '';
              el.style.pointerEvents = 'auto';
              el.style.opacity = '';
            });
            
            // Restore all previously hidden elements
            const devToolSelectors = [
              '[id*="console"]', 
              '[class*="console"]',
              '[id*="element"]', 
              '[class*="element"]',
              '[id*="network"]', 
              '[class*="network"]',
              '[id*="storage"]', 
              '[class*="storage"]',
              '[id*="resource"]', 
              '[class*="resource"]',
              '[id*="setting"]', 
              '[class*="setting"]',
              '[id*="panel"]', 
              '[class*="panel"]',
              '[id*="tab"]', 
              '[class*="tab"]',
              '[role="tablist"]',
              '[role="tabpanel"]',
              '[role="tab"]'
            ];
            
            // Restore all console elements
            const allDevElements = document.querySelectorAll(devToolSelectors.join(','));
            allDevElements.forEach(element => {
              const el = element as HTMLElement;
              el.style.display = '';
              el.style.visibility = '';
              el.style.opacity = '';
              el.style.pointerEvents = '';
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
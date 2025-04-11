import { useEffect } from 'react';

// Component that injects a button to toggle between app and developer mode
const DevToolsToggle = () => {
  useEffect(() => {
    // MAXIMUM AGGRESSIVE developer tools removal with active monitoring
    const autoHideDevTools = () => {
      // This MutationObserver will watch for any developer console elements and remove them
      let observer = null;
      
      // Function to actively remove ALL developer console elements
      const aggressivelyRemoveDevTools = () => {
        try {
          // Apply our CSS class to body
          document.body.classList.add('hide-dev-tools');
          
          // First attempt: Hide console elements with direct Style manipulation
          document.querySelectorAll('#Console, #Elements, #Network, #Resources, #Settings, label[for="Transparency"], label[for="Display Size"]').forEach(el => {
            try {
              // Use multiple techniques
              const element = el as HTMLElement;
              element.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; position: absolute !important; z-index: -9999 !important;';
              
              // Try to find parent div and hide it too
              let parent = element.parentElement;
              for (let i = 0; i < 3 && parent; i++) {
                if (parent && parent !== document.body && parent.id !== 'root') {
                  parent.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important;';
                }
                parent = parent.parentElement;
              }
            } catch (e) {}
          });
          
          // Second attempt: Target console panels using tab and navigation structure
          document.querySelectorAll('div[role="tab"], div[role="tablist"], div[role="tabpanel"]').forEach(el => {
            try {
              (el as HTMLElement).style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important;';
            } catch (e) {}
          });
          
          // Third attempt: Target elements by text content
          document.querySelectorAll('div, label, button, span, input[type="range"]').forEach(el => {
            try {
              if (el.textContent && (
                  el.textContent.includes('Transparency') || 
                  el.textContent.includes('Display Size') || 
                  el.textContent.includes('Restore defaults') ||
                  el.textContent.includes('Console') || 
                  el.textContent.includes('Elements') || 
                  el.textContent.includes('Network') || 
                  el.textContent.includes('Resources') || 
                  el.textContent.includes('Settings')
              )) {
                (el as HTMLElement).style.cssText = 'display: none !important;';
                
                // Hide parents too
                let parent = el.parentElement;
                for (let i = 0; i < 3 && parent; i++) {
                  if (parent && parent !== document.body && parent.id !== 'root') {
                    (parent as HTMLElement).style.cssText = 'display: none !important;';
                  }
                  parent = parent.parentElement;
                }
              }
            } catch (e) {}
          });
          
          // Hide ALL iframes (they're usually part of dev tools)
          document.querySelectorAll('iframe').forEach(iframe => {
            try {
              (iframe as HTMLElement).style.cssText = 'display: none !important; width: 0 !important; height: 0 !important; position: absolute !important; visibility: hidden !important; opacity: 0 !important;';
            } catch (e) {}
          });
          
          // Hide any top-level divs that aren't our app root
          document.querySelectorAll('body > div').forEach(div => {
            try {
              if (div.id !== 'root' && !div.contains(document.getElementById('root')) && div.id !== 'rocket-toggle') {
                (div as HTMLElement).style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important;';
              }
            } catch (e) {}
          });
          
          // Update the rocket button
          const rocketButton = document.getElementById('rocket-toggle');
          if (rocketButton) {
            rocketButton.innerHTML = '🚀';
            rocketButton.setAttribute('title', 'App Mode: Click to switch to Dev Mode');
          }
        } catch (e) {
          // Silently fail and continue
        }
      };
      
      // Run initial cleanup
      setTimeout(aggressivelyRemoveDevTools, 100);
      setTimeout(aggressivelyRemoveDevTools, 500);
      setTimeout(aggressivelyRemoveDevTools, 1000);
      
      // Set up continuous monitoring for new elements
      observer = new MutationObserver((mutations) => {
        // Don't run for every tiny mutation - debounce
        let timer;
        clearTimeout(timer);
        timer = setTimeout(() => {
          aggressivelyRemoveDevTools();
        }, 100);
      });
      
      // Start observing
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
      });
      
      // Return the observer for cleanup
      return observer;
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
        
        /* NUCLEAR OPTION: Direct targeting of dev console elements from screenshots */
        .hide-dev-tools #Console, 
        .hide-dev-tools #Elements, 
        .hide-dev-tools #Network, 
        .hide-dev-tools #Resources, 
        .hide-dev-tools #Settings,
        .hide-dev-tools div[role="tablist"],
        .hide-dev-tools div[role="tabpanel"], 
        .hide-dev-tools div[role="tab"],
        .hide-dev-tools [role="dialog"],
        .hide-dev-tools [id*="console"],
        .hide-dev-tools [id*="Console"],
        .hide-dev-tools [class*="console"],
        .hide-dev-tools [class*="Console"],
        .hide-dev-tools .Console,
        .hide-dev-tools .Elements,
        .hide-dev-tools .Network,
        .hide-dev-tools .Resources,
        .hide-dev-tools .Settings,
        .hide-dev-tools div[class*="script"],
        .hide-dev-tools label[for="Transparency"],
        .hide-dev-tools label[for="Display Size"],
        .hide-dev-tools #transparency-range,
        .hide-dev-tools #display-size-range,
        .hide-dev-tools button:has(span:contains("Restore defaults")),
        .hide-dev-tools button:contains("Restore defaults and reload"),
        .hide-dev-tools [data-testid*="devtools"],
        .hide-dev-tools [data-testid*="console"],
        .hide-dev-tools [class*="jsx-"],
        .hide-dev-tools body > div[style]:not([id]) {
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
        
        /* Specifically targeting elements from your screenshots */
        .hide-dev-tools div:has(label:contains("Transparency")),
        .hide-dev-tools div:has(label:contains("Display Size")),
        .hide-dev-tools div:has(span:contains("Restore defaults")),
        .hide-dev-tools div:has(div[role="tablist"]),
        .hide-dev-tools div[class*="toolbar"],
        .hide-dev-tools div[class*="Toolbar"],
        .hide-dev-tools div[role*="toolbar"],
        .hide-dev-tools div:has(label[for="Transparency"]),
        .hide-dev-tools div:has(label[for="Display Size"]),
        .hide-dev-tools div:has(input[type="range"]) {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          position: absolute !important;
          z-index: -9999 !important;
        }
        
        /* Hide ALL unnecessary things - extreme mode */
        .hide-dev-tools body > *:not(#root):not(#rocket-toggle) {
          display: none !important;
          visibility: hidden !important;
        }
        
        /* Override for our app components */
        .hide-dev-tools #root,
        .hide-dev-tools #root * {
          display: revert !important;
          visibility: visible !important;
          opacity: 1 !important;
          position: revert !important;
          z-index: revert !important;
          transform: none !important;
          pointer-events: auto !important;
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
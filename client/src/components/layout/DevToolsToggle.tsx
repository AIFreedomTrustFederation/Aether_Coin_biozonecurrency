import { useState, useEffect } from 'react';

// A simple component that adds a button to toggle dev tools
const DevToolsToggle = () => {
  // Use component state to track visibility
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    // Create the style element for our custom CSS
    const style = document.createElement('style');
    style.textContent = `
      /* The button styling */
      #aetherion-dev-toggle {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(124, 58, 237, 0.9);
        color: white;
        padding: 10px 16px;
        border-radius: 12px;
        font-size: 14px;
        font-family: system-ui, sans-serif;
        cursor: pointer;
        z-index: 99999999;
        border: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 10px;
        transition: transform 0.2s ease;
      }
      
      #aetherion-dev-toggle:hover {
        transform: translateY(-2px);
      }
      
      /* Styles for when dev tools are hidden */
      .hide-dev-tools iframe,
      .hide-dev-tools [class*="jsx-"],
      .hide-dev-tools [class*="replit"],
      .hide-dev-tools [id*="replit"],
      .hide-dev-tools [class*="console"],
      .hide-dev-tools [class*="terminal"],
      .hide-dev-tools .split-view,
      .hide-dev-tools [role="tabpanel"] {
        display: none !important;
      }
      
      /* Ensure our app components are always clickable */
      #root {
        z-index: 1;
      }
      
      /* Make sure navigation elements are always on top */
      header, 
      .mobile-menu,
      .sidebar,
      nav {
        z-index: 999999 !important;
      }
    `;
    document.head.appendChild(style);
    
    // Create the toggle button
    const button = document.createElement('button');
    button.id = 'aetherion-dev-toggle';
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
      <span>Toggle Dev Console</span>
    `;
    
    // Add the click handler for the button
    button.addEventListener('click', () => {
      setIsVisible(!isVisible);
      
      // Toggle the class on the body
      if (isVisible) {
        document.body.classList.add('hide-dev-tools');
        button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <span>Show Dev Console</span>
        `;
      } else {
        document.body.classList.remove('hide-dev-tools');
        button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <span>Hide Dev Console</span>
        `;
      }
      
      console.log('Developer console visibility toggled', { isVisible: !isVisible });
    });
    
    // Add the button to the document
    document.body.appendChild(button);
    
    // Fix potential z-index issues with absolute elements
    const fixZIndex = () => {
      const header = document.querySelector('header');
      if (header) header.style.zIndex = '999999';
      
      const mobileMenu = document.querySelector('[class*="mobile-menu"]');
      if (mobileMenu) mobileMenu.style.zIndex = '999999';
    };
    
    // Run the fix initially and after the DOM might have changed
    fixZIndex();
    setTimeout(fixZIndex, 1000);
    
    // Cleanup when component unmounts
    return () => {
      button.remove();
      style.remove();
      document.body.classList.remove('hide-dev-tools');
    };
  }, [isVisible]); // Re-run the effect when visibility changes
  
  return null; // This component doesn't render anything
};

export default DevToolsToggle;
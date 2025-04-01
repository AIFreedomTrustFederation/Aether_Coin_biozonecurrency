import { useState, useEffect } from 'react';
import { Code, Eye, EyeOff } from 'lucide-react';

const DevToolsToggle = () => {
  const [devToolsVisible, setDevToolsVisible] = useState(true);
  
  // Find the developer tools panels
  const toggleDevTools = () => {
    const devTools = document.querySelectorAll('.console-tab-button, .console-container');
    
    setDevToolsVisible(!devToolsVisible);
    
    // Toggle visibility for all dev tool elements
    devTools.forEach(element => {
      if (devToolsVisible) {
        element.classList.add('dev-tools-hidden');
      } else {
        element.classList.remove('dev-tools-hidden');
      }
    });
  };
  
  // Initial setup on component mount
  useEffect(() => {
    // Apply initial state if needed
    if (!devToolsVisible) {
      const devTools = document.querySelectorAll('.console-tab-button, .console-container');
      devTools.forEach(element => {
        element.classList.add('dev-tools-hidden');
      });
    }
  }, []);
  
  return (
    <button 
      className="dev-tools-toggle" 
      onClick={toggleDevTools}
      title={devToolsVisible ? "Hide Developer Tools" : "Show Developer Tools"}
    >
      <Code />
      {devToolsVisible ? (
        <>
          <EyeOff className="w-4 h-4" />
          <span>Hide Dev Tools</span>
        </>
      ) : (
        <>
          <Eye className="w-4 h-4" />
          <span>Show Dev Tools</span>
        </>
      )}
    </button>
  );
};

export default DevToolsToggle;
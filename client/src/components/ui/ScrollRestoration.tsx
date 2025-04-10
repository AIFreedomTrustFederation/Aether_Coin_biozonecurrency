import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * ScrollRestoration component
 * This component ensures that when navigation occurs, the page scrolls to the top
 * Prevents the chat or content area from jumping to the bottom on page load
 */
export const ScrollRestoration = () => {
  const [location] = useLocation();
  
  // Reset scroll position when location changes
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM updates have completed
    window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      
      // Also set scroll position for any main content containers
      const mainContent = document.querySelector('.main-content-area');
      if (mainContent) {
        (mainContent as HTMLElement).scrollTop = 0;
      }
      
      // Reset any chat container scroll positions
      const chatContainers = document.querySelectorAll('.chat-container, .message-container, .conversation-container');
      chatContainers.forEach(container => {
        if (container) {
          (container as HTMLElement).scrollTop = 0;
        }
      });
    });
  }, [location]);

  return null; // This component doesn't render anything
};

export default ScrollRestoration;
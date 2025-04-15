/**
 * EventBus for Micro-App Communication
 * 
 * This service enables communication between different micro-apps
 * without them needing to directly reference each other.
 */

type EventCallback = (data: any) => void;

/**
 * Event Bus class for pub/sub pattern between micro-apps
 */
class EventBus {
  private listeners: Record<string, EventCallback[]> = {};
  
  /**
   * Subscribe to an event
   * 
   * @param event Event name to subscribe to
   * @param callback Callback function to execute when event is published
   * @returns Unsubscribe function
   */
  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    this.listeners[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
      
      // Clean up empty event arrays
      if (this.listeners[event].length === 0) {
        delete this.listeners[event];
      }
    };
  }
  
  /**
   * Publish an event with data
   * 
   * @param event Event name to publish
   * @param data Data to pass to subscribers
   */
  publish(event: string, data: any = null): void {
    if (!this.listeners[event]) return;
    
    // Execute all callbacks registered for this event
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    });
  }
  
  /**
   * Get all registered events
   * 
   * @returns Array of event names
   */
  getRegisteredEvents(): string[] {
    return Object.keys(this.listeners);
  }
  
  /**
   * Check if an event has subscribers
   * 
   * @param event Event name to check
   * @returns Boolean indicating if event has subscribers
   */
  hasSubscribers(event: string): boolean {
    return !!this.listeners[event] && this.listeners[event].length > 0;
  }
  
  /**
   * Count subscribers for an event
   * 
   * @param event Event name to count subscribers for
   * @returns Number of subscribers
   */
  subscriberCount(event: string): number {
    return this.listeners[event]?.length || 0;
  }
  
  /**
   * Clear all subscribers for a specific event
   * 
   * @param event Event name to clear
   */
  clearEvent(event: string): void {
    delete this.listeners[event];
  }
  
  /**
   * Clear all subscribers for all events
   */
  clearAllEvents(): void {
    this.listeners = {};
  }
}

export const eventBus = new EventBus();
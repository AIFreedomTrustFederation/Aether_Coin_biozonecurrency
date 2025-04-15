/**
 * Event Bus for inter-app communication
 * 
 * This module provides a pub/sub mechanism that allows different
 * micro-apps to communicate without direct dependencies.
 */

type EventHandler = (data: any) => void;

interface EventSubscription {
  id: string;
  handler: EventHandler;
}

class EventBus {
  private events: Record<string, EventSubscription[]> = {};
  
  /**
   * Subscribe to an event
   * @param eventName Event to subscribe to
   * @param handler Handler function to be called when event is published
   * @returns Subscription ID that can be used to unsubscribe
   */
  subscribe(eventName: string, handler: EventHandler): string {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    
    const id = `${eventName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.events[eventName].push({ id, handler });
    
    return id;
  }
  
  /**
   * Unsubscribe from an event
   * @param subscriptionId Subscription ID returned from subscribe()
   */
  unsubscribe(subscriptionId: string): void {
    Object.keys(this.events).forEach(eventName => {
      this.events[eventName] = this.events[eventName].filter(
        subscription => subscription.id !== subscriptionId
      );
      
      if (this.events[eventName].length === 0) {
        delete this.events[eventName];
      }
    });
  }
  
  /**
   * Publish an event
   * @param eventName Event to publish
   * @param data Data to pass to event handlers
   */
  publish(eventName: string, data: any): void {
    if (!this.events[eventName]) {
      return;
    }
    
    this.events[eventName].forEach(subscription => {
      try {
        subscription.handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${eventName}:`, error);
      }
    });
  }
  
  /**
   * Clear all event subscriptions
   */
  clear(): void {
    this.events = {};
  }
}

// Singleton instance
export const eventBus = new EventBus();

// React hook for using the event bus
import { useEffect } from 'react';

export function useEventBus(eventName: string, handler: EventHandler) {
  useEffect(() => {
    const subscriptionId = eventBus.subscribe(eventName, handler);
    
    return () => {
      eventBus.unsubscribe(subscriptionId);
    };
  }, [eventName, handler]);
}
"use strict";
/**
 * Event Bus for inter-app communication
 *
 * This module provides a pub/sub mechanism that allows different
 * micro-apps to communicate without direct dependencies.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = exports.EventBus = void 0;
exports.useEventBus = useEventBus;
const react_1 = require("react");
class EventBus {
    constructor() {
        this.events = {};
    }
    /**
     * Subscribe to an event
     * @param eventName Event to subscribe to
     * @param handler Handler function to be called when event is published
     * @returns Subscription ID that can be used to unsubscribe
     */
    subscribe(eventName, handler) {
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
    unsubscribe(subscriptionId) {
        Object.keys(this.events).forEach(eventName => {
            this.events[eventName] = this.events[eventName].filter(subscription => subscription.id !== subscriptionId);
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
    publish(eventName, data) {
        if (!this.events[eventName]) {
            return;
        }
        this.events[eventName].forEach(subscription => {
            try {
                subscription.handler(data);
            }
            catch (error) {
                console.error(`Error in event handler for ${eventName}:`, error);
            }
        });
    }
    /**
     * Clear all event subscriptions
     */
    clear() {
        this.events = {};
    }
}
exports.EventBus = EventBus;
// Singleton instance
exports.eventBus = new EventBus();
// React hook for using the event bus
function useEventBus(eventName, handler) {
    (0, react_1.useEffect)(() => {
        const subscriptionId = exports.eventBus.subscribe(eventName, handler);
        return () => {
            exports.eventBus.unsubscribe(subscriptionId);
        };
    }, [eventName, handler]);
}

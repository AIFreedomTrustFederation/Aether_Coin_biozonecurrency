"use strict";
/**
 * node-compat.ts
 *
 * Compatibility layer for Node.js features that are commonly used
 * but not available in the browser environment.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeCompat = void 0;
/**
 * A minimal implementation of Node.js util module features
 */
exports.nodeCompat = {
    /**
     * Promisify a callback-style function
     * @param fn The function to promisify
     * @returns A function that returns a Promise
     */
    promisify: (fn) => {
        return (...args) => {
            return new Promise((resolve, reject) => {
                try {
                    // Add the callback function to the arguments
                    fn(...args, (err, result) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(result);
                        }
                    });
                }
                catch (error) {
                    reject(error);
                }
            });
        };
    },
    /**
     * Minimal EventEmitter implementation
     */
    EventEmitter: class EventEmitter {
        constructor() {
            this.listeners = {};
        }
        on(event, listener) {
            if (!this.listeners[event]) {
                this.listeners[event] = [];
            }
            this.listeners[event].push(listener);
            return this;
        }
        off(event, listener) {
            if (!this.listeners[event])
                return this;
            this.listeners[event] = this.listeners[event].filter(l => l !== listener);
            return this;
        }
        once(event, listener) {
            const onceWrapper = (...args) => {
                listener(...args);
                this.off(event, onceWrapper);
            };
            return this.on(event, onceWrapper);
        }
        emit(event, ...args) {
            if (!this.listeners[event])
                return false;
            this.listeners[event].forEach(listener => {
                try {
                    listener(...args);
                }
                catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
            return true;
        }
        removeAllListeners(event) {
            if (event) {
                delete this.listeners[event];
            }
            else {
                this.listeners = {};
            }
            return this;
        }
    },
    /**
     * Minimal Stream implementation
     */
    Stream: class Stream {
        constructor() {
            // This is just a placeholder for compatibility
            console.warn('Stream implementation is minimal and not fully compatible with Node.js streams');
        }
    },
    /**
     * Minimal Readable Stream implementation
     */
    ReadableStream: class ReadableStream {
        constructor() {
            // This is just a placeholder for compatibility
            console.warn('ReadableStream implementation is minimal and not fully compatible with Node.js streams');
        }
    }
};
exports.default = exports.nodeCompat;

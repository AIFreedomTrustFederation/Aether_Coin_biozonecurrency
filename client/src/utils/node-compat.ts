/**
 * node-compat.ts
 * 
 * Compatibility layer for Node.js features that are commonly used
 * but not available in the browser environment.
 */

/**
 * A minimal implementation of Node.js util module features
 */
export const nodeCompat = {
  /**
   * Promisify a callback-style function
   * @param fn The function to promisify
   * @returns A function that returns a Promise
   */
  promisify: (fn: Function) => {
    return (...args: any[]) => {
      return new Promise((resolve, reject) => {
        try {
          // Add the callback function to the arguments
          fn(...args, (err: Error, result: any) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    };
  },

  /**
   * Minimal EventEmitter implementation
   */
  EventEmitter: class EventEmitter {
    private listeners: Record<string, Function[]> = {};

    on(event: string, listener: Function) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(listener);
      return this;
    }

    off(event: string, listener: Function) {
      if (!this.listeners[event]) return this;
      
      this.listeners[event] = this.listeners[event].filter(l => l !== listener);
      return this;
    }

    once(event: string, listener: Function) {
      const onceWrapper = (...args: any[]) => {
        listener(...args);
        this.off(event, onceWrapper);
      };
      return this.on(event, onceWrapper);
    }

    emit(event: string, ...args: any[]) {
      if (!this.listeners[event]) return false;
      
      this.listeners[event].forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
      
      return true;
    }

    removeAllListeners(event?: string) {
      if (event) {
        delete this.listeners[event];
      } else {
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

export default nodeCompat;
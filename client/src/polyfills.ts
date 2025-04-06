// Polyfills for wallet connector libraries
// These are needed because many blockchain libraries assume Node.js environment

// Polyfill for 'global'
if (typeof window !== 'undefined') {
  (window as any).global = window;
}

// Polyfill for 'Buffer'
// Use browser compatible Buffer implementation
import { Buffer } from 'buffer';
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}

// Polyfill for 'process'
if (typeof window !== 'undefined') {
  (window as any).process = {
    env: {},
    version: '',
    nextTick: (fn: Function) => setTimeout(fn, 0)
  };
}

// Additional polyfills for other Node.js modules
if (typeof window !== 'undefined') {
  // Mock http, https modules
  (window as any).http = { 
    globalAgent: {}, 
    Agent: class Agent {}
  };
  (window as any).https = { 
    globalAgent: {}, 
    Agent: class Agent {}
  };
  
  // Mock util module
  (window as any).util = {
    debuglog: () => () => {},
    inspect: () => '',
    // Add other needed util functions
    types: {
      isDate: (obj: any) => Object.prototype.toString.call(obj) === '[object Date]',
      isRegExp: (obj: any) => Object.prototype.toString.call(obj) === '[object RegExp]'
    },
    format: (fmt: string, ...args: any[]) => fmt
  };
  
  // Mock stream module
  (window as any).stream = {
    Transform: class Transform {},
    Readable: class Readable {},
    Writable: class Writable {},
    Duplex: class Duplex {}
  };
}
// Polyfills for wallet connector libraries
// These are needed because many blockchain libraries assume Node.js environment

// Polyfill for 'global'
if (typeof window !== 'undefined') {
  (window as any).global = window;
}

// Polyfill for 'Buffer'
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
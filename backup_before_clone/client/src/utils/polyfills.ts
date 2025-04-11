/**
 * polyfills.ts
 * 
 * Browser environment polyfills for Node.js-like functionality
 * This file brings in all the necessary shims and makes them available globally
 */

import * as cryptoShim from './crypto-shim';

// Export a browser-compatible Buffer implementation
// This only includes the functionality we need for our app
export class BufferWrapper {
  private _data: Uint8Array;

  constructor(input?: number | ArrayBuffer | Uint8Array | string, encoding?: string) {
    if (typeof input === 'number') {
      this._data = new Uint8Array(input);
    } else if (input instanceof ArrayBuffer) {
      this._data = new Uint8Array(input);
    } else if (input instanceof Uint8Array) {
      this._data = new Uint8Array(input);
    } else if (typeof input === 'string') {
      if (encoding === 'hex') {
        // Convert hex string to bytes
        const bytes = new Uint8Array(Math.floor(input.length / 2));
        for (let i = 0; i < bytes.length; i++) {
          const hexByte = input.substr(i * 2, 2);
          bytes[i] = parseInt(hexByte, 16);
        }
        this._data = bytes;
      } else {
        // Default to UTF-8
        const encoder = new TextEncoder();
        this._data = encoder.encode(input);
      }
    } else {
      this._data = new Uint8Array(0);
    }
  }

  // Getters to access underlying data
  get buffer(): ArrayBuffer {
    return this._data.buffer;
  }

  get byteLength(): number {
    return this._data.byteLength;
  }

  get length(): number {
    return this._data.length;
  }

  // Array-like access
  [index: number]: number;

  // Common Buffer methods
  toString(encoding: string = 'utf8'): string {
    if (encoding === 'hex') {
      return Array.from(this._data)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } else if (encoding === 'utf8' || encoding === 'utf-8') {
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(this._data);
    } else {
      throw new Error(`Unsupported encoding: ${encoding}`);
    }
  }

  // Allow iterating through the buffer
  *[Symbol.iterator]() {
    for (let i = 0; i < this._data.length; i++) {
      yield this._data[i];
    }
  }

  // Access the underlying data
  toUint8Array(): Uint8Array {
    return this._data;
  }

  // Static factory methods
  static from(data: string | Uint8Array | ArrayBuffer, encoding?: string): BufferWrapper {
    return new BufferWrapper(data, encoding);
  }

  static alloc(size: number): BufferWrapper {
    return new BufferWrapper(size);
  }
}

// Setup the global browser utilities
if (typeof window !== 'undefined') {
  // Add browser utilities to window global
  (window as any).browserUtils = {
    textToBytes: (text: string): Uint8Array => {
      const encoder = new TextEncoder();
      return encoder.encode(text);
    },
    
    bytesToText: (bytes: Uint8Array): string => {
      const decoder = new TextDecoder();
      return decoder.decode(bytes);
    },
    
    bytesToHex: (bytes: Uint8Array): string => {
      return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    },
    
    hexToBytes: (hex: string): Uint8Array => {
      const bytes = new Uint8Array(Math.floor(hex.length / 2));
      for (let i = 0; i < bytes.length; i++) {
        const hexByte = hex.substr(i * 2, 2);
        bytes[i] = parseInt(hexByte, 16);
      }
      return bytes;
    },
    
    getRandomBytes: (size: number): Uint8Array => {
      return cryptoShim.randomBytes(size);
    },
    
    sha256: cryptoShim.sha256
  };
  
  // Add Buffer polyfill
  if (typeof (window as any).Buffer === 'undefined') {
    (window as any).Buffer = BufferWrapper;
  }
  
  console.log('Browser polyfills initialized');
}

export default {
  Buffer: BufferWrapper,
  crypto: cryptoShim
};
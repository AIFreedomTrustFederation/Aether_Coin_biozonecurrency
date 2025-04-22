"use strict";
/**
 * polyfills.ts
 *
 * Browser environment polyfills for Node.js-like functionality
 * This file brings in all the necessary shims and makes them available globally
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferWrapper = void 0;
const cryptoShim = __importStar(require("./crypto-shim"));
// Export a browser-compatible Buffer implementation
// This only includes the functionality we need for our app
class BufferWrapper {
    constructor(input, encoding) {
        if (typeof input === 'number') {
            this._data = new Uint8Array(input);
        }
        else if (input instanceof ArrayBuffer) {
            this._data = new Uint8Array(input);
        }
        else if (input instanceof Uint8Array) {
            this._data = new Uint8Array(input);
        }
        else if (typeof input === 'string') {
            if (encoding === 'hex') {
                // Convert hex string to bytes
                const bytes = new Uint8Array(Math.floor(input.length / 2));
                for (let i = 0; i < bytes.length; i++) {
                    const hexByte = input.substr(i * 2, 2);
                    bytes[i] = parseInt(hexByte, 16);
                }
                this._data = bytes;
            }
            else {
                // Default to UTF-8
                const encoder = new TextEncoder();
                this._data = encoder.encode(input);
            }
        }
        else {
            this._data = new Uint8Array(0);
        }
    }
    // Getters to access underlying data
    get buffer() {
        return this._data.buffer;
    }
    get byteLength() {
        return this._data.byteLength;
    }
    get length() {
        return this._data.length;
    }
    // Common Buffer methods
    toString(encoding = 'utf8') {
        if (encoding === 'hex') {
            return Array.from(this._data)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }
        else if (encoding === 'utf8' || encoding === 'utf-8') {
            const decoder = new TextDecoder('utf-8');
            return decoder.decode(this._data);
        }
        else {
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
    toUint8Array() {
        return this._data;
    }
    // Static factory methods
    static from(data, encoding) {
        return new BufferWrapper(data, encoding);
    }
    static alloc(size) {
        return new BufferWrapper(size);
    }
}
exports.BufferWrapper = BufferWrapper;
// Setup the global browser utilities
if (typeof window !== 'undefined') {
    // Add browser utilities to window global
    window.browserUtils = {
        textToBytes: (text) => {
            const encoder = new TextEncoder();
            return encoder.encode(text);
        },
        bytesToText: (bytes) => {
            const decoder = new TextDecoder();
            return decoder.decode(bytes);
        },
        bytesToHex: (bytes) => {
            return Array.from(bytes)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        },
        hexToBytes: (hex) => {
            const bytes = new Uint8Array(Math.floor(hex.length / 2));
            for (let i = 0; i < bytes.length; i++) {
                const hexByte = hex.substr(i * 2, 2);
                bytes[i] = parseInt(hexByte, 16);
            }
            return bytes;
        },
        getRandomBytes: (size) => {
            return cryptoShim.randomBytes(size);
        },
        sha256: cryptoShim.sha256
    };
    // Add Buffer polyfill
    if (typeof window.Buffer === 'undefined') {
        window.Buffer = BufferWrapper;
    }
    console.log('Browser polyfills initialized');
}
exports.default = {
    Buffer: BufferWrapper,
    crypto: cryptoShim
};

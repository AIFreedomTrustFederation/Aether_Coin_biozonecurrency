"use strict";
/**
 * Storage interface for the server.
 * This module provides a unified interface for interacting with the database.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = void 0;
// Import the storage instance from fixed-storage.ts
// This allows us to maintain backwards compatibility
const fixed_storage_1 = require("./fixed-storage");
Object.defineProperty(exports, "storage", { enumerable: true, get: function () { return fixed_storage_1.storage; } });

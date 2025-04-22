"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pgClient = exports.db = void 0;
require("dotenv/config");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const postgres_1 = __importDefault(require("postgres"));
const schema = __importStar(require("../shared/schema-proxy"));
// Check for required environment variables
if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
}
// Create a Postgres client with the connection string from environment variables
const connectionString = process.env.DATABASE_URL;
// Set some safe database connection options
const client = (0, postgres_1.default)(connectionString, {
    max: 10, // maximum number of connections
    idle_timeout: 20, // max seconds a connection can be idle before being terminated
    connect_timeout: 10, // max seconds to wait for a connection
    prepare: false, // automatically prepare statements
    ssl: { rejectUnauthorized: false } // Allow self-signed certificates but still use SSL encryption
});
// Create a Drizzle ORM instance with the client and schema
exports.db = (0, postgres_js_1.drizzle)(client, { schema });
// Export the client for use in migrations and other utilities
exports.pgClient = client;
// Log database connection status
try {
    console.log("Database connection initialized successfully");
}
catch (error) {
    console.error("Error initializing database connection:", error.message);
}

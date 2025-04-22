"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_kit_1 = require("drizzle-kit");
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL, ensure the database is provisioned");
}
exports.default = (0, drizzle_kit_1.defineConfig)({
    out: "./migrations",
    schema: "./shared/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
});

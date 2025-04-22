"use strict";
/**
 * Scroll Keeper Schema Definitions
 *
 * Defines data types and schemas for Scroll Keeper functionality
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertScrollKeeperSettingsSchema = exports.insertProcessingQueueItemSchema = exports.insertReflectionSchema = exports.insertScrollSchema = void 0;
const zod_1 = require("zod");
// Insert schema for creating a new scroll
exports.insertScrollSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    title: zod_1.z.string(),
    content: zod_1.z.string(),
    originalUrl: zod_1.z.string(),
    userId: zod_1.z.number().nullable().optional(),
    originalContent: zod_1.z.string().nullable().optional(),
    tags: zod_1.z.array(zod_1.z.string()).nullable().optional(),
    metadata: zod_1.z.any().optional()
});
// Insert schema for creating a new reflection
exports.insertReflectionSchema = zod_1.z.object({
    question: zod_1.z.string(),
    userId: zod_1.z.number().nullable().optional(),
    scrollId: zod_1.z.string().optional(),
    content: zod_1.z.string().optional(),
    answer: zod_1.z.string().optional(),
    scrollIds: zod_1.z.array(zod_1.z.string()).nullable().optional()
});
// Insert schema for creating a new processing queue item
exports.insertProcessingQueueItemSchema = zod_1.z.object({
    taskType: zod_1.z.enum(['scroll_extraction', 'embedding_generation', 'reflection_generation']),
    payload: zod_1.z.record(zod_1.z.any()),
    priority: zod_1.z.number().nullable().optional()
});
// Insert schema for creating new settings
exports.insertScrollKeeperSettingsSchema = zod_1.z.object({
    userId: zod_1.z.number(),
    theme: zod_1.z.string().optional(),
    defaultPromptTemplate: zod_1.z.string().nullable().optional(),
    allowPublicSharing: zod_1.z.enum(['true', 'false']).optional()
});

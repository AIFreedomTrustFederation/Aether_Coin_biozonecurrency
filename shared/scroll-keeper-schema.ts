/**
 * Scroll Keeper Schema Definitions
 * 
 * Defines data types and schemas for Scroll Keeper functionality
 */

import { z } from 'zod';
import { json } from 'drizzle-orm/pg-core';

// Scroll schema
export interface Scroll {
  id: string;
  title: string;
  content: string;
  originalUrl: string;
  originalContent: string | null;
  tags: string[] | null;
  metadata: any;
  vectorEmbedding: any;
  createdAt: Date;
  updatedAt: Date;
  userId: number | null;
}

// Insert schema for creating a new scroll
export const insertScrollSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  content: z.string(),
  originalUrl: z.string(),
  userId: z.number().nullable().optional(),
  originalContent: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  metadata: z.any().optional()
});

export type InsertScroll = z.infer<typeof insertScrollSchema>;

// Reflection schema
export interface Reflection {
  id: number;
  question: string;
  answer: string;
  scrollIds: string[] | null;
  vectorEmbedding: any;
  createdAt: Date;
  userId: number | null;
}

// Insert schema for creating a new reflection
export const insertReflectionSchema = z.object({
  question: z.string(),
  userId: z.number().nullable().optional(),
  scrollId: z.string().optional(),
  content: z.string().optional(),
  answer: z.string().optional(),
  scrollIds: z.array(z.string()).nullable().optional()
});

export type InsertReflection = z.infer<typeof insertReflectionSchema>;

// Processing queue item schema
export interface ProcessingQueueItem {
  id: number;
  createdAt: Date;
  status: string;
  taskType: 'scroll_extraction' | 'embedding_generation' | 'reflection_generation';
  payload: Record<string, any>;
  result: any;
  error: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  priority: number | null;
}

// Insert schema for creating a new processing queue item
export const insertProcessingQueueItemSchema = z.object({
  taskType: z.enum(['scroll_extraction', 'embedding_generation', 'reflection_generation']),
  payload: z.record(z.any()),
  priority: z.number().nullable().optional()
});

export type InsertProcessingQueueItem = z.infer<typeof insertProcessingQueueItemSchema>;

// Settings schema
export interface ScrollKeeperSettings {
  id: number;
  userId: number;
  theme: string;
  defaultPromptTemplate: string | null;
  allowPublicSharing: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Insert schema for creating new settings
export const insertScrollKeeperSettingsSchema = z.object({
  userId: z.number(),
  theme: z.string().optional(),
  defaultPromptTemplate: z.string().nullable().optional(),
  allowPublicSharing: z.enum(['true', 'false']).optional()
});

export type InsertScrollKeeperSettings = z.infer<typeof insertScrollKeeperSettingsSchema>;
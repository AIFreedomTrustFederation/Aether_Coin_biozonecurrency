import { pgTable, pgEnum, serial, text, timestamp, integer, boolean, json, primaryKey, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enum for message persistence levels
export const persistenceLevelEnum = pgEnum('persistence_level', ['ephemeral', 'temporary', 'standard', 'permanent']);

// Enum for message status
export const messageStatusEnum = pgEnum('message_status', ['sent', 'delivered', 'read', 'failed']);

// Enum for message types
export const messageTypeEnum = pgEnum('message_type', ['text', 'transaction', 'security', 'file', 'call', 'system']);

// Enum for encryption types
export const encryptionTypeEnum = pgEnum('encryption_type', ['none', 'aes256', 'rsa', 'hybrid', 'quantum']);

// Enum for channel type
export const channelTypeEnum = pgEnum('channel_type', ['direct', 'group', 'broadcast']);

// Enum for access control type
export const accessControlEnum = pgEnum('access_control', ['public', 'private', 'restricted']);

// TypeScript enums (not for DB)
export enum EncryptionType {
  NONE = 'none',
  AES256 = 'aes256',
  RSA = 'rsa',
  HYBRID = 'hybrid',
  QUANTUM = 'quantum'
}

export enum MessageType {
  TEXT = 'text',
  TRANSACTION = 'transaction',
  SECURITY = 'security',
  FILE = 'file',
  CALL = 'call',
  SYSTEM = 'system'
}

export enum ChannelType {
  DIRECT = 'direct',
  GROUP = 'group',
  BROADCAST = 'broadcast'
}

export enum AccessControlType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  RESTRICTED = 'restricted'
}

export enum PersistenceLevel {
  EPHEMERAL = 'ephemeral',
  TEMPORARY = 'temporary',
  STANDARD = 'standard',
  PERMANENT = 'permanent'
}

// Interface definitions for messaging system
export type MessageSignature = {
  signature: string;
  publicKey: string;
  timestamp: number;
  algorithm: string;
};

export type MessagePayload = {
  content: string;
  type: MessageType;
  metadata?: Record<string, any>;
  signature?: MessageSignature;
  encryption?: EncryptionType;
};

export type ChannelOptions = {
  name?: string;
  type: ChannelType;
  accessControl: AccessControlType;
  encryption?: EncryptionType;
  metadata?: Record<string, any>;
};

export interface Subscription {
  unsubscribe: () => void;
}

export type MessageHandler = (message: any) => void;

// Messaging channels table
export const channels = pgTable('messaging_channels', {
  id: serial('id').primaryKey(),
  name: text('name'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdById: integer('created_by_id'),
  isGroupChannel: boolean('is_group_channel').default(false),
  isEncrypted: boolean('is_encrypted').default(true),
  metadata: json('metadata'),
  publicKey: text('public_key'),
  persistenceLevel: persistenceLevelEnum('persistence_level').default('standard'),
  expiresAt: timestamp('expires_at'),
  isActive: boolean('is_active').default(true)
});

// Channel participants table
export const channelParticipants = pgTable('channel_participants', {
  channelId: integer('channel_id').notNull().references(() => channels.id),
  userId: integer('user_id').notNull(),
  joinedAt: timestamp('joined_at').defaultNow(),
  leftAt: timestamp('left_at'),
  isActive: boolean('is_active').default(true),
  role: text('role').default('member'),
  encryptionKey: text('encryption_key'),
  hashedKey: text('hashed_key'),
  publicKey: text('public_key'),
  metadata: json('metadata')
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.channelId, table.userId] }),
    channelIdIndex: uniqueIndex('channel_participants_channel_id_user_id_idx').on(table.channelId, table.userId)
  };
});

// Messages table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  channelId: integer('channel_id').notNull().references(() => channels.id),
  senderId: integer('sender_id').notNull(),
  content: text('content'),
  encryptedContent: text('encrypted_content'),
  contentHash: text('content_hash'),
  messageType: messageTypeEnum('message_type').default('text'),
  status: messageStatusEnum('status').default('sent'),
  sentAt: timestamp('sent_at').defaultNow(),
  deliveredAt: timestamp('delivered_at'),
  readAt: timestamp('read_at'),
  expiresAt: timestamp('expires_at'),
  persistenceLevel: persistenceLevelEnum('persistence_level').default('standard'),
  metadata: json('metadata'),
  isEncrypted: boolean('is_encrypted').default(true),
  replyToMessageId: integer('reply_to_message_id').references(() => messages.id),
});

// Message receipts table
export const messageReceipts = pgTable('message_receipts', {
  id: serial('id').primaryKey(),
  messageId: integer('message_id').notNull().references(() => messages.id),
  userId: integer('user_id').notNull(),
  status: messageStatusEnum('status').default('delivered'),
  receivedAt: timestamp('received_at').defaultNow(),
  readAt: timestamp('read_at'),
  metadata: json('metadata')
}, (table) => {
  return {
    messageUserIdx: uniqueIndex('message_receipts_message_id_user_id_idx').on(table.messageId, table.userId)
  };
});

// WebSocket connections table
export const wsConnections = pgTable('ws_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').notNull(),
  connectionId: text('connection_id').notNull(),
  connectedAt: timestamp('connected_at').defaultNow(),
  disconnectedAt: timestamp('disconnected_at'),
  lastPingAt: timestamp('last_ping_at').defaultNow(),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  isActive: boolean('is_active').default(true),
  metadata: json('metadata')
});

// Create Zod schemas for insert operations
export const insertChannelSchema = createInsertSchema(channels);
export const insertChannelParticipantSchema = createInsertSchema(channelParticipants);
export const insertMessageSchema = createInsertSchema(messages);
export const insertMessageReceiptSchema = createInsertSchema(messageReceipts);
export const insertWsConnectionSchema = createInsertSchema(wsConnections);

// Create TypeScript types for insert operations
export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type InsertChannelParticipant = z.infer<typeof insertChannelParticipantSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertMessageReceipt = z.infer<typeof insertMessageReceiptSchema>;
export type InsertWsConnection = z.infer<typeof insertWsConnectionSchema>;

// Create TypeScript types for select operations
export type Channel = typeof channels.$inferSelect;
export type ChannelParticipant = typeof channelParticipants.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type MessageReceipt = typeof messageReceipts.$inferSelect;
export type WsConnection = typeof wsConnections.$inferSelect;
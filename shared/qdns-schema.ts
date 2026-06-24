import { pgTable, text, serial, integer, boolean, timestamp, jsonb, primaryKey, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./schema";

// DNS Record Types
export enum DnsRecordType {
  A = 'A',           // IPv4 address
  AAAA = 'AAAA',     // IPv6 address
  CNAME = 'CNAME',   // Canonical name
  MX = 'MX',         // Mail exchange
  TXT = 'TXT',       // Text
  NS = 'NS',         // Name server
  SOA = 'SOA',       // Start of authority
  SRV = 'SRV',       // Service
  CAA = 'CAA',       // Certification Authority Authorization
  DNSKEY = 'DNSKEY', // DNS Key record
  DS = 'DS',         // Delegation Signer
  TLSA = 'TLSA',     // TLSA certificate association
  SSHFP = 'SSHFP',   // SSH public key fingerprint
  URI = 'URI',       // Uniform Resource Identifier
  QUANTUM = 'QUANTUM' // Custom record type for quantum-resistant DNS
}

// TLD Status
export enum TldStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired'
}

// Domain Status
export enum DomainStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
  LOCKED = 'locked',
  TRANSFER_PROHIBITED = 'transfer_prohibited'
}

// Nameserver Status
export enum NameserverStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance'
}

// TLD Management
export const tldConfigurations = pgTable('tld_configurations', {
  id: serial('id').primaryKey(),
  tldName: text('tld_name').notNull().unique(), // e.g., 'trust'
  description: text('description'),
  status: text('status').notNull().default(TldStatus.PENDING),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  registrationPolicy: jsonb('registration_policy'), // JSON with registration rules
  dnsSecEnabled: boolean('dnssec_enabled').default(false),
  quantumResistant: boolean('quantum_resistant').default(true),
  adminUserId: integer('admin_user_id').references(() => users.id),
  zoneFileLocation: text('zone_file_location'),
  registryLock: boolean('registry_lock').default(false),
  whoisPrivacyDefault: boolean('whois_privacy_default').default(true),
  technicalContact: jsonb('technical_contact'),
  registrationFee: jsonb('registration_fee'), // Fee structure in FractalCoin
  renewalFee: jsonb('renewal_fee'), // Fee structure in FractalCoin
  minimumRegistrationYears: integer('minimum_registration_years').default(1),
  maximumRegistrationYears: integer('maximum_registration_years').default(10)
});

// Nameservers
export const nameservers = pgTable('nameservers', {
  id: serial('id').primaryKey(),
  hostname: text('hostname').notNull().unique(), // e.g., 'ns1.aethercoin.trust'
  ipv4Address: text('ipv4_address'),
  ipv6Address: text('ipv6_address'),
  status: text('status').notNull().default(NameserverStatus.PENDING),
  isAuthoritative: boolean('is_authoritative').default(false),
  isPrimary: boolean('is_primary').default(false),
  tldId: integer('tld_id').references(() => tldConfigurations.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastHealthCheck: timestamp('last_health_check'),
  healthStatus: text('health_status'),
  location: text('location'), // Geographic location
  provider: text('provider'), // Cloud provider or self-hosted
  quantumSecurityLevel: integer('quantum_security_level').default(1), // 1-5 scale
  maintenanceWindow: jsonb('maintenance_window')
});

// Domains
export const domains = pgTable('domains', {
  id: serial('id').primaryKey(),
  domainName: text('domain_name').notNull(),
  tldId: integer('tld_id').references(() => tldConfigurations.id),
  ownerId: integer('owner_id').references(() => users.id),
  registrationDate: timestamp('registration_date').defaultNow(),
  expirationDate: timestamp('expiration_date').notNull(),
  status: text('status').notNull().default(DomainStatus.PENDING),
  autoRenew: boolean('auto_renew').default(true),
  whoisPrivacy: boolean('whois_privacy').default(true),
  registrarLock: boolean('registrar_lock').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastRenewalDate: timestamp('last_renewal_date'),
  registrationFee: jsonb('registration_fee'),
  renewalFee: jsonb('renewal_fee'),
  registrationYears: integer('registration_years').default(1),
  authCode: text('auth_code'), // Transfer authorization code
  dnsSecEnabled: boolean('dnssec_enabled').default(false),
  quantumProtectionEnabled: boolean('quantum_protection_enabled').default(true)
});

// Create a unique constraint on domain_name + tld_id
export const domainNameTldIndex = uniqueIndex('domain_name_tld_idx').on(domains).columns(domains.domainName, domains.tldId);

// DNS Records
export const dnsRecords = pgTable('dns_records', {
  id: serial('id').primaryKey(),
  domainId: integer('domain_id').references(() => domains.id).notNull(),
  recordType: text('record_type').notNull(), // A, AAAA, CNAME, MX, TXT, NS, etc.
  name: text('name').notNull(), // Subdomain or @ for root
  value: text('value').notNull(), // IP address, hostname, or text value
  ttl: integer('ttl').default(3600), // Time to live in seconds
  priority: integer('priority'), // For MX records
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  isActive: boolean('is_active').default(true),
  notes: text('notes'),
  quantumSignature: text('quantum_signature'), // For quantum-resistant verification
  lastVerified: timestamp('last_verified')
});

// DNSSEC Keys
export const dnsSecKeys = pgTable('dnssec_keys', {
  id: serial('id').primaryKey(),
  domainId: integer('domain_id').references(() => domains.id).notNull(),
  keyTag: integer('key_tag').notNull(),
  algorithm: integer('algorithm').notNull(),
  digestType: integer('digest_type').notNull(),
  digest: text('digest').notNull(),
  publicKey: text('public_key'),
  privateKey: text('private_key'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  expirationDate: timestamp('expiration_date'),
  keyType: text('key_type'), // KSK or ZSK
  quantumResistant: boolean('quantum_resistant').default(false)
});

// Domain Transfers
export const domainTransfers = pgTable('domain_transfers', {
  id: serial('id').primaryKey(),
  domainId: integer('domain_id').references(() => domains.id).notNull(),
  fromUserId: integer('from_user_id').references(() => users.id).notNull(),
  toUserId: integer('to_user_id').references(() => users.id).notNull(),
  requestDate: timestamp('request_date').defaultNow(),
  completionDate: timestamp('completion_date'),
  status: text('status').notNull(), // pending, completed, cancelled, rejected
  authCode: text('auth_code'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  expirationDate: timestamp('expiration_date'), // When the transfer request expires
  transferFee: jsonb('transfer_fee'),
  notes: text('notes')
});

// Domain Activity Logs
export const domainActivityLogs = pgTable('domain_activity_logs', {
  id: serial('id').primaryKey(),
  domainId: integer('domain_id').references(() => domains.id),
  performedBy: integer('performed_by').references(() => users.id),
  action: text('action').notNull(), // create, update, delete, transfer, renew
  timestamp: timestamp('timestamp').defaultNow(),
  details: jsonb('details'), // Additional details about the action
  ipAddress: text('ip_address'),
  userAgent: text('user_agent')
});

// Nameserver Logs
export const nameserverLogs = pgTable('nameserver_logs', {
  id: serial('id').primaryKey(),
  nameserverId: integer('nameserver_id').references(() => nameservers.id),
  timestamp: timestamp('timestamp').defaultNow(),
  eventType: text('event_type').notNull(), // startup, shutdown, error, update, health_check
  details: jsonb('details'),
  severity: text('severity').default('info') // info, warning, error, critical
});

// Zone Files
export const zoneFiles = pgTable('zone_files', {
  id: serial('id').primaryKey(),
  tldId: integer('tld_id').references(() => tldConfigurations.id),
  version: integer('version').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: integer('created_by').references(() => users.id),
  isActive: boolean('is_active').default(false),
  activatedAt: timestamp('activated_at'),
  signature: text('signature'), // Digital signature for integrity
  quantumSignature: text('quantum_signature') // Quantum-resistant signature
});

// Relations
export const tldConfigurationsRelations = relations(tldConfigurations, ({ many, one }) => ({
  nameservers: many(nameservers),
  domains: many(domains),
  zoneFiles: many(zoneFiles),
  admin: one(users, {
    fields: [tldConfigurations.adminUserId],
    references: [users.id]
  })
}));

export const nameserversRelations = relations(nameservers, ({ one }) => ({
  tld: one(tldConfigurations, {
    fields: [nameservers.tldId],
    references: [tldConfigurations.id]
  })
}));

export const domainsRelations = relations(domains, ({ many, one }) => ({
  dnsRecords: many(dnsRecords),
  dnsSecKeys: many(dnsSecKeys),
  transfers: many(domainTransfers),
  activityLogs: many(domainActivityLogs),
  tld: one(tldConfigurations, {
    fields: [domains.tldId],
    references: [tldConfigurations.id]
  }),
  owner: one(users, {
    fields: [domains.ownerId],
    references: [users.id]
  })
}));

// Type definitions
export type TldConfiguration = typeof tldConfigurations.$inferSelect;
export type InsertTldConfiguration = typeof tldConfigurations.$inferInsert;

export type Nameserver = typeof nameservers.$inferSelect;
export type InsertNameserver = typeof nameservers.$inferInsert;

export type Domain = typeof domains.$inferSelect;
export type InsertDomain = typeof domains.$inferInsert;

export type DnsRecord = typeof dnsRecords.$inferSelect;
export type InsertDnsRecord = typeof dnsRecords.$inferInsert;

export type DnsSecKey = typeof dnsSecKeys.$inferSelect;
export type InsertDnsSecKey = typeof dnsSecKeys.$inferInsert;

export type DomainTransfer = typeof domainTransfers.$inferSelect;
export type InsertDomainTransfer = typeof domainTransfers.$inferInsert;

export type DomainActivityLog = typeof domainActivityLogs.$inferSelect;
export type InsertDomainActivityLog = typeof domainActivityLogs.$inferInsert;

export type NameserverLog = typeof nameserverLogs.$inferSelect;
export type InsertNameserverLog = typeof nameserverLogs.$inferInsert;

export type ZoneFile = typeof zoneFiles.$inferSelect;
export type InsertZoneFile = typeof zoneFiles.$inferInsert;

// Zod schemas for validation
export const insertTldConfigurationSchema = createInsertSchema(tldConfigurations);
export const insertNameserverSchema = createInsertSchema(nameservers);
export const insertDomainSchema = createInsertSchema(domains);
export const insertDnsRecordSchema = createInsertSchema(dnsRecords);
export const insertDnsSecKeySchema = createInsertSchema(dnsSecKeys);
export const insertDomainTransferSchema = createInsertSchema(domainTransfers);
export const insertDomainActivityLogSchema = createInsertSchema(domainActivityLogs);
export const insertNameserverLogSchema = createInsertSchema(nameserverLogs);
export const insertZoneFileSchema = createInsertSchema(zoneFiles);

// Export all
export {
  // Tables
  tldConfigurations,
  nameservers,
  domains,
  dnsRecords,
  dnsSecKeys,
  domainTransfers,
  domainActivityLogs,
  nameserverLogs,
  zoneFiles,
  
  // Relations
  tldConfigurationsRelations,
  nameserversRelations,
  domainsRelations,
  
  // Enums
  DnsRecordType,
  TldStatus,
  DomainStatus,
  NameserverStatus
};
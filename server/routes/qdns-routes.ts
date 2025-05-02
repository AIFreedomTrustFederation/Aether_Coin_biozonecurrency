import { Router } from 'express';
import { z } from 'zod';
import { authenticateUser, isTrustMember } from '../middleware/auth';
import qdnsService from '../services/qdns-service';
import {
  DnsRecordType,
  TldStatus,
  DomainStatus,
  NameserverStatus,
  insertTldConfigurationSchema,
  insertNameserverSchema,
  insertDomainSchema,
  insertDnsRecordSchema,
  insertDnsSecKeySchema,
  insertDomainTransferSchema
} from '../../shared/qdns-schema';

// Setup router
const router = Router();

// Validation schemas
const createTldSchema = z.object({
  tldName: z.string().min(1).max(63).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  registrationPolicy: z.any().optional(),
  dnsSecEnabled: z.boolean().optional(),
  quantumResistant: z.boolean().optional(),
  whoisPrivacyDefault: z.boolean().optional(),
  technicalContact: z.any().optional(),
  registrationFee: z.any().optional(),
  renewalFee: z.any().optional(),
  minimumRegistrationYears: z.number().int().min(1).optional(),
  maximumRegistrationYears: z.number().int().min(1).optional()
});

const addNameserverSchema = z.object({
  hostname: z.string().min(1).max(255),
  ipv4Address: z.string().optional(),
  ipv6Address: z.string().optional(),
  isAuthoritative: z.boolean().optional(),
  isPrimary: z.boolean().optional(),
  location: z.string().optional(),
  provider: z.string().optional(),
  quantumSecurityLevel: z.number().int().min(1).max(5).optional()
});

const registerDomainSchema = z.object({
  domainName: z.string().min(1).max(63).regex(/^[a-z0-9-]+$/),
  tldId: z.number().int().positive(),
  registrationYears: z.number().int().min(1).optional(),
  whoisPrivacy: z.boolean().optional(),
  autoRenew: z.boolean().optional(),
  dnsSecEnabled: z.boolean().optional(),
  quantumProtectionEnabled: z.boolean().optional()
});

const upsertDnsRecordSchema = z.object({
  recordType: z.enum([
    DnsRecordType.A,
    DnsRecordType.AAAA,
    DnsRecordType.CNAME,
    DnsRecordType.MX,
    DnsRecordType.TXT,
    DnsRecordType.NS,
    DnsRecordType.SOA,
    DnsRecordType.SRV,
    DnsRecordType.CAA,
    DnsRecordType.DNSKEY,
    DnsRecordType.DS,
    DnsRecordType.TLSA,
    DnsRecordType.SSHFP,
    DnsRecordType.URI,
    DnsRecordType.QUANTUM
  ]),
  name: z.string().min(1).max(255),
  value: z.string().min(1),
  ttl: z.number().int().positive().optional(),
  priority: z.number().int().optional(),
  notes: z.string().optional()
});

const enableDnssecSchema = z.object({
  keyTag: z.number().int().positive(),
  algorithm: z.number().int().positive(),
  digestType: z.number().int().positive(),
  digest: z.string().min(1),
  publicKey: z.string().optional(),
  privateKey: z.string().optional(),
  keyType: z.string().optional(),
  quantumResistant: z.boolean().optional()
});

const initiateDomainTransferSchema = z.object({
  toUserId: z.number().int().positive(),
  authCode: z.string().min(6),
  expirationDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  notes: z.string().optional()
});

const completeDomainTransferSchema = z.object({
  authCode: z.string().min(6)
});

const renewDomainSchema = z.object({
  years: z.number().int().min(1).max(10)
});

const searchDomainsSchema = z.object({
  query: z.string().min(1),
  tldId: z.number().int().positive().optional()
});

const checkDomainAvailabilitySchema = z.object({
  domainName: z.string().min(1).max(63).regex(/^[a-z0-9-]+$/),
  tldId: z.number().int().positive()
});

// TLD Management Routes

/**
 * Get all TLDs
 */
router.get('/tlds', async (req, res) => {
  try {
    const tlds = await qdnsService.getAllTlds();
    res.json({ tlds });
  } catch (error: any) {
    console.error('Error fetching TLDs:', error);
    res.status(500).json({ error: 'Failed to fetch TLDs', message: error.message });
  }
});

/**
 * Create a new TLD (admin only)
 */
router.post('/tlds', authenticateUser, isTrustMember, async (req, res) => {
  try {
    const validatedData = createTldSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ error: 'Invalid TLD data', issues: validatedData.error.issues });
    }
    
    const tldData = insertTldConfigurationSchema.parse({
      ...validatedData.data,
      status: TldStatus.PENDING
    });
    
    const tld = await qdnsService.createTld(req.user!.id, tldData);
    res.status(201).json({ tld });
  } catch (error: any) {
    console.error('Error creating TLD:', error);
    res.status(500).json({ error: 'Failed to create TLD', message: error.message });
  }
});

/**
 * Get TLD details
 */
router.get('/tlds/:id', async (req, res) => {
  try {
    const tldId = parseInt(req.params.id, 10);
    if (isNaN(tldId)) {
      return res.status(400).json({ error: 'Invalid TLD ID' });
    }
    
    const tldDetails = await qdnsService.getTldWithDetails(tldId);
    res.json(tldDetails);
  } catch (error: any) {
    console.error('Error fetching TLD details:', error);
    res.status(500).json({ error: 'Failed to fetch TLD details', message: error.message });
  }
});

/**
 * Add a nameserver to a TLD (admin only)
 */
router.post('/tlds/:id/nameservers', authenticateUser, isTrustMember, async (req, res) => {
  try {
    const tldId = parseInt(req.params.id, 10);
    if (isNaN(tldId)) {
      return res.status(400).json({ error: 'Invalid TLD ID' });
    }
    
    const validatedData = addNameserverSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ error: 'Invalid nameserver data', issues: validatedData.error.issues });
    }
    
    const nameserverData = insertNameserverSchema.parse({
      ...validatedData.data,
      status: NameserverStatus.PENDING
    });
    
    const nameserver = await qdnsService.addNameserver(tldId, nameserverData);
    res.status(201).json({ nameserver });
  } catch (error: any) {
    console.error('Error adding nameserver:', error);
    res.status(500).json({ error: 'Failed to add nameserver', message: error.message });
  }
});

/**
 * Get nameservers for a TLD
 */
router.get('/tlds/:id/nameservers', async (req, res) => {
  try {
    const tldId = parseInt(req.params.id, 10);
    if (isNaN(tldId)) {
      return res.status(400).json({ error: 'Invalid TLD ID' });
    }
    
    const nameservers = await qdnsService.getNameserversForTld(tldId);
    res.json({ nameservers });
  } catch (error: any) {
    console.error('Error fetching nameservers:', error);
    res.status(500).json({ error: 'Failed to fetch nameservers', message: error.message });
  }
});

/**
 * Get zone file for a TLD
 */
router.get('/tlds/:id/zone', authenticateUser, isTrustMember, async (req, res) => {
  try {
    const tldId = parseInt(req.params.id, 10);
    if (isNaN(tldId)) {
      return res.status(400).json({ error: 'Invalid TLD ID' });
    }
    
    const zoneFile = await qdnsService.getZoneFileForTld(tldId);
    
    if (!zoneFile) {
      return res.status(404).json({ error: 'Zone file not found' });
    }
    
    res.json({ zoneFile });
  } catch (error: any) {
    console.error('Error fetching zone file:', error);
    res.status(500).json({ error: 'Failed to fetch zone file', message: error.message });
  }
});

// Domain Management Routes

/**
 * Register a new domain
 */
router.post('/domains', authenticateUser, async (req, res) => {
  try {
    const validatedData = registerDomainSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ error: 'Invalid domain data', issues: validatedData.error.issues });
    }
    
    // Check domain availability
    const isAvailable = await qdnsService.checkDomainAvailability(
      validatedData.data.domainName,
      validatedData.data.tldId
    );
    
    if (!isAvailable) {
      return res.status(400).json({ error: 'Domain is not available' });
    }
    
    const domainData = insertDomainSchema.parse({
      ...validatedData.data,
      status: DomainStatus.PENDING
    });
    
    const domain = await qdnsService.registerDomain(req.user!.id, domainData);
    res.status(201).json({ domain });
  } catch (error: any) {
    console.error('Error registering domain:', error);
    res.status(500).json({ error: 'Failed to register domain', message: error.message });
  }
});

/**
 * Get domains for the current user
 */
router.get('/domains', authenticateUser, async (req, res) => {
  try {
    const domains = await qdnsService.getDomainsForUser(req.user!.id);
    res.json({ domains });
  } catch (error: any) {
    console.error('Error fetching domains:', error);
    res.status(500).json({ error: 'Failed to fetch domains', message: error.message });
  }
});

/**
 * Get domain details
 */
router.get('/domains/:id', authenticateUser, async (req, res) => {
  try {
    const domainId = parseInt(req.params.id, 10);
    if (isNaN(domainId)) {
      return res.status(400).json({ error: 'Invalid domain ID' });
    }
    
    const domain = await qdnsService.getDomainById(domainId);
    
    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }
    
    // Check if user owns this domain or is an admin
    if (domain.ownerId !== req.user!.id && !req.user!.isTrustMember) {
      return res.status(403).json({ error: 'You do not have permission to access this domain' });
    }
    
    const domainDetails = await qdnsService.getDomainWithDetails(domainId);
    res.json(domainDetails);
  } catch (error: any) {
    console.error('Error fetching domain details:', error);
    res.status(500).json({ error: 'Failed to fetch domain details', message: error.message });
  }
});

/**
 * Add or update a DNS record
 */
router.post('/domains/:id/dns', authenticateUser, async (req, res) => {
  try {
    const domainId = parseInt(req.params.id, 10);
    if (isNaN(domainId)) {
      return res.status(400).json({ error: 'Invalid domain ID' });
    }
    
    const validatedData = upsertDnsRecordSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ error: 'Invalid DNS record data', issues: validatedData.error.issues });
    }
    
    const recordData = insertDnsRecordSchema.parse(validatedData.data);
    const recordId = req.body.id ? parseInt(req.body.id, 10) : undefined;
    
    const dnsRecord = await qdnsService.upsertDnsRecord(req.user!.id, domainId, recordData, recordId);
    res.json({ dnsRecord });
  } catch (error: any) {
    console.error('Error upserting DNS record:', error);
    res.status(500).json({ error: 'Failed to upsert DNS record', message: error.message });
  }
});

/**
 * Delete a DNS record
 */
router.delete('/domains/:domainId/dns/:recordId', authenticateUser, async (req, res) => {
  try {
    const domainId = parseInt(req.params.domainId, 10);
    const recordId = parseInt(req.params.recordId, 10);
    
    if (isNaN(domainId) || isNaN(recordId)) {
      return res.status(400).json({ error: 'Invalid domain ID or record ID' });
    }
    
    await qdnsService.deleteDnsRecord(req.user!.id, domainId, recordId);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting DNS record:', error);
    res.status(500).json({ error: 'Failed to delete DNS record', message: error.message });
  }
});

/**
 * Get DNS records for a domain
 */
router.get('/domains/:id/dns', authenticateUser, async (req, res) => {
  try {
    const domainId = parseInt(req.params.id, 10);
    if (isNaN(domainId)) {
      return res.status(400).json({ error: 'Invalid domain ID' });
    }
    
    const domain = await qdnsService.getDomainById(domainId);
    
    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }
    
    // Check if user owns this domain or is an admin
    if (domain.ownerId !== req.user!.id && !req.user!.isTrustMember) {
      return res.status(403).json({ error: 'You do not have permission to access this domain' });
    }
    
    const dnsRecords = await qdnsService.getDnsRecordsForDomain(domainId);
    res.json({ dnsRecords });
  } catch (error: any) {
    console.error('Error fetching DNS records:', error);
    res.status(500).json({ error: 'Failed to fetch DNS records', message: error.message });
  }
});

/**
 * Enable DNSSEC for a domain
 */
router.post('/domains/:id/dnssec', authenticateUser, async (req, res) => {
  try {
    const domainId = parseInt(req.params.id, 10);
    if (isNaN(domainId)) {
      return res.status(400).json({ error: 'Invalid domain ID' });
    }
    
    const validatedData = enableDnssecSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ error: 'Invalid DNSSEC data', issues: validatedData.error.issues });
    }
    
    const keyData = insertDnsSecKeySchema.parse(validatedData.data);
    
    const dnsSecKey = await qdnsService.enableDnssec(req.user!.id, domainId, keyData);
    res.json({ dnsSecKey });
  } catch (error: any) {
    console.error('Error enabling DNSSEC:', error);
    res.status(500).json({ error: 'Failed to enable DNSSEC', message: error.message });
  }
});

/**
 * Disable DNSSEC for a domain
 */
router.delete('/domains/:id/dnssec', authenticateUser, async (req, res) => {
  try {
    const domainId = parseInt(req.params.id, 10);
    if (isNaN(domainId)) {
      return res.status(400).json({ error: 'Invalid domain ID' });
    }
    
    await qdnsService.disableDnssec(req.user!.id, domainId);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error disabling DNSSEC:', error);
    res.status(500).json({ error: 'Failed to disable DNSSEC', message: error.message });
  }
});

/**
 * Initiate a domain transfer
 */
router.post('/domains/:id/transfer', authenticateUser, async (req, res) => {
  try {
    const domainId = parseInt(req.params.id, 10);
    if (isNaN(domainId)) {
      return res.status(400).json({ error: 'Invalid domain ID' });
    }
    
    const validatedData = initiateDomainTransferSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ error: 'Invalid transfer data', issues: validatedData.error.issues });
    }
    
    const transferData = insertDomainTransferSchema.parse(validatedData.data);
    
    const transfer = await qdnsService.initiateDomainTransfer(
      req.user!.id,
      validatedData.data.toUserId,
      domainId,
      transferData
    );
    
    res.json({ transfer });
  } catch (error: any) {
    console.error('Error initiating domain transfer:', error);
    res.status(500).json({ error: 'Failed to initiate domain transfer', message: error.message });
  }
});

/**
 * Complete a domain transfer
 */
router.post('/transfers/:id/complete', authenticateUser, async (req, res) => {
  try {
    const transferId = parseInt(req.params.id, 10);
    if (isNaN(transferId)) {
      return res.status(400).json({ error: 'Invalid transfer ID' });
    }
    
    const validatedData = completeDomainTransferSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ error: 'Invalid data', issues: validatedData.error.issues });
    }
    
    const domain = await qdnsService.completeDomainTransfer(
      req.user!.id,
      transferId,
      validatedData.data.authCode
    );
    
    res.json({ domain });
  } catch (error: any) {
    console.error('Error completing domain transfer:', error);
    res.status(500).json({ error: 'Failed to complete domain transfer', message: error.message });
  }
});

/**
 * Get pending transfers for the current user
 */
router.get('/transfers/pending', authenticateUser, async (req, res) => {
  try {
    const transfers = await qdnsService.getPendingTransfersForUser(req.user!.id);
    res.json({ transfers });
  } catch (error: any) {
    console.error('Error fetching pending transfers:', error);
    res.status(500).json({ error: 'Failed to fetch pending transfers', message: error.message });
  }
});

/**
 * Renew a domain
 */
router.post('/domains/:id/renew', authenticateUser, async (req, res) => {
  try {
    const domainId = parseInt(req.params.id, 10);
    if (isNaN(domainId)) {
      return res.status(400).json({ error: 'Invalid domain ID' });
    }
    
    const validatedData = renewDomainSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ error: 'Invalid renewal data', issues: validatedData.error.issues });
    }
    
    const domain = await qdnsService.renewDomain(req.user!.id, domainId, validatedData.data.years);
    res.json({ domain });
  } catch (error: any) {
    console.error('Error renewing domain:', error);
    res.status(500).json({ error: 'Failed to renew domain', message: error.message });
  }
});

/**
 * Search domains
 */
router.post('/domains/search', async (req, res) => {
  try {
    const validatedData = searchDomainsSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ error: 'Invalid search data', issues: validatedData.error.issues });
    }
    
    const domains = await qdnsService.searchDomains(validatedData.data.query, validatedData.data.tldId);
    res.json({ domains });
  } catch (error: any) {
    console.error('Error searching domains:', error);
    res.status(500).json({ error: 'Failed to search domains', message: error.message });
  }
});

/**
 * Check domain availability
 */
router.post('/domains/check', async (req, res) => {
  try {
    const validatedData = checkDomainAvailabilitySchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ error: 'Invalid data', issues: validatedData.error.issues });
    }
    
    const isAvailable = await qdnsService.checkDomainAvailability(
      validatedData.data.domainName,
      validatedData.data.tldId
    );
    
    res.json({ isAvailable });
  } catch (error: any) {
    console.error('Error checking domain availability:', error);
    res.status(500).json({ error: 'Failed to check domain availability', message: error.message });
  }
});

/**
 * Get activity logs for a domain
 */
router.get('/domains/:id/logs', authenticateUser, async (req, res) => {
  try {
    const domainId = parseInt(req.params.id, 10);
    if (isNaN(domainId)) {
      return res.status(400).json({ error: 'Invalid domain ID' });
    }
    
    const domain = await qdnsService.getDomainById(domainId);
    
    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }
    
    // Check if user owns this domain or is an admin
    if (domain.ownerId !== req.user!.id && !req.user!.isTrustMember) {
      return res.status(403).json({ error: 'You do not have permission to access this domain' });
    }
    
    const logs = await qdnsService.getActivityLogsForDomain(domainId);
    res.json({ logs });
  } catch (error: any) {
    console.error('Error fetching domain logs:', error);
    res.status(500).json({ error: 'Failed to fetch domain logs', message: error.message });
  }
});

/**
 * WHOIS lookup
 */
router.get('/whois/:domain', async (req, res) => {
  try {
    const domainParts = req.params.domain.split('.');
    
    if (domainParts.length < 2) {
      return res.status(400).json({ error: 'Invalid domain format' });
    }
    
    const tldName = domainParts.pop()!;
    const domainName = domainParts.join('.');
    
    const whoisData = await qdnsService.generateWhoisResponse(domainName, tldName);
    res.json({ whoisData });
  } catch (error: any) {
    console.error('Error performing WHOIS lookup:', error);
    res.status(500).json({ error: 'Failed to perform WHOIS lookup', message: error.message });
  }
});

/**
 * Get nameserver health
 */
router.get('/nameservers/:id/health', authenticateUser, isTrustMember, async (req, res) => {
  try {
    const nameserverId = parseInt(req.params.id, 10);
    if (isNaN(nameserverId)) {
      return res.status(400).json({ error: 'Invalid nameserver ID' });
    }
    
    const health = await qdnsService.getNameserverHealth(nameserverId);
    res.json(health);
  } catch (error: any) {
    console.error('Error fetching nameserver health:', error);
    res.status(500).json({ error: 'Failed to fetch nameserver health', message: error.message });
  }
});

/**
 * Update nameserver health
 */
router.post('/nameservers/:id/health', authenticateUser, isTrustMember, async (req, res) => {
  try {
    const nameserverId = parseInt(req.params.id, 10);
    if (isNaN(nameserverId)) {
      return res.status(400).json({ error: 'Invalid nameserver ID' });
    }
    
    const { healthStatus, details } = req.body;
    
    if (!healthStatus) {
      return res.status(400).json({ error: 'Health status is required' });
    }
    
    await qdnsService.updateNameserverHealth(nameserverId, healthStatus, details || {});
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating nameserver health:', error);
    res.status(500).json({ error: 'Failed to update nameserver health', message: error.message });
  }
});

export default router;
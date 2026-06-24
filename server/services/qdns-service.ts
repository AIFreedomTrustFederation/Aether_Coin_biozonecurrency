import path from 'path';
import fs from 'fs';
import { db } from '../db';
import { eq, and, gte, like, or } from 'drizzle-orm';
import {
  tldConfigurations,
  nameservers,
  domains,
  dnsRecords,
  dnsSecKeys,
  domainTransfers,
  domainActivityLogs,
  nameserverLogs,
  zoneFiles,
  DnsRecordType,
  TldStatus,
  DomainStatus,
  NameserverStatus,
  type TldConfiguration,
  type Nameserver,
  type Domain,
  type DnsRecord,
  type DnsSecKey,
  type DomainTransfer,
  type DomainActivityLog,
  type NameserverLog,
  type ZoneFile,
  type InsertTldConfiguration,
  type InsertNameserver,
  type InsertDomain,
  type InsertDnsRecord,
  type InsertDnsSecKey,
  type InsertDomainTransfer,
  type InsertDomainActivityLog,
  type InsertNameserverLog,
  type InsertZoneFile
} from '../../shared/qdns-schema';
import { getQuantumSecurityService } from './quantum-security-service';

// Environment variables
const QDNS_ZONE_FILE_PATH = process.env.QDNS_ZONE_FILE_PATH || './zone-files';
const QDNS_DEFAULT_TTL = parseInt(process.env.QDNS_DEFAULT_TTL || '3600', 10);
const QDNS_QUANTUM_SECURITY = process.env.QDNS_QUANTUM_SECURITY === 'true';
const DEBUG = process.env.DEBUG === 'true';

// Debug logging
function log(...args: any[]) {
  if (DEBUG) {
    console.log('[QDNS Service]', ...args);
  }
}

/**
 * Create a new TLD configuration
 */
export async function createTld(
  adminUserId: number,
  tldData: InsertTldConfiguration
): Promise<TldConfiguration> {
  try {
    const [tld] = await db.insert(tldConfigurations)
      .values({
        ...tldData,
        adminUserId
      })
      .returning();

    if (!tld) {
      throw new Error('Failed to create TLD configuration');
    }

    log('TLD created:', tld.tldName);

    // Create default zone file
    await createDefaultZoneFile(tld.id, adminUserId);

    return tld;
  } catch (error) {
    console.error('Error creating TLD:', error);
    throw error;
  }
}

/**
 * Create a default zone file for a TLD
 */
async function createDefaultZoneFile(tldId: number, userId: number): Promise<ZoneFile> {
  try {
    const tld = await getTldById(tldId);
    if (!tld) {
      throw new Error(`TLD with ID ${tldId} not found`);
    }

    // Create directory if it doesn't exist
    const dirPath = path.resolve(QDNS_ZONE_FILE_PATH);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Generate SOA record and basic zone file content
    const zoneContent = generateDefaultZoneContent(tld);

    // Save to database
    const [zoneFile] = await db.insert(zoneFiles)
      .values({
        tldId,
        version: 1,
        content: zoneContent,
        createdBy: userId,
        isActive: true,
        activatedAt: new Date()
      })
      .returning();

    if (!zoneFile) {
      throw new Error('Failed to create zone file');
    }

    // Write to file system
    const filePath = path.join(dirPath, `${tld.tldName}.zone`);
    fs.writeFileSync(filePath, zoneContent);

    // Update TLD with zone file location
    await db.update(tldConfigurations)
      .set({ zoneFileLocation: filePath })
      .where(eq(tldConfigurations.id, tldId));

    // If quantum security is enabled, sign the zone file
    if (QDNS_QUANTUM_SECURITY) {
      const quantumService = getQuantumSecurityService();
      const signature = await quantumService.signData(zoneContent);
      
      await db.update(zoneFiles)
        .set({ quantumSignature: signature })
        .where(eq(zoneFiles.id, zoneFile.id));
    }

    return zoneFile;
  } catch (error) {
    console.error('Error creating default zone file:', error);
    throw error;
  }
}

/**
 * Generate default zone file content
 */
function generateDefaultZoneContent(tld: TldConfiguration): string {
  const now = new Date();
  const serial = parseInt(
    now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    '01', // Version 01 for today
    10
  );

  return `; Zone file for ${tld.tldName} TLD
$ORIGIN ${tld.tldName}.
$TTL ${QDNS_DEFAULT_TTL}

; SOA Record
@       IN      SOA     ns1.${tld.tldName}. admin.${tld.tldName}. (
                        ${serial}  ; Serial
                        3600       ; Refresh
                        1800       ; Retry
                        604800     ; Expire
                        86400 )    ; Minimum TTL

; NS Records
@       IN      NS      ns1.${tld.tldName}.
@       IN      NS      ns2.${tld.tldName}.

; A Records for nameservers
ns1     IN      A       127.0.0.1  ; Replace with actual IP
ns2     IN      A       127.0.0.1  ; Replace with actual IP

; Root domain
@       IN      A       127.0.0.1  ; Replace with actual IP
www     IN      CNAME   @
`;
}

/**
 * Add a nameserver to a TLD
 */
export async function addNameserver(
  tldId: number,
  nameserverData: InsertNameserver
): Promise<Nameserver> {
  try {
    const tld = await getTldById(tldId);
    if (!tld) {
      throw new Error(`TLD with ID ${tldId} not found`);
    }

    const [nameserver] = await db.insert(nameservers)
      .values({
        ...nameserverData,
        tldId
      })
      .returning();

    if (!nameserver) {
      throw new Error('Failed to add nameserver');
    }

    log('Nameserver added:', nameserver.hostname);

    // Log nameserver creation
    await logNameserverEvent(nameserver.id, 'create', {
      hostname: nameserver.hostname,
      ipv4Address: nameserver.ipv4Address,
      ipv6Address: nameserver.ipv6Address
    });

    // Update zone file with new nameserver
    await updateZoneFileWithNameserver(tldId, nameserver);

    return nameserver;
  } catch (error) {
    console.error('Error adding nameserver:', error);
    throw error;
  }
}

/**
 * Update zone file with new nameserver
 */
async function updateZoneFileWithNameserver(tldId: number, nameserver: Nameserver): Promise<void> {
  try {
    // Get the active zone file
    const [activeZoneFile] = await db.select()
      .from(zoneFiles)
      .where(
        and(
          eq(zoneFiles.tldId, tldId),
          eq(zoneFiles.isActive, true)
        )
      )
      .limit(1);

    if (!activeZoneFile) {
      throw new Error('No active zone file found');
    }

    // Parse the zone file content
    let content = activeZoneFile.content;
    
    // Add NS record if not exists
    if (!content.includes(`IN      NS      ${nameserver.hostname}`)) {
      const nsLine = `@       IN      NS      ${nameserver.hostname}.\n`;
      // Insert after the last NS record or after SOA if no NS records
      const soaEndIndex = content.indexOf(')') + 1;
      const nsSection = content.indexOf('NS');
      
      if (nsSection > 0 && nsSection > soaEndIndex) {
        // Find the end of the NS section
        const lines = content.split('\n');
        let nsEndIndex = 0;
        let inNsSection = false;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('IN      NS') && !inNsSection) {
            inNsSection = true;
          } else if (inNsSection && !lines[i].includes('IN      NS') && lines[i].trim() !== '') {
            nsEndIndex = i;
            break;
          }
        }
        
        if (nsEndIndex > 0) {
          const before = lines.slice(0, nsEndIndex).join('\n');
          const after = lines.slice(nsEndIndex).join('\n');
          content = before + '\n' + nsLine + after;
        } else {
          // Append to the end of the file if we couldn't find the end of the NS section
          content += nsLine;
        }
      } else {
        // Insert after SOA
        const before = content.substring(0, soaEndIndex + 1);
        const after = content.substring(soaEndIndex + 1);
        content = before + '\n\n; NS Records\n' + nsLine + after;
      }
    }
    
    // Add A record for nameserver if IPv4 is provided
    if (nameserver.ipv4Address && !content.includes(`${nameserver.hostname.split('.')[0]}     IN      A`)) {
      const hostname = nameserver.hostname.split('.')[0];
      const aLine = `${hostname}     IN      A       ${nameserver.ipv4Address}\n`;
      
      // Find A records section or create it
      if (content.includes('A Records')) {
        const aSection = content.indexOf('A Records');
        const lines = content.split('\n');
        let aEndIndex = 0;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('A Records') && aEndIndex === 0) {
            aEndIndex = i + 1;
            break;
          }
        }
        
        if (aEndIndex > 0) {
          const before = lines.slice(0, aEndIndex).join('\n');
          const after = lines.slice(aEndIndex).join('\n');
          content = before + '\n' + aLine + after;
        }
      } else {
        // Add A Records section
        content += '\n; A Records for nameservers\n' + aLine;
      }
    }
    
    // Add AAAA record for nameserver if IPv6 is provided
    if (nameserver.ipv6Address && !content.includes(`${nameserver.hostname.split('.')[0]}     IN      AAAA`)) {
      const hostname = nameserver.hostname.split('.')[0];
      const aaaaLine = `${hostname}     IN      AAAA    ${nameserver.ipv6Address}\n`;
      
      // Find AAAA records section or create it
      if (content.includes('AAAA Records')) {
        const aaaaSection = content.indexOf('AAAA Records');
        const lines = content.split('\n');
        let aaaaEndIndex = 0;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('AAAA Records') && aaaaEndIndex === 0) {
            aaaaEndIndex = i + 1;
            break;
          }
        }
        
        if (aaaaEndIndex > 0) {
          const before = lines.slice(0, aaaaEndIndex).join('\n');
          const after = lines.slice(aaaaEndIndex).join('\n');
          content = before + '\n' + aaaaLine + after;
        }
      } else if (content.includes('A Records')) {
        // Add after A Records section
        const aSection = content.indexOf('A Records');
        const lines = content.split('\n');
        let aEndIndex = 0;
        let inASection = false;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('A Records') && !inASection) {
            inASection = true;
          } else if (inASection && !lines[i].includes('IN      A') && lines[i].trim() !== '') {
            aEndIndex = i;
            break;
          }
        }
        
        if (aEndIndex > 0) {
          const before = lines.slice(0, aEndIndex).join('\n');
          const after = lines.slice(aEndIndex).join('\n');
          content = before + '\n\n; AAAA Records for nameservers\n' + aaaaLine + after;
        }
      } else {
        // Add AAAA Records section
        content += '\n; AAAA Records for nameservers\n' + aaaaLine;
      }
    }
    
    // Create a new version of the zone file
    const [newZoneFile] = await db.insert(zoneFiles)
      .values({
        tldId,
        version: activeZoneFile.version + 1,
        content,
        createdBy: activeZoneFile.createdBy,
        isActive: true,
        activatedAt: new Date()
      })
      .returning();
    
    // Deactivate the old zone file
    await db.update(zoneFiles)
      .set({ isActive: false })
      .where(eq(zoneFiles.id, activeZoneFile.id));
    
    // Write to file system
    const tld = await getTldById(tldId);
    if (tld && tld.zoneFileLocation) {
      fs.writeFileSync(tld.zoneFileLocation, content);
    }
    
    // If quantum security is enabled, sign the zone file
    if (QDNS_QUANTUM_SECURITY && newZoneFile) {
      const quantumService = getQuantumSecurityService();
      const signature = await quantumService.signData(content);
      
      await db.update(zoneFiles)
        .set({ quantumSignature: signature })
        .where(eq(zoneFiles.id, newZoneFile.id));
    }
  } catch (error) {
    console.error('Error updating zone file with nameserver:', error);
    throw error;
  }
}

/**
 * Register a new domain
 */
export async function registerDomain(
  userId: number,
  domainData: InsertDomain
): Promise<Domain> {
  try {
    // Check if domain already exists
    const existingDomain = await getDomainByName(domainData.domainName, domainData.tldId);
    if (existingDomain) {
      throw new Error(`Domain ${domainData.domainName} already exists`);
    }

    // Get TLD
    const tld = await getTldById(domainData.tldId);
    if (!tld) {
      throw new Error(`TLD with ID ${domainData.tldId} not found`);
    }

    // Calculate expiration date if not provided
    if (!domainData.expirationDate) {
      const registrationYears = domainData.registrationYears || 1;
      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + registrationYears);
      domainData.expirationDate = expirationDate;
    }

    // Insert domain
    const [domain] = await db.insert(domains)
      .values({
        ...domainData,
        ownerId: userId
      })
      .returning();

    if (!domain) {
      throw new Error('Failed to register domain');
    }

    log('Domain registered:', domain.domainName);

    // Log domain registration
    await logDomainActivity(domain.id, userId, 'register', {
      domainName: domain.domainName,
      expirationDate: domain.expirationDate,
      registrationYears: domainData.registrationYears || 1
    });

    // Create default DNS records
    await createDefaultDnsRecords(domain.id);

    // Update zone file with new domain
    await updateZoneFileWithDomain(domain);

    return domain;
  } catch (error) {
    console.error('Error registering domain:', error);
    throw error;
  }
}

/**
 * Create default DNS records for a domain
 */
async function createDefaultDnsRecords(domainId: number): Promise<void> {
  try {
    const domain = await getDomainById(domainId);
    if (!domain) {
      throw new Error(`Domain with ID ${domainId} not found`);
    }

    const tld = await getTldById(domain.tldId);
    if (!tld) {
      throw new Error(`TLD with ID ${domain.tldId} not found`);
    }

    // Get nameservers for this TLD
    const tldNameservers = await db.select()
      .from(nameservers)
      .where(eq(nameservers.tldId, tld.id));

    // Create NS records
    for (const ns of tldNameservers) {
      await db.insert(dnsRecords)
        .values({
          domainId,
          recordType: DnsRecordType.NS,
          name: '@',
          value: ns.hostname,
          ttl: QDNS_DEFAULT_TTL
        });
    }

    // Create SOA record
    const primaryNs = tldNameservers.find(ns => ns.isPrimary) || tldNameservers[0];
    if (primaryNs) {
      const now = new Date();
      const serial = parseInt(
        now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0') +
        '01', // Version 01 for today
        10
      );

      await db.insert(dnsRecords)
        .values({
          domainId,
          recordType: DnsRecordType.SOA,
          name: '@',
          value: `${primaryNs.hostname}. admin.${domain.domainName}.${tld.tldName}. ${serial} 3600 1800 604800 86400`,
          ttl: QDNS_DEFAULT_TTL
        });
    }

    // Create A record placeholder
    await db.insert(dnsRecords)
      .values({
        domainId,
        recordType: DnsRecordType.A,
        name: '@',
        value: '127.0.0.1', // Placeholder IP
        ttl: QDNS_DEFAULT_TTL
      });

    // Create CNAME record for www
    await db.insert(dnsRecords)
      .values({
        domainId,
        recordType: DnsRecordType.CNAME,
        name: 'www',
        value: '@',
        ttl: QDNS_DEFAULT_TTL
      });
  } catch (error) {
    console.error('Error creating default DNS records:', error);
    throw error;
  }
}

/**
 * Update zone file with new domain
 */
async function updateZoneFileWithDomain(domain: Domain): Promise<void> {
  try {
    const tld = await getTldById(domain.tldId);
    if (!tld) {
      throw new Error(`TLD with ID ${domain.tldId} not found`);
    }

    // Get the active zone file
    const [activeZoneFile] = await db.select()
      .from(zoneFiles)
      .where(
        and(
          eq(zoneFiles.tldId, tld.id),
          eq(zoneFiles.isActive, true)
        )
      )
      .limit(1);

    if (!activeZoneFile) {
      throw new Error('No active zone file found');
    }

    // Get DNS records for this domain
    const dnsRecordsList = await db.select()
      .from(dnsRecords)
      .where(eq(dnsRecords.domainId, domain.id));

    // Generate zone file entries for this domain
    let domainEntries = `\n; Domain: ${domain.domainName}.${tld.tldName}\n`;
    
    // Add SOA record
    const soaRecord = dnsRecordsList.find(r => r.recordType === DnsRecordType.SOA);
    if (soaRecord) {
      domainEntries += `${domain.domainName}       IN      SOA     ${soaRecord.value}\n`;
    }
    
    // Add NS records
    const nsRecords = dnsRecordsList.filter(r => r.recordType === DnsRecordType.NS);
    for (const ns of nsRecords) {
      domainEntries += `${domain.domainName}       IN      NS      ${ns.value}.\n`;
    }
    
    // Add A records
    const aRecords = dnsRecordsList.filter(r => r.recordType === DnsRecordType.A);
    for (const a of aRecords) {
      const name = a.name === '@' ? domain.domainName : `${a.name}.${domain.domainName}`;
      domainEntries += `${name}       IN      A       ${a.value}\n`;
    }
    
    // Add AAAA records
    const aaaaRecords = dnsRecordsList.filter(r => r.recordType === DnsRecordType.AAAA);
    for (const aaaa of aaaaRecords) {
      const name = aaaa.name === '@' ? domain.domainName : `${aaaa.name}.${domain.domainName}`;
      domainEntries += `${name}       IN      AAAA    ${aaaa.value}\n`;
    }
    
    // Add CNAME records
    const cnameRecords = dnsRecordsList.filter(r => r.recordType === DnsRecordType.CNAME);
    for (const cname of cnameRecords) {
      const name = cname.name === '@' ? domain.domainName : `${cname.name}.${domain.domainName}`;
      const value = cname.value === '@' ? domain.domainName : cname.value;
      domainEntries += `${name}       IN      CNAME   ${value}.\n`;
    }
    
    // Add MX records
    const mxRecords = dnsRecordsList.filter(r => r.recordType === DnsRecordType.MX);
    for (const mx of mxRecords) {
      const name = mx.name === '@' ? domain.domainName : `${mx.name}.${domain.domainName}`;
      domainEntries += `${name}       IN      MX      ${mx.priority || 10} ${mx.value}.\n`;
    }
    
    // Add TXT records
    const txtRecords = dnsRecordsList.filter(r => r.recordType === DnsRecordType.TXT);
    for (const txt of txtRecords) {
      const name = txt.name === '@' ? domain.domainName : `${txt.name}.${domain.domainName}`;
      domainEntries += `${name}       IN      TXT     "${txt.value}"\n`;
    }
    
    // Add other records
    const otherRecords = dnsRecordsList.filter(r => 
      ![DnsRecordType.SOA, DnsRecordType.NS, DnsRecordType.A, DnsRecordType.AAAA, 
        DnsRecordType.CNAME, DnsRecordType.MX, DnsRecordType.TXT].includes(r.recordType as DnsRecordType)
    );
    
    for (const other of otherRecords) {
      const name = other.name === '@' ? domain.domainName : `${other.name}.${domain.domainName}`;
      domainEntries += `${name}       IN      ${other.recordType}     ${other.value}\n`;
    }
    
    // Append domain entries to zone file
    const newContent = activeZoneFile.content + domainEntries;
    
    // Create a new version of the zone file
    const [newZoneFile] = await db.insert(zoneFiles)
      .values({
        tldId: tld.id,
        version: activeZoneFile.version + 1,
        content: newContent,
        createdBy: activeZoneFile.createdBy,
        isActive: true,
        activatedAt: new Date()
      })
      .returning();
    
    // Deactivate the old zone file
    await db.update(zoneFiles)
      .set({ isActive: false })
      .where(eq(zoneFiles.id, activeZoneFile.id));
    
    // Write to file system
    if (tld.zoneFileLocation) {
      fs.writeFileSync(tld.zoneFileLocation, newContent);
    }
    
    // If quantum security is enabled, sign the zone file
    if (QDNS_QUANTUM_SECURITY && newZoneFile) {
      const quantumService = getQuantumSecurityService();
      const signature = await quantumService.signData(newContent);
      
      await db.update(zoneFiles)
        .set({ quantumSignature: signature })
        .where(eq(zoneFiles.id, newZoneFile.id));
    }
  } catch (error) {
    console.error('Error updating zone file with domain:', error);
    throw error;
  }
}

/**
 * Add or update a DNS record
 */
export async function upsertDnsRecord(
  userId: number,
  domainId: number,
  recordData: InsertDnsRecord,
  recordId?: number
): Promise<DnsRecord> {
  try {
    const domain = await getDomainById(domainId);
    if (!domain) {
      throw new Error(`Domain with ID ${domainId} not found`);
    }

    // Check if user owns this domain
    if (domain.ownerId !== userId) {
      throw new Error('You do not have permission to modify this domain');
    }

    let record: DnsRecord;

    if (recordId) {
      // Update existing record
      const [updatedRecord] = await db.update(dnsRecords)
        .set({
          ...recordData,
          updatedAt: new Date()
        })
        .where(eq(dnsRecords.id, recordId))
        .returning();

      if (!updatedRecord) {
        throw new Error(`DNS record with ID ${recordId} not found`);
      }

      record = updatedRecord;
      log('DNS record updated:', record.name, record.recordType);
    } else {
      // Create new record
      const [newRecord] = await db.insert(dnsRecords)
        .values({
          ...recordData,
          domainId
        })
        .returning();

      if (!newRecord) {
        throw new Error('Failed to create DNS record');
      }

      record = newRecord;
      log('DNS record created:', record.name, record.recordType);
    }

    // Log the activity
    await logDomainActivity(domainId, userId, recordId ? 'update-dns' : 'create-dns', {
      recordId: record.id,
      recordType: record.recordType,
      name: record.name,
      value: record.value
    });

    // Update zone file
    await updateZoneFileWithDomain(domain);

    return record;
  } catch (error) {
    console.error('Error upserting DNS record:', error);
    throw error;
  }
}

/**
 * Delete a DNS record
 */
export async function deleteDnsRecord(
  userId: number,
  domainId: number,
  recordId: number
): Promise<void> {
  try {
    const domain = await getDomainById(domainId);
    if (!domain) {
      throw new Error(`Domain with ID ${domainId} not found`);
    }

    // Check if user owns this domain
    if (domain.ownerId !== userId) {
      throw new Error('You do not have permission to modify this domain');
    }

    // Get the record before deleting
    const [record] = await db.select()
      .from(dnsRecords)
      .where(eq(dnsRecords.id, recordId))
      .limit(1);

    if (!record) {
      throw new Error(`DNS record with ID ${recordId} not found`);
    }

    // Delete the record
    await db.delete(dnsRecords)
      .where(eq(dnsRecords.id, recordId));

    log('DNS record deleted:', record.name, record.recordType);

    // Log the activity
    await logDomainActivity(domainId, userId, 'delete-dns', {
      recordId,
      recordType: record.recordType,
      name: record.name,
      value: record.value
    });

    // Update zone file
    await updateZoneFileWithDomain(domain);
  } catch (error) {
    console.error('Error deleting DNS record:', error);
    throw error;
  }
}

/**
 * Enable DNSSEC for a domain
 */
export async function enableDnssec(
  userId: number,
  domainId: number,
  keyData: InsertDnsSecKey
): Promise<DnsSecKey> {
  try {
    const domain = await getDomainById(domainId);
    if (!domain) {
      throw new Error(`Domain with ID ${domainId} not found`);
    }

    // Check if user owns this domain
    if (domain.ownerId !== userId) {
      throw new Error('You do not have permission to modify this domain');
    }

    // Create DNSSEC key
    const [dnsSecKey] = await db.insert(dnsSecKeys)
      .values({
        ...keyData,
        domainId
      })
      .returning();

    if (!dnsSecKey) {
      throw new Error('Failed to create DNSSEC key');
    }

    // Update domain to enable DNSSEC
    await db.update(domains)
      .set({ dnsSecEnabled: true })
      .where(eq(domains.id, domainId));

    log('DNSSEC enabled for domain:', domain.domainName);

    // Log the activity
    await logDomainActivity(domainId, userId, 'enable-dnssec', {
      keyTag: dnsSecKey.keyTag,
      algorithm: dnsSecKey.algorithm,
      digestType: dnsSecKey.digestType
    });

    return dnsSecKey;
  } catch (error) {
    console.error('Error enabling DNSSEC:', error);
    throw error;
  }
}

/**
 * Disable DNSSEC for a domain
 */
export async function disableDnssec(
  userId: number,
  domainId: number
): Promise<void> {
  try {
    const domain = await getDomainById(domainId);
    if (!domain) {
      throw new Error(`Domain with ID ${domainId} not found`);
    }

    // Check if user owns this domain
    if (domain.ownerId !== userId) {
      throw new Error('You do not have permission to modify this domain');
    }

    // Deactivate all DNSSEC keys
    await db.update(dnsSecKeys)
      .set({ isActive: false })
      .where(eq(dnsSecKeys.domainId, domainId));

    // Update domain to disable DNSSEC
    await db.update(domains)
      .set({ dnsSecEnabled: false })
      .where(eq(domains.id, domainId));

    log('DNSSEC disabled for domain:', domain.domainName);

    // Log the activity
    await logDomainActivity(domainId, userId, 'disable-dnssec', {});
  } catch (error) {
    console.error('Error disabling DNSSEC:', error);
    throw error;
  }
}

/**
 * Initiate a domain transfer
 */
export async function initiateDomainTransfer(
  fromUserId: number,
  toUserId: number,
  domainId: number,
  transferData: InsertDomainTransfer
): Promise<DomainTransfer> {
  try {
    const domain = await getDomainById(domainId);
    if (!domain) {
      throw new Error(`Domain with ID ${domainId} not found`);
    }

    // Check if user owns this domain
    if (domain.ownerId !== fromUserId) {
      throw new Error('You do not have permission to transfer this domain');
    }

    // Create transfer record
    const [transfer] = await db.insert(domainTransfers)
      .values({
        ...transferData,
        domainId,
        fromUserId,
        toUserId,
        status: 'pending'
      })
      .returning();

    if (!transfer) {
      throw new Error('Failed to initiate domain transfer');
    }

    log('Domain transfer initiated:', domain.domainName);

    // Log the activity
    await logDomainActivity(domainId, fromUserId, 'initiate-transfer', {
      transferId: transfer.id,
      toUserId
    });

    return transfer;
  } catch (error) {
    console.error('Error initiating domain transfer:', error);
    throw error;
  }
}

/**
 * Complete a domain transfer
 */
export async function completeDomainTransfer(
  userId: number,
  transferId: number,
  authCode: string
): Promise<Domain> {
  try {
    // Get the transfer
    const [transfer] = await db.select()
      .from(domainTransfers)
      .where(eq(domainTransfers.id, transferId))
      .limit(1);

    if (!transfer) {
      throw new Error(`Transfer with ID ${transferId} not found`);
    }

    // Check if user is the recipient
    if (transfer.toUserId !== userId) {
      throw new Error('You are not the recipient of this transfer');
    }

    // Check if transfer is pending
    if (transfer.status !== 'pending') {
      throw new Error(`Transfer is not pending, current status: ${transfer.status}`);
    }

    // Verify auth code
    if (transfer.authCode !== authCode) {
      throw new Error('Invalid authorization code');
    }

    // Get the domain
    const domain = await getDomainById(transfer.domainId);
    if (!domain) {
      throw new Error(`Domain with ID ${transfer.domainId} not found`);
    }

    // Update domain ownership
    const [updatedDomain] = await db.update(domains)
      .set({
        ownerId: userId,
        updatedAt: new Date()
      })
      .where(eq(domains.id, transfer.domainId))
      .returning();

    if (!updatedDomain) {
      throw new Error('Failed to update domain ownership');
    }

    // Update transfer status
    await db.update(domainTransfers)
      .set({
        status: 'completed',
        completionDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(domainTransfers.id, transferId));

    log('Domain transfer completed:', domain.domainName);

    // Log the activity for both users
    await logDomainActivity(domain.id, transfer.fromUserId, 'transfer-out', {
      transferId,
      toUserId: userId
    });

    await logDomainActivity(domain.id, userId, 'transfer-in', {
      transferId,
      fromUserId: transfer.fromUserId
    });

    return updatedDomain;
  } catch (error) {
    console.error('Error completing domain transfer:', error);
    throw error;
  }
}

/**
 * Renew a domain
 */
export async function renewDomain(
  userId: number,
  domainId: number,
  years: number
): Promise<Domain> {
  try {
    const domain = await getDomainById(domainId);
    if (!domain) {
      throw new Error(`Domain with ID ${domainId} not found`);
    }

    // Check if user owns this domain
    if (domain.ownerId !== userId) {
      throw new Error('You do not have permission to renew this domain');
    }

    // Calculate new expiration date
    const currentExpiration = new Date(domain.expirationDate);
    const newExpiration = new Date(currentExpiration);
    newExpiration.setFullYear(currentExpiration.getFullYear() + years);

    // Update domain
    const [updatedDomain] = await db.update(domains)
      .set({
        expirationDate: newExpiration,
        lastRenewalDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(domains.id, domainId))
      .returning();

    if (!updatedDomain) {
      throw new Error('Failed to renew domain');
    }

    log('Domain renewed:', domain.domainName, 'for', years, 'years');

    // Log the activity
    await logDomainActivity(domainId, userId, 'renew', {
      years,
      oldExpirationDate: domain.expirationDate,
      newExpirationDate: newExpiration
    });

    return updatedDomain;
  } catch (error) {
    console.error('Error renewing domain:', error);
    throw error;
  }
}

/**
 * Get all TLDs
 */
export async function getAllTlds(): Promise<TldConfiguration[]> {
  try {
    const tlds = await db.select()
      .from(tldConfigurations);
    
    return tlds;
  } catch (error) {
    console.error('Error fetching TLDs:', error);
    throw error;
  }
}

/**
 * Get a TLD by ID
 */
export async function getTldById(tldId: number): Promise<TldConfiguration | null> {
  try {
    const [tld] = await db.select()
      .from(tldConfigurations)
      .where(eq(tldConfigurations.id, tldId))
      .limit(1);
    
    return tld || null;
  } catch (error) {
    console.error('Error fetching TLD by ID:', error);
    throw error;
  }
}

/**
 * Get a TLD by name
 */
export async function getTldByName(tldName: string): Promise<TldConfiguration | null> {
  try {
    const [tld] = await db.select()
      .from(tldConfigurations)
      .where(eq(tldConfigurations.tldName, tldName))
      .limit(1);
    
    return tld || null;
  } catch (error) {
    console.error('Error fetching TLD by name:', error);
    throw error;
  }
}

/**
 * Get nameservers for a TLD
 */
export async function getNameserversForTld(tldId: number): Promise<Nameserver[]> {
  try {
    const ns = await db.select()
      .from(nameservers)
      .where(eq(nameservers.tldId, tldId));
    
    return ns;
  } catch (error) {
    console.error('Error fetching nameservers for TLD:', error);
    throw error;
  }
}

/**
 * Get a domain by ID
 */
export async function getDomainById(domainId: number): Promise<Domain | null> {
  try {
    const [domain] = await db.select()
      .from(domains)
      .where(eq(domains.id, domainId))
      .limit(1);
    
    return domain || null;
  } catch (error) {
    console.error('Error fetching domain by ID:', error);
    throw error;
  }
}

/**
 * Get a domain by name and TLD ID
 */
export async function getDomainByName(domainName: string, tldId: number): Promise<Domain | null> {
  try {
    const [domain] = await db.select()
      .from(domains)
      .where(
        and(
          eq(domains.domainName, domainName),
          eq(domains.tldId, tldId)
        )
      )
      .limit(1);
    
    return domain || null;
  } catch (error) {
    console.error('Error fetching domain by name:', error);
    throw error;
  }
}

/**
 * Get domains for a user
 */
export async function getDomainsForUser(userId: number): Promise<Domain[]> {
  try {
    const userDomains = await db.select()
      .from(domains)
      .where(eq(domains.ownerId, userId));
    
    return userDomains;
  } catch (error) {
    console.error('Error fetching domains for user:', error);
    throw error;
  }
}

/**
 * Get DNS records for a domain
 */
export async function getDnsRecordsForDomain(domainId: number): Promise<DnsRecord[]> {
  try {
    const records = await db.select()
      .from(dnsRecords)
      .where(eq(dnsRecords.domainId, domainId));
    
    return records;
  } catch (error) {
    console.error('Error fetching DNS records for domain:', error);
    throw error;
  }
}

/**
 * Get DNSSEC keys for a domain
 */
export async function getDnsSecKeysForDomain(domainId: number): Promise<DnsSecKey[]> {
  try {
    const keys = await db.select()
      .from(dnsSecKeys)
      .where(
        and(
          eq(dnsSecKeys.domainId, domainId),
          eq(dnsSecKeys.isActive, true)
        )
      );
    
    return keys;
  } catch (error) {
    console.error('Error fetching DNSSEC keys for domain:', error);
    throw error;
  }
}

/**
 * Get transfers for a domain
 */
export async function getTransfersForDomain(domainId: number): Promise<DomainTransfer[]> {
  try {
    const transfers = await db.select()
      .from(domainTransfers)
      .where(eq(domainTransfers.domainId, domainId));
    
    return transfers;
  } catch (error) {
    console.error('Error fetching transfers for domain:', error);
    throw error;
  }
}

/**
 * Get pending transfers for a user (as recipient)
 */
export async function getPendingTransfersForUser(userId: number): Promise<DomainTransfer[]> {
  try {
    const transfers = await db.select()
      .from(domainTransfers)
      .where(
        and(
          eq(domainTransfers.toUserId, userId),
          eq(domainTransfers.status, 'pending')
        )
      );
    
    return transfers;
  } catch (error) {
    console.error('Error fetching pending transfers for user:', error);
    throw error;
  }
}

/**
 * Get activity logs for a domain
 */
export async function getActivityLogsForDomain(domainId: number): Promise<DomainActivityLog[]> {
  try {
    const logs = await db.select()
      .from(domainActivityLogs)
      .where(eq(domainActivityLogs.domainId, domainId))
      .orderBy(domainActivityLogs.timestamp);
    
    return logs;
  } catch (error) {
    console.error('Error fetching activity logs for domain:', error);
    throw error;
  }
}

/**
 * Log domain activity
 */
export async function logDomainActivity(
  domainId: number,
  userId: number,
  action: string,
  details: any = {}
): Promise<void> {
  try {
    await db.insert(domainActivityLogs)
      .values({
        domainId,
        performedBy: userId,
        action,
        details
      });
  } catch (error) {
    console.error('Error logging domain activity:', error);
    // Don't throw here, just log the error
  }
}

/**
 * Log nameserver event
 */
export async function logNameserverEvent(
  nameserverId: number,
  eventType: string,
  details: any = {},
  severity: string = 'info'
): Promise<void> {
  try {
    await db.insert(nameserverLogs)
      .values({
        nameserverId,
        eventType,
        details,
        severity
      });
  } catch (error) {
    console.error('Error logging nameserver event:', error);
    // Don't throw here, just log the error
  }
}

/**
 * Search domains
 */
export async function searchDomains(
  query: string,
  tldId?: number
): Promise<Domain[]> {
  try {
    let domainsQuery = db.select()
      .from(domains)
      .where(like(domains.domainName, `%${query}%`));
    
    if (tldId) {
      domainsQuery = domainsQuery.where(eq(domains.tldId, tldId));
    }
    
    const results = await domainsQuery.limit(100);
    
    return results;
  } catch (error) {
    console.error('Error searching domains:', error);
    throw error;
  }
}

/**
 * Check domain availability
 */
export async function checkDomainAvailability(
  domainName: string,
  tldId: number
): Promise<boolean> {
  try {
    const domain = await getDomainByName(domainName, tldId);
    return !domain;
  } catch (error) {
    console.error('Error checking domain availability:', error);
    throw error;
  }
}

/**
 * Get zone file for a TLD
 */
export async function getZoneFileForTld(tldId: number): Promise<ZoneFile | null> {
  try {
    const [zoneFile] = await db.select()
      .from(zoneFiles)
      .where(
        and(
          eq(zoneFiles.tldId, tldId),
          eq(zoneFiles.isActive, true)
        )
      )
      .limit(1);
    
    return zoneFile || null;
  } catch (error) {
    console.error('Error fetching zone file for TLD:', error);
    throw error;
  }
}

/**
 * Verify zone file integrity using quantum signature
 */
export async function verifyZoneFileIntegrity(zoneFileId: number): Promise<boolean> {
  try {
    const [zoneFile] = await db.select()
      .from(zoneFiles)
      .where(eq(zoneFiles.id, zoneFileId))
      .limit(1);
    
    if (!zoneFile || !zoneFile.quantumSignature) {
      return false;
    }
    
    if (QDNS_QUANTUM_SECURITY) {
      const quantumService = getQuantumSecurityService();
      return await quantumService.verifySignature(zoneFile.content, zoneFile.quantumSignature);
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying zone file integrity:', error);
    return false;
  }
}

/**
 * Get domain with full details
 */
export async function getDomainWithDetails(domainId: number): Promise<any> {
  try {
    const domain = await getDomainById(domainId);
    if (!domain) {
      throw new Error(`Domain with ID ${domainId} not found`);
    }
    
    const tld = await getTldById(domain.tldId);
    const dnsRecords = await getDnsRecordsForDomain(domainId);
    const dnsSecKeys = await getDnsSecKeysForDomain(domainId);
    const transfers = await getTransfersForDomain(domainId);
    const activityLogs = await getActivityLogsForDomain(domainId);
    
    return {
      domain,
      tld,
      dnsRecords,
      dnsSecKeys,
      transfers,
      activityLogs
    };
  } catch (error) {
    console.error('Error fetching domain with details:', error);
    throw error;
  }
}

/**
 * Get TLD with full details
 */
export async function getTldWithDetails(tldId: number): Promise<any> {
  try {
    const tld = await getTldById(tldId);
    if (!tld) {
      throw new Error(`TLD with ID ${tldId} not found`);
    }
    
    const nameservers = await getNameserversForTld(tldId);
    const zoneFile = await getZoneFileForTld(tldId);
    
    // Count domains under this TLD
    const domainsCount = await db.select({ count: domains.id })
      .from(domains)
      .where(eq(domains.tldId, tldId))
      .groupBy(domains.tldId);
    
    return {
      tld,
      nameservers,
      zoneFile,
      domainsCount: domainsCount.length > 0 ? domainsCount[0].count : 0
    };
  } catch (error) {
    console.error('Error fetching TLD with details:', error);
    throw error;
  }
}

/**
 * Get nameserver health status
 */
export async function getNameserverHealth(nameserverId: number): Promise<any> {
  try {
    const nameserver = await db.select()
      .from(nameservers)
      .where(eq(nameservers.id, nameserverId))
      .limit(1);
    
    if (!nameserver.length) {
      throw new Error(`Nameserver with ID ${nameserverId} not found`);
    }
    
    // Get recent logs
    const logs = await db.select()
      .from(nameserverLogs)
      .where(eq(nameserverLogs.nameserverId, nameserverId))
      .orderBy(nameserverLogs.timestamp)
      .limit(10);
    
    return {
      nameserver: nameserver[0],
      logs,
      isHealthy: nameserver[0].healthStatus === 'healthy'
    };
  } catch (error) {
    console.error('Error fetching nameserver health:', error);
    throw error;
  }
}

/**
 * Update nameserver health status
 */
export async function updateNameserverHealth(
  nameserverId: number,
  healthStatus: string,
  details: any = {}
): Promise<void> {
  try {
    await db.update(nameservers)
      .set({
        healthStatus,
        lastHealthCheck: new Date(),
        updatedAt: new Date()
      })
      .where(eq(nameservers.id, nameserverId));
    
    // Log the health check
    await logNameserverEvent(
      nameserverId,
      'health_check',
      {
        status: healthStatus,
        ...details
      },
      healthStatus === 'healthy' ? 'info' : 'warning'
    );
  } catch (error) {
    console.error('Error updating nameserver health:', error);
    throw error;
  }
}

/**
 * Generate a WHOIS response for a domain
 */
export async function generateWhoisResponse(domainName: string, tldName: string): Promise<string> {
  try {
    const tld = await getTldByName(tldName);
    if (!tld) {
      return `No whois data found for ${domainName}.${tldName}`;
    }
    
    const domain = await getDomainByName(domainName, tld.id);
    if (!domain) {
      return `Domain ${domainName}.${tldName} not found`;
    }
    
    // If WHOIS privacy is enabled, return limited information
    if (domain.whoisPrivacy) {
      return `Domain Name: ${domainName}.${tldName}
Registrar: AI Freedom Trust Registry
WHOIS Server: whois.aifreedomtrust.org
Updated Date: ${domain.updatedAt.toISOString()}
Creation Date: ${domain.registrationDate.toISOString()}
Expiration Date: ${domain.expirationDate.toISOString()}
Domain Status: ${domain.status}
Name Server: ${(await getNameserversForTld(tld.id)).map(ns => ns.hostname).join('\nName Server: ')}
DNSSEC: ${domain.dnsSecEnabled ? 'signedDelegation' : 'unsigned'}

>>> WHOIS Privacy Protection Service is enabled <<<
`;
    }
    
    // Get the domain owner
    const owner = await db.select()
      .from(users)
      .where(eq(users.id, domain.ownerId))
      .limit(1);
    
    return `Domain Name: ${domainName}.${tldName}
Registrar: AI Freedom Trust Registry
WHOIS Server: whois.aifreedomtrust.org
Updated Date: ${domain.updatedAt.toISOString()}
Creation Date: ${domain.registrationDate.toISOString()}
Expiration Date: ${domain.expirationDate.toISOString()}
Domain Status: ${domain.status}
Registrant Name: ${owner.length ? owner[0].username : 'Private'}
Registrant Email: ${owner.length ? owner[0].email : 'Private'}
Name Server: ${(await getNameserversForTld(tld.id)).map(ns => ns.hostname).join('\nName Server: ')}
DNSSEC: ${domain.dnsSecEnabled ? 'signedDelegation' : 'unsigned'}
`;
  } catch (error) {
    console.error('Error generating WHOIS response:', error);
    return `Error retrieving WHOIS data for ${domainName}.${tldName}`;
  }
}

/**
 * Export all functions
 */
export default {
  // TLD management
  createTld,
  getAllTlds,
  getTldById,
  getTldByName,
  getTldWithDetails,
  
  // Nameserver management
  addNameserver,
  getNameserversForTld,
  getNameserverHealth,
  updateNameserverHealth,
  
  // Domain management
  registerDomain,
  getDomainById,
  getDomainByName,
  getDomainsForUser,
  getDomainWithDetails,
  renewDomain,
  
  // DNS record management
  upsertDnsRecord,
  deleteDnsRecord,
  getDnsRecordsForDomain,
  
  // DNSSEC management
  enableDnssec,
  disableDnssec,
  getDnsSecKeysForDomain,
  
  // Domain transfer
  initiateDomainTransfer,
  completeDomainTransfer,
  getTransfersForDomain,
  getPendingTransfersForUser,
  
  // Activity logs
  getActivityLogsForDomain,
  
  // Zone file management
  getZoneFileForTld,
  verifyZoneFileIntegrity,
  
  // Search and availability
  searchDomains,
  checkDomainAvailability,
  
  // WHOIS
  generateWhoisResponse
};
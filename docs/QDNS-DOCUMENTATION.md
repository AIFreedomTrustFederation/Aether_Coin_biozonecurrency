# QDNS: Quantum DNS for .trust TLD

## Overview

QDNS (Quantum DNS) is a next-generation domain name system designed specifically for the `.trust` TLD. It combines traditional DNS functionality with quantum-resistant cryptography to provide a secure, decentralized, and future-proof naming system.

This documentation provides comprehensive information about the QDNS system, its architecture, deployment, and usage.

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [API Reference](#api-reference)
6. [Web Interface](#web-interface)
7. [Security Features](#security-features)
8. [Quantum Resistance](#quantum-resistance)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

## Introduction

QDNS is designed to serve as the authoritative DNS system for the `.trust` TLD. It provides:

- Domain registration and management
- DNS record management
- DNSSEC support
- Quantum-resistant cryptography
- Web-based management interface
- API for programmatic access
- WHOIS service

The system is built on open standards and open-source software, making it transparent, auditable, and community-driven.

## Architecture

QDNS consists of several components:

### Core Components

1. **QDNS Server**: Based on BIND9 with custom extensions for quantum resistance
2. **QDNS API**: RESTful API for programmatic access to QDNS functionality
3. **QDNS Web Interface**: Web-based management interface for domain owners
4. **QDNS Database**: Stores domain registrations, DNS records, and other data
5. **WHOIS Service**: Provides domain registration information

### System Architecture Diagram

```
                                  +----------------+
                                  |                |
                                  |  DNS Clients   |
                                  |                |
                                  +--------+-------+
                                           |
                                           | DNS Queries
                                           |
                  +----------------------+-+--+----------------------+
                  |                      |    |                      |
                  |                      v    v                      |
          +-------+-------+      +-------+----+----+      +---------+-------+
          |               |      |                |      |                   |
          | ns1.aethercoin|      | ns2.aethercoin |      | ns3.aethercoin   |
          | .trust        |      | .trust         |      | .trust           |
          | (Primary NS)  |      | (Secondary NS) |      | (Secondary NS)   |
          |               |      |                |      |                   |
          +-------+-------+      +----------------+      +-------------------+
                  |
                  | Zone Updates
                  |
          +-------+-------+
          |               |
          | QDNS Database |
          |               |
          +-------+-------+
                  |
                  | API Access
          +-------+-------+      +----------------+
          |               |      |                |
          | QDNS API      +<---->+ QDNS Web UI    |
          |               |      |                |
          +---------------+      +----------------+
```

### Data Flow

1. Domain registrations and DNS record changes are made through the Web UI or API
2. Changes are stored in the QDNS Database
3. The QDNS Server reads from the database and generates zone files
4. Zone files are distributed to all nameservers
5. DNS clients query the nameservers for domain information

## Installation

### Prerequisites

- Linux server (Ubuntu 20.04 LTS or later recommended)
- 2+ CPU cores
- 4+ GB RAM
- 50+ GB storage
- Static IP address
- Node.js 16+ and npm
- PostgreSQL 13+
- BIND9 DNS server

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/aifreedomtrust/aethercoin.git
   cd aethercoin
   ```

2. Run the QDNS deployment script:
   ```bash
   sudo ./deploy-qdns.sh
   ```

3. Follow the on-screen instructions to complete the installation.

### Manual Installation

If you prefer to install manually, follow these steps:

1. Install required packages:
   ```bash
   sudo apt-get update
   sudo apt-get install -y bind9 bind9utils bind9-doc dnsutils
   ```

2. Copy configuration files:
   ```bash
   sudo cp ./server/services/qdns-management/named.conf.trust /etc/bind/named.conf.local
   sudo cp ./server/services/qdns-management/trust.zone /var/named/trust.zone
   ```

3. Generate DNSSEC keys and sign the zone:
   ```bash
   cd /var/named/keys
   sudo dnssec-keygen -a ECDSAP256SHA256 -b 256 -n ZONE trust
   sudo dnssec-keygen -a ECDSAP256SHA256 -b 256 -f KSK -n ZONE trust
   sudo dnssec-signzone -A -3 $(head -c 16 /dev/random | od -A n -t x | tr -d ' \n') -N INCREMENT -o trust -t /var/named/trust.zone
   ```

4. Restart BIND:
   ```bash
   sudo systemctl restart bind9
   sudo systemctl enable bind9
   ```

## Configuration

### BIND Configuration

The main BIND configuration file is located at `/etc/bind/named.conf.local`. This file includes settings for the `.trust` TLD.

Key configuration options:

- `listen-on`: Specifies the IP addresses and ports to listen on
- `allow-query`: Controls which clients can query the server
- `recursion`: Enables or disables recursive queries
- `dnssec-validation`: Controls DNSSEC validation
- `quantum-resistant`: Enables quantum-resistant features

### Zone File

The zone file for `.trust` is located at `/var/named/trust.zone`. This file contains all DNS records for the TLD.

Example zone file entry:
```
example         IN      A       203.0.113.20
www.example     IN      CNAME   example.trust.
```

### API Configuration

The QDNS API configuration is located in the `.env` file. Key settings include:

- `QDNS_ZONE_FILE_PATH`: Path to zone files
- `QDNS_DEFAULT_TTL`: Default TTL for DNS records
- `QDNS_QUANTUM_SECURITY`: Enable/disable quantum security features

## API Reference

The QDNS API provides programmatic access to all QDNS functionality. It is a RESTful API that uses JSON for data exchange.

### Authentication

All API requests require authentication using JWT tokens. To obtain a token:

```
POST /api/auth/login
{
  "username": "your-username",
  "password": "your-password"
}
```

Include the token in the `Authorization` header of all requests:

```
Authorization: Bearer <token>
```

### Endpoints

#### TLD Management

- `GET /api/qdns/tlds`: Get all TLDs
- `POST /api/qdns/tlds`: Create a new TLD (admin only)
- `GET /api/qdns/tlds/:id`: Get TLD details
- `POST /api/qdns/tlds/:id/nameservers`: Add a nameserver to a TLD (admin only)
- `GET /api/qdns/tlds/:id/nameservers`: Get nameservers for a TLD
- `GET /api/qdns/tlds/:id/zone`: Get zone file for a TLD (admin only)

#### Domain Management

- `POST /api/qdns/domains`: Register a new domain
- `GET /api/qdns/domains`: Get domains for the current user
- `GET /api/qdns/domains/:id`: Get domain details
- `POST /api/qdns/domains/:id/dns`: Add or update a DNS record
- `DELETE /api/qdns/domains/:id/dns/:recordId`: Delete a DNS record
- `GET /api/qdns/domains/:id/dns`: Get DNS records for a domain
- `POST /api/qdns/domains/:id/dnssec`: Enable DNSSEC for a domain
- `DELETE /api/qdns/domains/:id/dnssec`: Disable DNSSEC for a domain
- `POST /api/qdns/domains/:id/transfer`: Initiate a domain transfer
- `POST /api/qdns/transfers/:id/complete`: Complete a domain transfer
- `GET /api/qdns/transfers/pending`: Get pending transfers for the current user
- `POST /api/qdns/domains/:id/renew`: Renew a domain
- `POST /api/qdns/domains/search`: Search domains
- `POST /api/qdns/domains/check`: Check domain availability
- `GET /api/qdns/domains/:id/logs`: Get activity logs for a domain
- `GET /api/qdns/whois/:domain`: WHOIS lookup

#### Nameserver Management

- `GET /api/qdns/nameservers/:id/health`: Get nameserver health (admin only)
- `POST /api/qdns/nameservers/:id/health`: Update nameserver health (admin only)

### Example API Usage

Register a new domain:

```javascript
const response = await fetch('/api/qdns/domains', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    domainName: 'example',
    tldId: 1,
    registrationYears: 1,
    whoisPrivacy: true,
    autoRenew: true
  })
});

const data = await response.json();
console.log(data);
```

## Web Interface

The QDNS Web Interface provides a user-friendly way to manage domains and DNS records. It is accessible at `https://cpanel.aethercoin.trust`.

### Features

- Dashboard with domain statistics
- Domain registration
- DNS record management
- DNSSEC configuration
- Domain transfer
- WHOIS lookup
- Activity logs

### Screenshots

![QDNS Dashboard](https://aethercoin.trust/images/qdns-dashboard.png)
![Domain Management](https://aethercoin.trust/images/qdns-domain-management.png)
![DNS Records](https://aethercoin.trust/images/qdns-dns-records.png)

## Security Features

QDNS includes several security features to protect against various threats:

### DNSSEC

DNSSEC (Domain Name System Security Extensions) provides authentication and integrity for DNS data. QDNS fully supports DNSSEC and encourages its use for all domains.

### Quantum Resistance

QDNS includes quantum-resistant cryptography to protect against future quantum computing attacks. This includes:

- Post-quantum cryptographic algorithms for signing DNS records
- Quantum-resistant key exchange for zone transfers
- Quantum-secure authentication for API access

### Access Control

The QDNS API and Web Interface implement strict access control to ensure that users can only access and modify their own domains.

### Audit Logging

All actions in QDNS are logged for audit purposes. Logs include:

- User ID
- Action type
- Timestamp
- IP address
- User agent
- Action details

## Quantum Resistance

QDNS implements quantum-resistant cryptography to protect against future quantum computing attacks.

### Algorithms

QDNS uses the following post-quantum cryptographic algorithms:

- **SPHINCS+**: A stateless hash-based signature scheme
- **CRYSTALS-Kyber**: A lattice-based key encapsulation mechanism
- **CRYSTALS-Dilithium**: A lattice-based digital signature algorithm

### Implementation

Quantum resistance is implemented at several levels:

1. **Zone Signing**: DNSSEC signatures use quantum-resistant algorithms
2. **API Authentication**: API tokens use quantum-resistant signatures
3. **Data Integrity**: All stored data is protected with quantum-resistant hashes

### Future Compatibility

QDNS is designed to be algorithm-agile, allowing for easy updates as quantum-resistant cryptography evolves.

## Troubleshooting

### Common Issues

#### DNS Server Not Responding

**Symptoms**: DNS queries to the server time out or fail.

**Solutions**:
- Check if BIND is running: `systemctl status bind9`
- Check firewall settings: `ufw status`
- Check BIND logs: `tail -f /var/log/named/default.log`

#### Zone Transfer Failures

**Symptoms**: Secondary nameservers are not updating.

**Solutions**:
- Check BIND logs for transfer errors
- Verify TSIG keys are correct
- Check network connectivity between nameservers

#### API Access Issues

**Symptoms**: API requests return 401 or 403 errors.

**Solutions**:
- Check if your token is valid and not expired
- Verify you have the correct permissions
- Check API logs for more details

### Diagnostic Commands

- Check DNS server status: `dig @localhost trust. SOA`
- Verify DNSSEC signatures: `dig @localhost trust. DNSKEY +dnssec`
- Test zone transfer: `dig @localhost trust. AXFR`
- Check BIND configuration: `named-checkconf /etc/bind/named.conf`
- Check zone file syntax: `named-checkzone trust /var/named/trust.zone`

## FAQ

### General Questions

**Q: What is QDNS?**

A: QDNS (Quantum DNS) is a next-generation domain name system designed specifically for the `.trust` TLD. It combines traditional DNS functionality with quantum-resistant cryptography.

**Q: How is QDNS different from regular DNS?**

A: QDNS includes quantum-resistant cryptography, enhanced security features, and a comprehensive management API and web interface.

**Q: Is QDNS open source?**

A: Yes, QDNS is fully open source and available on GitHub.

### Technical Questions

**Q: Does QDNS support DNSSEC?**

A: Yes, QDNS fully supports DNSSEC and encourages its use for all domains.

**Q: What quantum-resistant algorithms does QDNS use?**

A: QDNS uses SPHINCS+ for signatures, CRYSTALS-Kyber for key encapsulation, and CRYSTALS-Dilithium for digital signatures.

**Q: Can I use QDNS with existing DNS tools?**

A: Yes, QDNS is compatible with standard DNS tools like `dig`, `nslookup`, and `host`.

### Usage Questions

**Q: How do I register a domain in the `.trust` TLD?**

A: You can register a domain through the QDNS Web Interface at `https://cpanel.aethercoin.trust` or via the API.

**Q: How much does it cost to register a `.trust` domain?**

A: Domain registration fees are set by the AI Freedom Trust and are typically paid in FractalCoin. See the pricing page for current rates.

**Q: How do I transfer a domain to another user?**

A: You can initiate a domain transfer through the QDNS Web Interface or API. The recipient will need to accept the transfer using an authorization code.

## Support

For additional support, please contact:

- Email: support@aethercoin.trust
- Discord: https://discord.gg/aethercoin
- GitHub Issues: https://github.com/aifreedomtrust/aethercoin/issues

## License

QDNS is licensed under the MIT License. See the LICENSE file for details.
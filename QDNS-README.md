# QDNS: Quantum DNS for .trust TLD

## Overview

QDNS (Quantum DNS) is our implementation of a quantum-resistant domain name system for the `.trust` TLD. This system allows us to operate our own top-level domain with enhanced security features, including protection against future quantum computing attacks.

## Features

- **Full TLD Control**: Complete management of the `.trust` TLD
- **Quantum-Resistant Security**: Post-quantum cryptographic algorithms for DNS security
- **DNSSEC Support**: Enhanced DNS security with DNSSEC
- **Web Management Interface**: User-friendly domain management portal
- **API Access**: Comprehensive API for programmatic access
- **WHOIS Service**: Built-in WHOIS lookup functionality

## Implementation Status

The QDNS system is currently in the **initial implementation phase**. The following components have been implemented:

- ✅ Database schema for TLD, domain, and DNS record management
- ✅ Core QDNS service with domain registration and DNS record management
- ✅ API routes for QDNS functionality
- ✅ Web interface for domain management
- ✅ BIND configuration for nameserver setup
- ✅ Zone file generation for the `.trust` TLD
- ✅ Deployment script for QDNS server setup

Components still in development:

- ⏳ Integration with quantum-resistant cryptography libraries
- ⏳ DNSSEC key management system
- ⏳ Automated zone file updates
- ⏳ Secondary nameserver synchronization
- ⏳ WHOIS server implementation
- ⏳ Domain payment processing

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- PostgreSQL 13+
- BIND 9.16+
- Linux server with root access

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/aifreedomtrust/aethercoin.git
   cd aethercoin
   ```

2. Run the QDNS deployment script:
   ```bash
   sudo ./deploy-qdns.sh
   ```

3. Access the QDNS management interface:
   ```
   https://cpanel.aethercoin.trust
   ```

## Architecture

QDNS consists of several components:

1. **Database Layer**: PostgreSQL database with tables for TLDs, domains, DNS records, etc.
2. **Service Layer**: Node.js service for domain and DNS record management
3. **API Layer**: RESTful API for programmatic access
4. **Web Interface**: React-based management portal
5. **DNS Server**: BIND9 with custom configurations for the `.trust` TLD
6. **WHOIS Server**: Custom WHOIS server for domain information lookup

## Usage Examples

### Registering a Domain

```javascript
// Using the QDNS API
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

### Adding DNS Records

```javascript
// Using the QDNS API
const response = await fetch(`/api/qdns/domains/${domainId}/dns`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    recordType: 'A',
    name: '@',
    value: '203.0.113.10',
    ttl: 3600
  })
});

const data = await response.json();
console.log(data);
```

## Testing Your Domain

Once your domain is registered and DNS records are configured, you can test it using standard DNS tools:

```bash
# Check A record
dig example.trust A

# Check nameserver records
dig example.trust NS

# Check DNSSEC records
dig example.trust DNSKEY +dnssec

# Perform a WHOIS lookup
whois example.trust
```

## Roadmap

1. **Q1 2024**: Complete core implementation and launch first nameserver
2. **Q2 2024**: Implement full quantum-resistant cryptography
3. **Q3 2024**: Launch public domain registration system
4. **Q4 2024**: Implement automated domain renewal and payment processing
5. **Q1 2025**: Expand to multiple nameservers for redundancy
6. **Q2 2025**: Implement advanced DNSSEC features

## Contributing

Contributions to QDNS are welcome! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines.

## License

QDNS is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions or support, please contact:

- Email: dns@aethercoin.trust
- Discord: https://discord.gg/aethercoin
- GitHub Issues: https://github.com/aifreedomtrust/aethercoin/issues
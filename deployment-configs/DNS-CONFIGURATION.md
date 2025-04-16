# DNS Configuration for Aetherion Harmony Deployment

This document provides the exact DNS records you need to configure to properly set up the Aetherion Harmony website.

## Required DNS Records

| Record Type | Name/Host | Value/Target | TTL | Priority | Purpose |
|-------------|-----------|--------------|-----|----------|---------|
| A           | atc       | [YOUR_CPANEL_IP_ADDRESS] | 3600 | - | Points domain to your CPanel server |
| CNAME       | www.atc   | atc.aifreedomtrust.com | 3600 | - | Allows www subdomain to work |
| MX          | atc       | mail.atc.aifreedomtrust.com | 3600 | 10 | Configures email |
| TXT         | atc       | v=spf1 a mx include:_spf.yourhostingprovider.com ~all | 3600 | - | Email security |

## How to Configure

1. Log in to your domain registrar (where aifreedomtrust.com is registered)
2. Navigate to the DNS management section
3. Add or update the records as specified in the table above
4. Replace [YOUR_CPANEL_IP_ADDRESS] with the actual IP address provided by your CPanel hosting company
5. Save the changes

## Example DNS Configuration

Here's an example of what your DNS configuration might look like:

```
# A Records
atc.aifreedomtrust.com.     3600    IN    A    123.45.67.89

# CNAME Records
www.atc.aifreedomtrust.com.    3600    IN    CNAME    atc.aifreedomtrust.com.

# MX Records
atc.aifreedomtrust.com.    3600    IN    MX    10    mail.atc.aifreedomtrust.com.

# TXT Records
atc.aifreedomtrust.com.    3600    IN    TXT    "v=spf1 a mx include:_spf.yourhostingprovider.com ~all"
```

## Verification

After configuring DNS records:

1. Wait for DNS propagation (up to 48 hours)
2. Verify DNS configuration using online tools:
   - https://dnschecker.org
   - https://mxtoolbox.com
   - https://whatsmydns.net

3. Test your website by accessing:
   - https://atc.aifreedomtrust.com
   - https://www.atc.aifreedomtrust.com

## Troubleshooting

If your website is not accessible after 48 hours:

1. Verify DNS records are correctly set
2. Check that your CPanel server is properly configured
3. Ensure SSL certificates are installed
4. Check for any firewall or security settings that might block access

For any issues, contact your hosting provider with this DNS configuration document.
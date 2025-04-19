# Domain Deployment Guide for AI Freedom Trust

This guide provides specific instructions for deploying the Aetherion application to your domain with cPanel hosting.

## Domain Configuration

### DNS Configuration

1. Log in to your domain registrar (where you purchased your domain)
2. Point your domain to your hosting's nameservers (typically provided by your hosting provider)
3. If using a subdomain (e.g., atc.aifreedomtrust.com), create the subdomain in cPanel

### SSL/TLS Configuration

1. In cPanel, navigate to SSL/TLS Status
2. Install an SSL certificate for your domain
3. Options:
   - Let's Encrypt (free, auto-renewal)
   - AutoSSL (if provided by your hosting)
   - Purchase a commercial SSL certificate

## Application Configuration

### Domain-Specific Settings

Update your application configuration to reflect your domain:

1. In the `.env` file, set:
   ```
   DOMAIN=aifreedomtrust.com
   SITE_URL=https://aifreedomtrust.com
   ```

2. If using a subdomain for specific features, configure those as well:
   ```
   ATC_SUBDOMAIN=atc.aifreedomtrust.com
   ```

### Apache Configuration

Create or update the `.htaccess` file for your domain:

```apache
# Enable HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# www to non-www redirect (if preferred)
RewriteCond %{HTTP_HOST} ^www\.(.+)$ [NC]
RewriteRule ^(.*)$ https://%1%{REQUEST_URI} [R=301,L]

# Application routing rules
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Special handling for ATC subdomain
RewriteCond %{HTTP_HOST} ^atc\.aifreedomtrust\.com$ [NC]
RewriteRule ^/?$ /atc-aifreedomtrust [L,R=302]

# Serve static files from the 'aifreedomtrust' directory
RewriteCond %{REQUEST_URI} ^/aifreedomtrust/(.*)$
RewriteCond %{DOCUMENT_ROOT}/aifreedomtrust/%1 -f
RewriteRule ^aifreedomtrust/(.*)$ aifreedomtrust/$1 [L]

# Security headers
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Content-Security-Policy "upgrade-insecure-requests;"
```

## Subdomain Configuration

To set up the ATC subdomain (atc.aifreedomtrust.com):

1. In cPanel, navigate to "Subdomains"
2. Create a new subdomain:
   - Subdomain: atc
   - Domain: aifreedomtrust.com
   - Document Root: (point to your application's directory)

3. Configure SSL for the subdomain (same process as the main domain)

## Testing Domain Configuration

1. Perform DNS propagation check:
   ```
   dig aifreedomtrust.com
   dig atc.aifreedomtrust.com
   ```

2. Test SSL configuration:
   ```
   curl -I https://aifreedomtrust.com
   curl -I https://atc.aifreedomtrust.com
   ```

3. Test application accessibility:
   - Visit https://aifreedomtrust.com in your browser
   - Visit https://atc.aifreedomtrust.com in your browser

## Post-Deployment Domain Verification

After deploying, verify:

1. Domain resolves to your application
2. HTTPS works correctly
3. No mixed content warnings
4. All application features work properly
5. Subdomains redirect as expected

## Domain Maintenance

1. Monitor SSL certificate expiration (set calendar reminders for renewal)
2. Regularly check domain DNS settings
3. Consider setting up domain monitoring services

---

For detailed cPanel deployment instructions, refer to [CPANEL-README.md](./CPANEL-README.md).

For complete hosting deployment guide, see [HOSTING-DEPLOYMENT-GUIDE.md](./HOSTING-DEPLOYMENT-GUIDE.md).
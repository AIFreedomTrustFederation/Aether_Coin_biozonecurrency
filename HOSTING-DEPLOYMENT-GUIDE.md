# Aetherion-AI Freedom Trust Deployment Guide

This guide provides instructions for deploying the Aetherion application to a cPanel hosting environment.

## Server Environment Details

| Item | Detail |
|------|--------|
| Hosting Package | NanoVault |
| Server Name | crispr |
| cPanel Version | 126.0 (build 14) |
| Apache Version | 2.4.63 |
| Database Version | 10.6.21-MariaDB-cll-lve |
| Architecture | x86_64 |
| Operating System | linux |
| PHP Version | Detected via cPanel PHP FPM |

## Pre-Deployment Checklist

- [ ] Ensure Node.js is available (Node.js 18+ recommended)
- [ ] Verify MariaDB database is properly configured
- [ ] Check available disk space (current usage: 58% on main partition)
- [ ] Verify memory usage (current: 58.28%)
- [ ] Enable required Apache modules (mod_rewrite, etc.)

## Deployment Steps

### 1. Database Setup

1. Create a new database via cPanel MySQL Database Wizard
2. Create a database user with appropriate permissions
3. Make note of the database connection details for configuration

### 2. Application Setup

#### Using File Manager:

1. Upload the deployment package (zip file) to your home directory
2. Extract the files to your desired location (e.g., public_html/aetherion)
3. Set appropriate file permissions:
   - Directories: 755
   - Files: 644
   - Configuration files: 600

#### Using SSH (if available):

```bash
# Navigate to your desired directory
cd ~/public_html

# Clone the repository (if applicable)
git clone https://github.com/yourusername/aetherion-wallet.git aetherion

# Navigate to the project directory
cd aetherion

# Install dependencies
npm install --production

# Build the application
npm run build
```

### 3. Configure Environment

Create a `.env` file with the necessary configuration:

```
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# Application Configuration
NODE_ENV=production
PORT=8080
```

### 4. Configure Apache

Create a `.htaccess` file in your application root with the following content:

```apache
# Enable the rewrite engine
RewriteEngine On

# Set the base directory
RewriteBase /

# Redirect all requests to index.html except for actual files and directories
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L,QSA]

# Serve static files from the 'public' directory
RewriteCond %{REQUEST_URI} ^/aifreedomtrust/(.*)$
RewriteCond %{DOCUMENT_ROOT}/aifreedomtrust/%1 -f
RewriteRule ^aifreedomtrust/(.*)$ aifreedomtrust/$1 [L]

# Set security headers
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"
Header set X-Frame-Options "SAMEORIGIN"
Header set Referrer-Policy "strict-origin-when-cross-origin"
```

### 5. Configure Node.js (if available)

If your hosting supports Node.js applications:

1. Set up a Node.js application in cPanel
2. Configure the application to point to your project directory
3. Set the main file to `server.js`
4. Configure any environment variables needed

### 6. Alternative: Static Build Deployment

If Node.js is not available or you prefer a static deployment:

1. Build the application locally:
   ```bash
   npm run build
   ```

2. Upload the contents of the `dist` or `build` directory to your hosting

3. Configure the server to serve the static files

## Testing the Deployment

1. Navigate to your domain (e.g., https://yourdomain.com/aetherion)
2. Verify the application loads correctly
3. Test all key functionality:
   - Home page loads
   - AI Freedom Trust page loads
   - Navigation works
   - API endpoints respond correctly

## Troubleshooting

### Common Issues

1. **500 Internal Server Error**:
   - Check server error logs in cPanel
   - Verify file permissions
   - Ensure .htaccess is properly formatted

2. **Database Connection Issues**:
   - Verify database credentials
   - Check database connection settings
   - Ensure database user has correct permissions

3. **Blank Page or JavaScript Errors**:
   - Check browser console for errors
   - Verify all required assets are loading
   - Check for path issues in the built files

## Support Resources

- Server Status: Access via cPanel
- Error Logs: Available in cPanel under "Logs"
- Database Management: phpMyAdmin via cPanel
- File Management: File Manager or FTP via cPanel

---

Remember to update this guide as needed for your specific deployment requirements.
# cPanel Deployment Quick Guide for the "crispr" Server

This guide provides step-by-step instructions for deploying the Aetherion application to your specific cPanel server "crispr".

## Pre-Deployment Checklist

- [x] Application files prepared for deployment
- [x] Apache 2.4.63 available on server
- [x] MariaDB 10.6.21 available on server
- [ ] Domain/subdomain configured in cPanel
- [ ] SSL certificate installed for your domain

## Deployment Steps

### 1. Build the Deployment Package

```bash
# Make the script executable
chmod +x deploy-to-cpanel.sh

# Run the deployment script
./deploy-to-cpanel.sh
```

This will create a file named `biozone-harmony-boost-deployment-package.zip`.

### 2. Upload to cPanel

1. Log in to your cPanel account at your hosting provider
2. Navigate to "File Manager"
3. Navigate to `public_html` directory
4. Create a new folder named `aetherion` (or your preferred directory)
5. Click "Upload" and select the `biozone-harmony-boost-deployment-package.zip` file
6. Once uploaded, select the file and click "Extract"
7. Make sure to extract to `/public_html/aetherion`

### 3. Configure Apache

1. Verify that the `.htaccess` file was extracted
2. Make sure the RewriteBase directive is set correctly:
   ```
   RewriteBase /aetherion/
   ```
   (Adjust if you used a different directory name)

3. Verify Apache modules:
   - In cPanel, go to "Software" > "Select PHP Version"
   - Enable these extensions:
     - mod_rewrite
     - mod_headers
     - mod_ssl (if using HTTPS)

### 4. Set Permissions

From the File Manager:

1. Select all directories and click "Change Permissions"
   - Set to 755 (rwxr-xr-x)
   
2. Select all files and click "Change Permissions"
   - Set to 644 (rw-r--r--)
   
3. For the `.env` file (after you create it):
   - Set to 600 (rw-------)

### 5. Configure Environment

1. Rename `.env.example` to `.env`
2. Edit the `.env` file to set proper values for:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_db_username
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   
   DOMAIN=aifreedomtrust.com
   SITE_URL=https://aifreedomtrust.com
   ```

### 6. Setup Database (If Needed)

1. In cPanel, go to "Databases" > "MySQL Database Wizard"
2. Create a new database
3. Create a database user
4. Add the user to the database with "All Privileges"
5. Update your `.env` file with these credentials

### 7. Test the Deployment

1. Visit your site at:
   ```
   https://yourdomain.com/aetherion/
   ```
   
2. Check that the AI Freedom Trust landing page works:
   ```
   https://yourdomain.com/aetherion/aifreedomtrust/
   ```

### 8. Troubleshooting

If your site doesn't work properly:

1. Check Apache error logs:
   - In cPanel, go to "Metrics" > "Error Log"
   
2. Common issues:
   - Permission problems (incorrect directory/file permissions)
   - Rewrite rules not working (mod_rewrite not enabled)
   - SSL certificate issues (mixed content errors)
   - Database connection problems (incorrect credentials)

## Using Node.js on cPanel (Optional)

If your hosting plan supports Node.js applications:

1. In cPanel, go to "Software" > "Setup Node.js App"
2. Create a new application:
   - Application root: `/home/username/public_html/aetherion`
   - Application URL: `yourdomain.com/aetherion`
   - Application startup file: `server.js`
   - Environment variables: Add from your `.env` file

3. Start the application from the Node.js App interface

## Additional Resources

For more detailed instructions, refer to:

- The [HOSTING-DEPLOYMENT-GUIDE.md](./HOSTING-DEPLOYMENT-GUIDE.md) file
- The [DOMAIN-DEPLOYMENT.md](./DOMAIN-DEPLOYMENT.md) file
- cPanel documentation at `https://docs.cpanel.net/`
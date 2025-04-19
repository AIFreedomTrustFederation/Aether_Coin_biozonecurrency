# cPanel Deployment Guide for Aetherion

This guide provides a simplified overview of how to deploy the Aetherion application to your cPanel hosting environment.

## Quick Start Guide

### 1. Prepare the Deployment Package

Run the deployment script to create a deployment package:

```bash
chmod +x ./deploy-to-cpanel.sh
./deploy-to-cpanel.sh
```

This will create a ZIP file named `aetherion-deployment-package.zip`.

### 2. Upload to cPanel

1. Log in to your cPanel account
2. Navigate to File Manager
3. Go to the directory where you want to deploy the application (e.g., `public_html`)
4. Upload the `aetherion-deployment-package.zip` file
5. Extract the ZIP file

### 3. Configure the Application

1. Rename `.env.example` to `.env`
2. Edit the `.env` file with your configuration details
3. Set appropriate file permissions:
   ```
   find . -type d -exec chmod 755 {} \;
   find . -type f -exec chmod 644 {} \;
   chmod 600 .env
   ```

### 4. Database Setup (if needed)

1. Go to MySQL Databases in cPanel
2. Create a new database and user
3. Update the database connection details in your `.env` file

### 5. Test the Deployment

Visit your website to confirm that the application is running correctly.

## Deployment Options

### Static Deployment

For static builds (default):
- The application will be served entirely as static files
- No server-side processing is required
- Apache will handle all routing via .htaccess

### Node.js Deployment

If your hosting supports Node.js:
1. In cPanel, navigate to "Setup Node.js App"
2. Create a new Node.js application
3. Point it to your application directory
4. Set the entry point to `server.js`
5. Configure the environment variables

## Troubleshooting

### Common Issues

1. **404 Errors**: Check your .htaccess file for correct routing rules
2. **500 Errors**: Check server error logs in cPanel
3. **White Screen**: Check browser console for JavaScript errors
4. **Database Errors**: Verify database connection settings

### Getting Help

For detailed instructions, refer to the full [HOSTING-DEPLOYMENT-GUIDE.md](./HOSTING-DEPLOYMENT-GUIDE.md).

## Security Considerations

1. Keep your `.env` file secure and outside public web directories if possible
2. Regularly update your application and dependencies
3. Use HTTPS for all communications
4. Monitor your server logs for suspicious activity

## Maintenance

1. **Backups**: Use cPanel's backup tools to regularly back up your application
2. **Updates**: When updating the application, follow the same deployment process
3. **Monitoring**: Regularly check server logs for any issues

---

For any questions or issues, please refer to the detailed [HOSTING-DEPLOYMENT-GUIDE.md](./HOSTING-DEPLOYMENT-GUIDE.md).
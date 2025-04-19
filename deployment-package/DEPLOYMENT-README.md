# Aetherion Deployment Package for cPanel

This package contains the files necessary to deploy the Aetherion biozone-harmony-boost application
to your cPanel hosting environment on server "crispr".

## Quick Start Deployment Instructions

1. Upload all files in this package to your cPanel environment at: `public_html/aetherion`
   * Use the File Manager in cPanel
   * Or use FTP with your cPanel credentials

2. Set appropriate file permissions:
   * Directories: 755
   * Files: 644
   * Configuration files (.env, etc.): 600

3. Rename `.env.example` to `.env` and update the configuration values

4. Verify that the .htaccess file is properly configured for your environment

## Additional Notes

* The application is configured to run at: `https://yourdomain.com/aetherion`
* The AI Freedom Trust landing page will be accessible at: `https://yourdomain.com/aetherion/aifreedomtrust`
* For subdomain configuration, refer to DOMAIN-DEPLOYMENT.md

## Troubleshooting

If you encounter any issues:
1. Check the Apache error logs in cPanel
2. Verify that mod_rewrite is enabled
3. Ensure the file permissions are set correctly
4. Confirm that all paths in .htaccess match your actual deployment

For more detailed instructions, refer to HOSTING-DEPLOYMENT-GUIDE.md.

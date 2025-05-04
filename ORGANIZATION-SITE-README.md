# AI Freedom Trust Federation Organization Site

This repository houses the main organization site for the AI Freedom Trust Federation, serving as the central hub for all brand subdomains.

## Repository Structure

```
AIFreedomTrustFederation.github.io/
├── index.html                     # Main landing page
├── CNAME                          # Custom domain configuration
├── .nojekyll                      # Bypass Jekyll processing
├── assets/                        # Static assets
│   ├── css/                       # Stylesheet files
│   ├── js/                        # JavaScript files
│   └── brands/                    # Brand-specific assets
│       ├── quantum-domain/        # Assets for Quantum Domain
│       ├── aether-mesh/           # Assets for AetherMesh
│       └── ...                    # Other brand assets
├── quantum-domain/                # Subdirectory for Quantum Domain brand
│   └── index.html                 # Redirect to quantum-domain.aifreedomtrust.com
├── fractal-network/               # Subdirectory for Fractal Network brand
│   └── index.html                 # Redirect to fractal-network.aifreedomtrust.com
└── ...                            # Other brand subdirectories
```

## Setting Up the Repository

1. Create a new repository named `AIFreedomTrustFederation.github.io`
2. Clone this repository
3. Copy the files from this structure to the new repository
4. Push to GitHub
5. GitHub Pages will automatically publish the site to `https://aifreedomtrustfederation.github.io/`

## Custom Domain Configuration

To use a custom domain (aifreedomtrust.com):

1. Create a CNAME file with content `aifreedomtrust.com`
2. Push this file to the repository
3. In GitHub repository settings, under "Pages", enter your custom domain
4. Configure DNS as follows:
   - For apex domain (aifreedomtrust.com):
     - Add an A record pointing to GitHub Pages IPs:
       - 185.199.108.153
       - 185.199.109.153
       - 185.199.110.153
       - 185.199.111.153
     - Or, add a CNAME record for www pointing to AIFreedomTrustFederation.github.io

## Brand Subdomain Configuration

For each brand subdomain (e.g., aethercoin.aifreedomtrust.com):

1. Add a CNAME record in your DNS:
   - Name: aethercoin
   - Value: AIFreedomTrustFederation.github.io

2. Create a subdirectory in the repository with an index.html file that redirects to the brand site

## Using the GitHub Actions Workflow

This repository includes GitHub Actions workflows to automate deployment:

1. `.github/workflows/organization-site-deploy.yml` - Deploys the main organization site
2. `.github/workflows/brand-site-deploy.yml` - Deploys individual brand sites

To use these workflows:

1. Copy the workflow files to your repository
2. Push to GitHub
3. The workflows will automatically run on push to the main branch
4. You can also manually trigger the workflows from the Actions tab

## Updating the Organization Site

To update the organization site:

1. Clone the repository
2. Make your changes
3. Push to GitHub
4. GitHub Actions will automatically deploy the changes

## Maintaining Brand Redirects

When adding a new brand:

1. Create a new subdirectory with the brand name
2. Add an index.html file with a redirect to the brand subdomain
3. Update the brand showcase section in the main index.html
4. Push the changes to GitHub

## DNS Management Automation

Use the `github-pages-dns-setup.sh` script to automate DNS configuration:

```bash
./github-pages-dns-setup.sh
```

This script will:
1. Prompt for cPanel credentials
2. Allow you to select which subdomain to configure
3. Automatically set up the required DNS records
4. Verify the DNS configuration

## Testing and Verification

After deployment:

1. Verify that the main site is accessible at aifreedomtrust.com
2. Check that each brand subdomain redirects correctly
3. Ensure all assets (images, CSS, JavaScript) load properly
4. Test navigation and functionality

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Custom Domain Configuration](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Managing DNS Records](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

For detailed instructions on setting up GitHub Pages for the entire AI Freedom Trust ecosystem, refer to the [GITHUB-PAGES-DEPLOYMENT-GUIDE.md](./GITHUB-PAGES-DEPLOYMENT-GUIDE.md).
# GitHub Organization Structure for AI Freedom Trust

This document outlines the recommended GitHub organization structure for the AI Freedom Trust ecosystem, providing a clear hierarchy for repositories and deployment strategies.

## Organization Structure

```
AIFreedomTrustFederation (GitHub Organization)
│
├── AIFreedomTrustFederation.github.io (Main organization site)
│   ├── Main landing page (aifreedomtrust.com)
│   ├── Brand showcase
│   └── Documentation
│
├── Aether_Coin_biozonecurrency (Project repository)
│   ├── Landing page (aethercoin.aifreedomtrust.com)
│   ├── Documentation
│   └── Source code
│
├── FractalCoin (Project repository)
│   ├── Landing page (fractalcoin.aifreedomtrust.com)
│   ├── Documentation
│   └── Source code
│
├── Quantum_Domain (Project repository)
│   ├── Landing page (quantumdomain.aifreedomtrust.com)
│   ├── Documentation
│   └── Source code
│
└── ... (Other project repositories)
```

## Main Organization Repository

The repository named `AIFreedomTrustFederation.github.io` serves as the main website for your organization and will automatically be published to GitHub Pages.

### Setup Instructions

1. Create a new repository named `AIFreedomTrustFederation.github.io`
2. Add the initial content:
   - `index.html` - Main landing page
   - `CNAME` - For custom domain (if using aifreedomtrust.com)
   - `.nojekyll` - To bypass Jekyll processing
   - Static assets (CSS, JavaScript, images)
3. Configure GitHub Pages settings through the repository settings
4. Set up DNS records as detailed in the [GITHUB-PAGES-DEPLOYMENT-GUIDE.md](./GITHUB-PAGES-DEPLOYMENT-GUIDE.md)

## Project Repositories

Each brand or project should have its own repository with the following structure:

### Repository Structure

```
project-repo-name/
├── docs/               # Documentation
├── public/             # Static assets for GitHub Pages
│   ├── index.html      # Landing page
│   ├── CNAME           # For custom subdomain
│   └── assets/         # Images, CSS, etc.
├── src/                # Source code
└── .github/workflows/  # CI/CD workflows
    └── ghpages-deploy.yml  # GitHub Pages deployment workflow
```

### Setup Instructions for Each Project Repository

1. Create a new repository with an appropriate name (e.g., `Aether_Coin_biozonecurrency`)
2. Add the standard repository structure as outlined above
3. Configure GitHub Pages through the repository settings
4. Set up a custom subdomain (e.g., `aethercoin.aifreedomtrust.com`) by:
   - Creating a CNAME file with the subdomain
   - Setting up DNS records as detailed in the deployment guide
   - Configuring the custom domain in GitHub Pages settings

## Repository Migration Strategy

If you're moving repositories from Replit to GitHub:

1. Create a new repository on GitHub
2. Clone your Replit repository locally
3. Push to the new GitHub repository
4. Set up GitHub Pages as detailed in the deployment guide

## GitHub Organization Permissions

Set up your organization with appropriate permission levels:

1. **Owners**: Full administrative access (limited to key personnel)
2. **Maintainers**: Can manage repositories but not org-wide settings
3. **Members**: Limited access based on repository permissions

## Continuous Integration/Deployment

Each repository should include GitHub Actions workflows for:

1. **Deployment**: Automatically deploy to GitHub Pages on changes to the main branch
2. **Testing**: Run tests on pull requests
3. **Code Quality**: Lint and analyze code

## Documentation Strategy

Maintain consistent documentation across repositories:

1. Each repository should have a detailed README.md
2. Use the docs/ directory for comprehensive documentation
3. Cross-link documentation between repositories
4. Keep deployment guides updated

---

For detailed deployment instructions, refer to [GITHUB-PAGES-DEPLOYMENT-GUIDE.md](./GITHUB-PAGES-DEPLOYMENT-GUIDE.md).
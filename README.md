# Aetherion Brand Showcase

This repository contains the landing page for the Aetherion technologies, part of the AI Freedom Trust ecosystem.

## GitHub Pages Setup with Custom Domain

This site is configured to be served from `atc.aifreedomtrust.com` using GitHub Pages.

### DNS Configuration

To properly connect your domain to GitHub Pages, configure the following DNS records with your domain provider:

#### For the apex domain (aifreedomtrust.com)
Add these A records pointing to GitHub's servers:
```
A    @    185.199.108.153
A    @    185.199.109.153
A    @    185.199.110.153
A    @    185.199.111.153
```

#### For the atc subdomain (atc.aifreedomtrust.com)
Add a CNAME record:
```
CNAME    atc    [your-github-username].github.io
```

### Repository Configuration

1. The repository contains a `CNAME` file with `atc.aifreedomtrust.com`
2. In the repository settings, under Pages, the custom domain is set to `atc.aifreedomtrust.com`
3. HTTPS is enforced for secure connections

### Verification

After DNS propagation (which can take up to 48 hours):
1. The site should be accessible at `https://atc.aifreedomtrust.com`
2. GitHub Pages settings should show "Your site is published at https://atc.aifreedomtrust.com"

## Brand Ecosystem

The ecosystem includes the following brands, each with their own subdomain:

- Quantum Domain: https://quantumdomain.aifreedomtrust.com
- Zero Trust Framework: https://zerotrust.aifreedomtrust.com
- Fractal Network: https://fractalnetwork.aifreedomtrust.com
- AetherMesh: https://aethermesh.aifreedomtrust.com
- Fractal Vault: https://fractalvault.aifreedomtrust.com
- Quantum Guard: https://quantumguard.aifreedomtrust.com
- Mysterion: https://mysterion.aifreedomtrust.com
- Fractal Chain: https://fractalchain.aifreedomtrust.com

The central brand showcase is available at https://ai.aifreedomtrust.com
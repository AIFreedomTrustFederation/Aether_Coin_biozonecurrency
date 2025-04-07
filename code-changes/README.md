# Aetherion Mobile Menu Implementation

## Overview

This package contains all the necessary code changes to implement a responsive mobile menu for the Aetherion project with lazy-loaded components for improved performance. It also includes updated deployment scripts for IPFS via Storacha and GitHub Actions workflow configuration.

## Features

- **Mobile-First Responsive Design**: The menu adapts to different screen sizes, with a hamburger menu for mobile devices.
- **Performance Optimization**: Component lazy loading with suspense boundaries and skeleton loaders to improve initial load performance.
- **Category-Based Navigation**: Organized menu structure with quick access to frequently used pages.
- **Modern Deployment Pipeline**: Updated deployment scripts for Storacha IPFS and GitHub Actions workflows.

## Implementation Details

### Mobile Menu Components

- **MobileMenu.tsx**: Main container component with lazy loading implementation.
- **MobileMenuTrigger**: Hamburger menu button component.
- **CategorySection.tsx**: Reusable component for organizing navigation links by category.
- **QuickAccessSection.tsx**: Component for frequently accessed pages with grid layout.

### Main Layout Integration

- **MainLayout.tsx**: The layout component that integrates the mobile menu with the rest of the application.
- **use-mobile.tsx**: Custom hook to detect mobile viewport for conditional rendering.

### Deployment

- **deploy-to-storacha.js**: ES module script for deploying to Storacha IPFS service.
- **deploy-storacha.sh**: Shell script wrapper for the deployment script.
- **.github/workflows/deploy.yml**: GitHub Actions workflow for automating the deployment process.

## Installation

1. Copy the files into your project structure, maintaining the relative paths.
2. Install any missing dependencies.
3. Ensure the use of import paths matches your project configuration.

## Usage

The mobile menu automatically appears when the viewport width is below 768px (the medium breakpoint in Tailwind CSS). The menu is triggered by clicking the hamburger icon in the header.

## Deployment

### Prerequisites
- STORACHA_API_KEY environment variable must be set
- For ENS domain updates, ENS_PRIVATE_KEY and ENS_DOMAIN environment variables are required

### Deploy Manually
```bash
./deploy-storacha.sh
```

### GitHub Actions Deployment
The included GitHub Actions workflow will automatically deploy when code is pushed to the main branch.

## Customization

You can customize the menu items, categories, and styling by modifying the respective components:

- Edit the navigation items in `MobileMenu.tsx`
- Adjust styles in the component files using Tailwind CSS classes
- Modify the skeleton loader appearance in the `LoadingSkeleton` component

## Best Practices

- Keep the menu structure organized and limit the depth of navigation.
- Prioritize frequently used pages in the QuickAccessSection.
- Test the menu on various device sizes to ensure responsive behavior.
- Avoid adding too many items to a single category to prevent overwhelming the user.

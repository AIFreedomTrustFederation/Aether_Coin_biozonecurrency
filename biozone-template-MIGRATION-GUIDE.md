# Migration Guide: From Lovable Template to Biozone Template

This guide provides step-by-step instructions for migrating the repository from the "lovable" template to the new Biozone template for the AetherCore ecosystem.

## Prerequisites

- Node.js 18+ and npm
- Git access to the repository

## Step 1: Backup the Current Repository

Before making any changes, create a backup of the current repository:

```bash
git checkout -b backup-lovable-template
git push origin backup-lovable-template
```

## Step 2: Create a New Branch for the Migration

```bash
git checkout main
git pull
git checkout -b migrate-to-biozone-template
```

## Step 3: Replace Core Files

1. Replace the following files with their biozone template equivalents:

   - `src/App.tsx`
   - `src/App.css`
   - `src/index.css`
   - `src/main.tsx`
   - `theme.json`

2. Create new component directories and files:

   - `src/components/theme-provider.tsx`
   - `src/components/Navbar.tsx`
   - `src/components/HeroSection.tsx`
   - `src/components/FeatureSection.tsx`
   - `src/components/AboutSection.tsx`
   - `src/components/TechnologySection.tsx`
   - `src/components/Footer.tsx`
   - `src/components/ui/tabs.tsx`
   - `src/pages/Index.tsx`
   - `src/lib/utils.ts`

## Step 4: Update Package Dependencies

Ensure the following dependencies are installed:

```bash
npm install @radix-ui/react-tabs framer-motion lucide-react clsx tailwind-merge
```

## Step 5: Update Tailwind Configuration

Ensure `tailwind.config.js` has the correct configuration for the biozone template:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        'quantum-light': '#0080ff',
        'quantum-dark': '#0044bb',
        'aether-light': '#7000ff',
        'aether-dark': '#4400aa',
        'sacred-light': '#f08c1a',
        'sacred-dark': '#ba6c13',
        'biozoe-light': '#19c964',
        'biozoe-dark': '#148c47',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

## Step 6: Preserve Existing Functionality

1. Identify any custom components or functionality that need to be preserved from the lovable template
2. Integrate these components into the new structure
3. Update imports and references as needed

## Step 7: Test the Migration

Run the development server to test the migration:

```bash
npm run dev
```

Verify that:
- The site loads correctly
- All components render properly
- All functionality works as expected
- The site is responsive across different device sizes

## Step 8: Create a Pull Request

Once everything is working properly:

```bash
git add .
git commit -m "Migrate from lovable template to biozone template"
git push origin migrate-to-biozone-template
```

Then create a pull request on GitHub to merge these changes into the main branch.

## Troubleshooting

### Component Not Found Errors

If you encounter errors related to missing components:

1. Check that all necessary component files have been created
2. Verify that imports use the correct relative paths
3. Ensure all required dependencies are installed

### Styling Issues

If components don't look as expected:

1. Verify that `theme.json` has been updated
2. Check that the Tailwind config includes all necessary extensions
3. Ensure CSS files are properly imported in the correct order
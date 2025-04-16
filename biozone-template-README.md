# AetherCore Landing Page

This is a modern, responsive landing page for the AetherCore ecosystem, built with React, TypeScript, Framer Motion, and Tailwind CSS.

## Features

- Quantum-inspired design elements and animations
- Responsive layout for all device sizes
- Interactive technology showcases
- Dark mode support

## Technology Stack

- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animation library
- **ShadcnUI** - Component library
- **Vite** - Build tool

## Project Structure

```
src/
  ├── assets/             # Static assets
  ├── components/         # UI components
  │   ├── ui/             # Shadcn UI components
  │   └── ...             # Page-specific components
  ├── lib/                # Utility functions
  ├── pages/              # Page components
  └── App.tsx             # Main app component
```

## Development

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the site in your browser.

## Customization

### Theme

The site uses Tailwind CSS with a custom color palette defined in `theme.json`. You can modify the colors and appearance by editing this file.

### Components

All components are built with reusability in mind. You can customize them by modifying their props or editing the component files directly.

## Deployment

Build the production version:

```bash
npm run build
```

The build output will be in the `dist` directory, which can be deployed to any static hosting service.

## License

[MIT](LICENSE)
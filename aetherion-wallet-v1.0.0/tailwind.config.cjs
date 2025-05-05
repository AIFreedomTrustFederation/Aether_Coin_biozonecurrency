/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./client/src/**/*.{js,jsx,ts,tsx}",
    "./client/public/index.html",
    "./index.html",
    "./**/*.{js,jsx,ts,tsx,html}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        serif: ['Roboto Slab', 'serif']
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Custom colors for Biozoe theme
        forest: {
          50: "#f0f9f0",
          100: "#dcf0dc",
          200: "#bde2be",
          300: "#92ce94",
          400: "#65b668",
          500: "#4d994d",
          600: "#3a7a3c",
          700: "#306132",
          800: "#294e2a",
          900: "#224224",
          950: "#0f220f",
        },
        water: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#b9e5fe",
          300: "#7cd2fc",
          400: "#36bff8",
          500: "#0ca3eb",
          600: "#0082ca",
          700: "#0068a3",
          800: "#005786",
          900: "#074970",
          950: "#042e49",
        },
        cosmic: {
          50: "#f4f1ff",
          100: "#ebe5ff",
          200: "#d9ceff",
          300: "#bea7ff",
          400: "#9f75ff",
          500: "#883eff",
          600: "#7916ff",
          700: "#6c00ff",
          800: "#5a02d1",
          900: "#4c04aa",
          950: "#2e0173"
        },
        quantum: {
          50: "#eefaff",
          100: "#d8f4ff",
          200: "#b9ecff",
          300: "#87e3ff",
          400: "#4cd2ff",
          500: "#26baff",
          600: "#0198ff",
          700: "#0179ff",
          800: "#0766cf",
          900: "#0c559f",
          950: "#0d345f"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}
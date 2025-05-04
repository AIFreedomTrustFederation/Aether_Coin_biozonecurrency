import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  root: __dirname,
  base: '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './client/src'),
      '@assets': resolve(__dirname, './client/src/assets'),
      '@components': resolve(__dirname, './client/src/components'),
      '@pages': resolve(__dirname, './client/src/pages'),
      '@hooks': resolve(__dirname, './client/src/hooks')
    }
  },
  server: {
    port: 5174,
    host: true,
    strictPort: true
  }
});

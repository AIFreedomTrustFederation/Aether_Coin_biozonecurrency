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
      '@hooks': resolve(__dirname, './client/src/hooks'),
      '@shared': resolve(__dirname, './client/src/shared'),
      // Critical: resolve the @shared/schema path that's causing the error
      '@shared/schema': resolve(__dirname, './client/src/shared/schema.ts')
    }
  },
  server: {
    port: 5176,
    host: true,
    strictPort: true
  }
});

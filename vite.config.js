import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { feedApiPlugin } from './server/vitePlugin.js';

export default defineConfig({
  plugins: [react(), feedApiPlugin()],
  server: {
    port: 5173,
    host: '127.0.0.1',
  },
  preview: {
    port: 4173,
    host: '127.0.0.1',
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});

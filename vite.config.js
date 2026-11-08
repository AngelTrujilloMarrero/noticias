import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { feedProxyPlugin } from './server/vitePlugin.js';

export default defineConfig({
  plugins: [react(), feedProxyPlugin()],
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

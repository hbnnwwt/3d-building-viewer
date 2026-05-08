import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/3d-building-viewer/dist/viewer/',
  build: {
    outDir: '../../../dist/viewer',
    emptyOutDir: true
  },
  server: {
    port: 5173
  }
});
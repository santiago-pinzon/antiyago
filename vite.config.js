import { defineConfig } from 'vite';

export default defineConfig({
  root: './', // Project root directory
  publicDir: 'public', // Directory for static files
  build: {
    outDir: 'dist', // Output directory for builds
    emptyOutDir: true, // Clear the output directory before building
  },
});

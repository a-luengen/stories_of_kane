import { defineConfig } from 'vite';

export default defineConfig({
  // Builds are served from the site root via the GitHub Pages custom domain
  // http://stories-of-kane.cerea-x.com/, so no subpath base is needed.
  base: '/',
  server: { port: 5173 },
  build: { target: 'es2022', chunkSizeWarningLimit: 800 }, // three.js alone is ~600 kB
});

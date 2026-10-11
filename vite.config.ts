import { defineConfig } from 'vite';

export default defineConfig({
  server: { port: 5173 },
  build: { target: 'es2022', chunkSizeWarningLimit: 800 }, // three.js alone is ~600 kB
  base: '/stories_of_kane/'
});

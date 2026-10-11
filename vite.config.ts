import { defineConfig } from 'vite';

export default defineConfig(({ command, isPreview }) => ({
  // Builds are served from GitHub Pages at https://a-luengen.github.io/stories_of_kane/ (and so is
  // `vite preview`, to test that); the dev server stays at /.
  base: command === 'build' || isPreview ? '/stories_of_kane/' : '/',
  server: { port: 5173 },
  build: { target: 'es2022', chunkSizeWarningLimit: 800 }, // three.js alone is ~600 kB
}));

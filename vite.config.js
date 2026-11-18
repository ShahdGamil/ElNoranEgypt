import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site from https://<user>.github.io/ElNoranEgypt/
// Override with VITE_BASE_PATH=/ when using a custom domain.
export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH || (mode === 'production' ? '/ElNoranEgypt/' : '/'),
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) return id.includes('framer-motion') || id.includes('motion-') ? 'motion' : 'vendor';
        },
      },
    },
  },
}));

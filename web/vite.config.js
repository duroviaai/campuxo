import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,          // flip to true if you need prod source maps
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split vendor libs into their own chunks
        manualChunks: (id) => {
          if (['react', 'react-dom', 'react-router-dom'].some((p) => id.includes(`/node_modules/${p}/`))) return 'vendor-react';
          if (['@reduxjs/toolkit', 'react-redux'].some((p) => id.includes(`/node_modules/${p}/`))) return 'vendor-redux';
          if (['react-hot-toast', 'recharts'].some((p) => id.includes(`/node_modules/${p}/`))) return 'vendor-ui';
          if (id.includes('/node_modules/axios/')) return 'vendor-network';
        },
      },
    },
  },

  // Dev server proxy — avoids CORS during local development
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});

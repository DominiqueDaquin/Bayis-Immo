import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://dakicodeur.pythonanywhere.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    allowedHosts:[
      "beb9-129-0-99-42.ngrok-free.app"
    ]
  },
  preview: {
    proxy: {
      '/api': {
        target: 'https://dakicodeur.pythonanywhere.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});

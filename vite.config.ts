import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'dynamic-coep-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Only set headers for initial HTML requests and not for assets
          const isHTMLRequest = req.url && (req.url === '/' || req.url.endsWith('.html') || !req.url.includes('.'));

          if (isHTMLRequest) {
            // Always set COOP for better security
            res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

            // Check if the request path is related to Power BI
            if (req.url && (req.url.includes('/reports') || req.url.includes('/insurer/reports'))) {
              console.log('PowerBI route detected:', req.url);
              // For PowerBI routes, explicitly set a permissive COEP value
              // res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
            }
            // Don't set COEP for other routes - let the service worker handle it
          }

          next();
        });
      },
    },
    // Copy service worker to output directory during build
    {
      name: 'copy-coi-serviceworker',
      closeBundle() {
        // This ensures the service worker is copied during production builds
        if (fs.existsSync('public/coi-serviceworker.js')) {
          fs.copyFileSync('public/coi-serviceworker.js', 'dist/coi-serviceworker.js');
        }
        // Copy the service worker manager as well
        if (fs.existsSync('src/utility/serviceWorkerManager.js')) {
          // Ensure the directory exists
          if (!fs.existsSync('dist/src/utility')) {
            fs.mkdirSync('dist/src/utility', { recursive: true });
          }
          fs.copyFileSync('src/utility/serviceWorkerManager.js', 'dist/src/utility/serviceWorkerManager.js');
        }
      },
    },
  ],
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
  server: {
    port: 5173,
    headers: {
      'Service-Worker-Allowed': '/',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});

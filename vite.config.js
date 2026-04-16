import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BACKEND_TARGET = 'http://localhost:3000';
let lastBackendNoticeAt = 0;

const vendorChunk = (id) => {
  if (id.includes('vite/preload-helper') || id.includes('commonjsHelpers')) {
    return 'vendor-runtime';
  }

  if (!id.includes('/node_modules/')) return null;

  if (
    id.includes('/node_modules/react/') ||
    id.includes('/node_modules/react-dom/') ||
    id.includes('/node_modules/react-router/') ||
    id.includes('/node_modules/react-router-dom/')
  ) {
    return 'vendor-react';
  }

  if (
    id.includes('/node_modules/framer-motion/') ||
    id.includes('/node_modules/motion-') ||
    id.includes('/node_modules/framesync/')
  ) {
    return 'vendor-motion';
  }

  if (
    id.includes('/node_modules/@chakra-ui/') ||
    id.includes('/node_modules/@emotion/') ||
    id.includes('/node_modules/@zag-js/')
  ) {
    return 'vendor-ui';
  }

  if (
    id.includes('/node_modules/i18next/') ||
    id.includes('/node_modules/react-i18next/') ||
    id.includes('/node_modules/i18next-browser-languagedetector/') ||
    id.includes('/node_modules/i18next-http-backend/')
  ) {
    return 'vendor-i18n';
  }

  if (
    id.includes('/node_modules/chart.js/') ||
    id.includes('/node_modules/react-chartjs-2/') ||
    id.includes('/node_modules/@kurkle/')
  ) {
    return 'vendor-charts';
  }

  if (
    id.includes('/node_modules/@monaco-editor/') ||
    id.includes('/node_modules/monaco-editor/') ||
    id.includes('/node_modules/state-local/')
  ) {
    return 'vendor-editor';
  }

  if (
    id.includes('/node_modules/exceljs/') ||
    id.includes('/node_modules/jspdf/') ||
    id.includes('/node_modules/jspdf-autotable/') ||
    id.includes('/node_modules/html2canvas/') ||
    id.includes('/node_modules/canvg/') ||
    id.includes('/node_modules/pako/') ||
    id.includes('/node_modules/fflate/') ||
    id.includes('/node_modules/fast-png/') ||
    id.includes('/node_modules/iobuffer/') ||
    id.includes('/node_modules/svg-pathdata/') ||
    id.includes('/node_modules/rgbcolor/') ||
    id.includes('/node_modules/stackblur-canvas/')
  ) {
    return 'vendor-export';
  }

  if (
    id.includes('/node_modules/lucide-react/') ||
    id.includes('/node_modules/react-icons/')
  ) {
    return 'vendor-icons';
  }

  return undefined;
};

const createProxyConfig = (pathOptions = {}) => ({
  target: BACKEND_TARGET,
  changeOrigin: true,
  ...pathOptions,
  configure: (proxyServer) => {
    proxyServer.on('error', (_error, req, res) => {
      const now = Date.now();
      if (now - lastBackendNoticeAt > 10000) {
        // Single clean notice while backend is booting; avoid noisy ECONNREFUSED flood.
        console.log('[vite] waiting for backend on http://localhost:3000...');
        lastBackendNoticeAt = now;
      }

      if (!res || res.headersSent) return;
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        statusCode: 503,
        message: 'Backend is starting. Please wait a moment...',
        path: req?.url || '',
      }));
    });
  },
});

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['monaco-editor', '@monaco-editor/react'],
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    cssMinify: true,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 300,
    reportCompressedSize: true,
    sourcemap: false,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: [
          'console.log',
          'console.warn',
          'console.info',
          'console.debug',
          'console.error',
        ],
        passes: 3,
        unsafe: true,
      },
      mangle: true,
    },
    rollupOptions: {
      treeshake: {
        preset: 'recommended',
      },
      output: {
        format: 'es',
        generatedCode: 'es2015',
        compact: true,
        manualChunks(id) {
          return vendorChunk(id) || undefined;
        },
      },
    },
  },
  server: {
    proxy: {
      '/api/docs': createProxyConfig(),
      '/api': createProxyConfig({
        rewrite: (path) => path.replace(/^\/api/, ''),
      }),
      '/settings': createProxyConfig(),
      '/user': createProxyConfig(),
      '/challenges': createProxyConfig({
        bypass: (req) => (req.headers.accept?.includes('text/html') ? req.url : null),
      }),
      '/uploads': createProxyConfig(),
    },
  },
});

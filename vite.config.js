import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BACKEND_TARGET = 'http://localhost:3000';
let lastBackendNoticeAt = 0;

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

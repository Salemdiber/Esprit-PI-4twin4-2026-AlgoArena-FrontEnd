import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const BACKEND_TARGET =
  (() => {
    const configuredTarget = process.env.VITE_BACKEND_TARGET;

    if (!configuredTarget) {
      return "http://127.0.0.1:3000";
    }

    try {
      const parsed = new URL(configuredTarget);
      const isLocalHost =
        parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
      if (isLocalHost && parsed.port && parsed.port !== "3000") {
        return "http://127.0.0.1:3000";
      }
      return parsed.origin + parsed.pathname.replace(/\/$/, "");
    } catch {
      return configuredTarget;
    }
  })();
let lastBackendNoticeAt = 0;

const vendorChunk = (id) => {
  if (id.includes("vite/preload-helper") || id.includes("commonjsHelpers")) {
    return "vendor-runtime";
  }

  if (!id.includes("/node_modules/")) return null;

  if (
    id.includes("/node_modules/react/") ||
    id.includes("/node_modules/react-dom/")
  ) {
    return "vendor-react";
  }

  if (
    id.includes("/node_modules/react-router/") ||
    id.includes("/node_modules/react-router-dom/")
  ) {
    return "vendor-router";
  }

  if (
    id.includes("/node_modules/framer-motion/") ||
    id.includes("/node_modules/motion-") ||
    id.includes("/node_modules/framesync/")
  ) {
    return "vendor-motion";
  }

  if (
    id.includes("/node_modules/@chakra-ui/")
  ) {
    return "vendor-ui-chakra";
  }

  if (id.includes("/node_modules/@emotion/")) {
    return "vendor-ui-emotion";
  }

  if (id.includes("/node_modules/@zag-js/")) {
    return "vendor-ui-zag";
  }

  if (
    id.includes("/node_modules/i18next/") ||
    id.includes("/node_modules/react-i18next/") ||
    id.includes("/node_modules/i18next-browser-languagedetector/") ||
    id.includes("/node_modules/i18next-http-backend/")
  ) {
    return "vendor-i18n";
  }

  if (
    id.includes("/node_modules/chart.js/") ||
    id.includes("/node_modules/react-chartjs-2/") ||
    id.includes("/node_modules/@kurkle/")
  ) {
    return "vendor-charts";
  }

  if (
    id.includes("/node_modules/@monaco-editor/") ||
    id.includes("/node_modules/monaco-editor/") ||
    id.includes("/node_modules/state-local/")
  ) {
    return "vendor-editor";
  }

  if (
    id.includes("/node_modules/exceljs/")
  ) {
    return "vendor-exceljs";
  }

  if (id.includes("/node_modules/xlsx/")) {
    return "vendor-xlsx";
  }

  if (id.includes("/node_modules/jszip/")) {
    return "vendor-zip";
  }

  if (
    id.includes("/node_modules/jspdf/") ||
    id.includes("/node_modules/jspdf-autotable/")
  ) {
    return "vendor-pdf-jspdf";
  }

  if (
    id.includes("/node_modules/canvg/") ||
    id.includes("/node_modules/svg-pathdata/") ||
    id.includes("/node_modules/rgbcolor/")
  ) {
    return "vendor-pdf-svg";
  }

  if (
    id.includes("/node_modules/html2canvas/") ||
    id.includes("/node_modules/stackblur-canvas/")
  ) {
    return "vendor-canvas-html";
  }

  if (
    id.includes("/node_modules/pako/") ||
    id.includes("/node_modules/fflate/") ||
    id.includes("/node_modules/fast-png/") ||
    id.includes("/node_modules/iobuffer/")
  ) {
    return "vendor-compression";
  }

  if (id.includes("/node_modules/terser/")) return "vendor-minifier";

  if (
    id.includes("/node_modules/lucide-react/") ||
    id.includes("/node_modules/react-icons/")
  ) {
    return "vendor-icons";
  }

  if (
    id.includes("/node_modules/@dicebear/") ||
    id.includes("/node_modules/@fontsource/")
  ) {
    return "vendor-avatars";
  }

  return undefined;
};

const createProxyConfig = (pathOptions = {}) => ({
  target: BACKEND_TARGET,
  changeOrigin: true,
  ...pathOptions,
  configure: (proxyServer) => {
    proxyServer.on("error", (_error, req, res) => {
      const now = Date.now();
      if (now - lastBackendNoticeAt > 10000) {
        // Single clean notice while backend is booting; avoid noisy ECONNREFUSED flood.
        console.log(`[vite] waiting for backend on ${BACKEND_TARGET}...`);
        lastBackendNoticeAt = now;
      }

      if (!res || res.headersSent) return;
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          statusCode: 503,
          message: "Backend is starting. Please wait a moment...",
          path: req?.url || "",
        }),
      );
    });
  },
});

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "script-defer",
      includeAssets: ["logo_algoarena.png", "assets/cursors/cursor.svg"],
      manifest: {
        name: "AlgoArena",
        short_name: "AlgoArena",
        description:
          "Algorithm battles, challenges, leaderboards, and developer practice.",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/logo_algoarena.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "algoarena-pages",
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === "script" ||
              request.destination === "style",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "algoarena-static",
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 7 * 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "algoarena-images",
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "font",
            handler: "CacheFirst",
            options: {
              cacheName: "algoarena-fonts",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 365 * 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: ({ url }) =>
              ["/settings", "/challenges", "/battles", "/leaderboard"].some(
                (path) => url.pathname.startsWith(path),
              ),
            handler: "NetworkFirst",
            options: {
              cacheName: "algoarena-api",
              networkTimeoutSeconds: 2,
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60,
              },
            },
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
    exclude: ["monaco-editor", "@monaco-editor/react"],
  },
  build: {
    target: "esnext",
    minify: "terser",
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
          "console.log",
          "console.warn",
          "console.info",
          "console.debug",
          "console.error",
        ],
        passes: 3,
        unsafe: true,
      },
      mangle: true,
    },
    rollupOptions: {
      treeshake: {
        preset: "recommended",
      },
      output: {
        format: "es",
        generatedCode: "es2015",
        compact: true,
        manualChunks(id) {
          return vendorChunk(id) || undefined;
        },
      },
    },
  },
  server: {
    proxy: {
      "/api/docs": createProxyConfig(),
      "/api": createProxyConfig(),
      "/auth/login": createProxyConfig(),
      "/auth/google": createProxyConfig(),
      "/auth/google/callback": createProxyConfig(),
      "/auth/github": createProxyConfig(),
      "/auth/github/callback": createProxyConfig(),
      "/auth/register": createProxyConfig(),
      "/auth/refresh": createProxyConfig(),
      "/auth/logout": createProxyConfig(),
      "/auth/check-availability": createProxyConfig(),
      "/auth/forgot-password": createProxyConfig(),
      "/auth/verify-reset-code": createProxyConfig(),
      "/auth/reset-password": createProxyConfig(),
      "/settings": createProxyConfig(),
      "/user": createProxyConfig(),
      "/challenges": createProxyConfig({
        bypass: (req) =>
          req.headers.accept?.includes("text/html") ? req.url : null,
      }),
      "/uploads": createProxyConfig(),
    },
  },
  preview: {
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "same-origin",
      "X-XSS-Protection": "1; mode=block",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' http: https: ws: wss:; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    },
    proxy: {
      "/api/docs": createProxyConfig(),
      "/api": createProxyConfig(),
      "/auth/login": createProxyConfig(),
      "/auth/google": createProxyConfig(),
      "/auth/google/callback": createProxyConfig(),
      "/auth/github": createProxyConfig(),
      "/auth/github/callback": createProxyConfig(),
      "/auth/register": createProxyConfig(),
      "/auth/refresh": createProxyConfig(),
      "/auth/logout": createProxyConfig(),
      "/auth/check-availability": createProxyConfig(),
      "/auth/forgot-password": createProxyConfig(),
      "/auth/verify-reset-code": createProxyConfig(),
      "/auth/reset-password": createProxyConfig(),
      "/settings": createProxyConfig(),
      "/user": createProxyConfig(),
      "/challenges": createProxyConfig({
        bypass: (req) =>
          req.headers.accept?.includes("text/html") ? req.url : null,
      }),
      "/uploads": createProxyConfig(),
    },
  },
});

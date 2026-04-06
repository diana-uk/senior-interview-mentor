import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // Manifest is managed via public/manifest.json + index.html link tag
      manifest: false,
      workbox: {
        // Pre-cache all build output
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            // Fonts from Google CDN — CacheFirst (immutable)
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-v1',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // JS/CSS build chunks — CacheFirst (content-hashed, immutable)
            urlPattern: /\/assets\/.+\.(js|css)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'build-assets-v1',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Chat / AI API — NetworkFirst (no offline AI fallback)
            urlPattern: /\/api\//i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-v1',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 10, maxAgeSeconds: 60 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // Long timeout for SSE — Claude CLI can take a while to respond
        timeout: 300_000,
        proxyTimeout: 300_000,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-monaco': ['@monaco-editor/react'],
          'vendor-icons': ['lucide-react'],
          'vendor-katex': ['katex', 'rehype-katex', 'remark-math'],
          'vendor-reactflow': ['@xyflow/react'],
        },
      },
    },
  },
})

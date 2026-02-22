import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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

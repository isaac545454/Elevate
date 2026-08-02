import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
}

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'mfe_react',
      filename: 'remoteEntry.js',
      exposes: {
        './Card': {
          import: './src/bootstrap.tsx',
          dontAppendStylesToHead: true,
        },
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0', version: '18.3.1' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0', version: '18.3.1' },
        'react-dom/client': { singleton: true, requiredVersion: '^18.0.0', version: '18.3.1' },
        'react/jsx-runtime': { singleton: true, requiredVersion: '^18.0.0', version: '18.3.1' },
      },
    }),
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  server: {
    port: 5002,
    strictPort: true,
    cors: true,
    headers: noCacheHeaders,
  },
  preview: {
    port: 5002,
    strictPort: true,
    cors: true,
    headers: noCacheHeaders,
  },
})

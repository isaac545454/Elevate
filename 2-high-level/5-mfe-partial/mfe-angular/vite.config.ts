import { defineConfig } from 'vite'
import federation from '@originjs/vite-plugin-federation'

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
}

export default defineConfig({
  plugins: [
    federation({
      name: 'mfe_angular',
      filename: 'remoteEntry.js',
      exposes: {
        './Card': {
          import: './src/bootstrap.ts',
          dontAppendStylesToHead: true,
        },
      },
    }),
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  server: {
    port: 5003,
    strictPort: true,
    cors: true,
    headers: noCacheHeaders,
  },
  preview: {
    port: 5003,
    strictPort: true,
    cors: true,
    headers: noCacheHeaders,
  },
})

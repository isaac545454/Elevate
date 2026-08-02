import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
}

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'mfe_vue',
      filename: 'remoteEntry.js',
      exposes: {
        './Card': {
          import: './src/bootstrap.ts',
          dontAppendStylesToHead: true,
        },
      },
      shared: {
        vue: { singleton: true, requiredVersion: '^3.0.0' },
      },
    }),
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  server: {
    port: 5001,
    strictPort: true,
    cors: true,
    headers: noCacheHeaders,
  },
  preview: {
    port: 5001,
    strictPort: true,
    cors: true,
    headers: noCacheHeaders,
  },
})

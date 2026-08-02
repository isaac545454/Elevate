import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      federation({
        name: 'shell',
        remotes: {
          mfe_vue: env.VITE_MFE_VUE_URL || 'http://localhost:5001/assets/remoteEntry.js',
          mfe_react: env.VITE_MFE_REACT_URL || 'http://localhost:5002/assets/remoteEntry.js',
          mfe_angular: env.VITE_MFE_ANGULAR_URL || 'http://localhost:5003/assets/remoteEntry.js',
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
      host: '127.0.0.1',
      port: 5000,
      strictPort: true,
      cors: true,
      headers: noCacheHeaders,
      fs: {
        allow: [repoRoot],
      },
    },
    preview: {
      host: '127.0.0.1',
      port: 5000,
      strictPort: true,
      cors: true,
      headers: noCacheHeaders,
    },
  }
})

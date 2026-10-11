import path from 'node:path'
import http from 'node:http'
import https from 'node:https'
import { URL } from 'node:url'
import { fileURLToPath } from 'node:url'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
}

const PROXY_MAP: [string, string][] = [
  ['/__proxy/pokeapi', 'https://pokeapi.co'],
  ['/__proxy/jsonplaceholder', 'https://jsonplaceholder.typicode.com'],
  ['/__proxy/rick', 'https://rickandmortyapi.com'],
  ['/__proxy/picsum', 'https://picsum.photos'],
  ['/__proxy/ghraw', 'https://raw.githubusercontent.com'],
  ['/__proxy/fonts', 'https://fonts.googleapis.com'],
  ['/__proxy/gstatic', 'https://fonts.gstatic.com'],
]

function mapProxyUrl(reqUrl: string): string | null {
  const hit = PROXY_MAP.find(
    ([prefix]) =>
      reqUrl === prefix || reqUrl.startsWith(`${prefix}/`) || reqUrl.startsWith(`${prefix}?`),
  )
  if (!hit) return null
  return hit[1] + reqUrl.slice(hit[0].length)
}

function followGet(
  targetUrl: string,
  hops = 0,
): Promise<{ status: number; headers: http.IncomingHttpHeaders; stream: IncomingMessage }> {
  return new Promise((resolve, reject) => {
    if (hops > 8) {
      reject(new Error('too many redirects'))
      return
    }
    const u = new URL(targetUrl)
    const lib = u.protocol === 'http:' ? http : https
    const req = lib.request(
      {
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port || undefined,
        path: `${u.pathname}${u.search}`,
        method: 'GET',
        headers: {
          'User-Agent': 'ElevateNativeProxy/1.0',
          Accept: '*/*',
          'Accept-Encoding': 'identity',
        },
        rejectUnauthorized: false,
        agent: u.protocol === 'https:' ? new https.Agent({ rejectUnauthorized: false }) : undefined,
      },
      (res) => {
        const code = res.statusCode ?? 500
        const loc = res.headers.location
        if (code >= 300 && code < 400 && loc) {
          res.resume()
          resolve(followGet(new URL(loc, u).href, hops + 1))
          return
        }
        resolve({ status: code, headers: res.headers, stream: res })
      },
    )
    req.on('error', reject)
    req.end()
  })
}

function collectBody(stream: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
  })
}

function nativeProxyPlugin(): Plugin {
  const handle = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const mapped = mapProxyUrl(req.url ?? '')
    if (!mapped) {
      next()
      return
    }
    void followGet(mapped)
      .then(async (upstream) => {
        // WKWebView recusa imagem HTTP chunked sem Content-Length (ícone [?]).
        const body = await collectBody(upstream.stream)
        res.statusCode = upstream.status
        const contentType = upstream.headers['content-type']
        if (contentType) res.setHeader('content-type', contentType)
        res.setHeader('content-length', String(body.length))
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Cache-Control', 'no-store')
        res.end(body)
      })
      .catch((err: unknown) => {
        res.statusCode = 502
        res.setHeader('content-type', 'text/plain')
        res.end(String(err))
      })
  }

  return {
    name: 'elevate-native-proxy',
    configureServer(server) {
      server.middlewares.use(handle)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handle)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      nativeProxyPlugin(),
      react(),
      federation({
        name: 'shell',
        remotes: {
          mfe_vue: env.VITE_MFE_VUE_URL || 'http://127.0.0.1:5001/assets/remoteEntry.js',
          mfe_react: env.VITE_MFE_REACT_URL || 'http://127.0.0.1:5002/assets/remoteEntry.js',
          mfe_angular: env.VITE_MFE_ANGULAR_URL || 'http://127.0.0.1:5003/assets/remoteEntry.js',
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

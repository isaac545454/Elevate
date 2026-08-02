import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, extname, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const port = Number(process.argv[2])
const cwd = process.cwd()

if (!port) {
  console.error('Uso: node scripts/start-remote.mjs <porta>')
  process.exit(1)
}

const dist = join(cwd, 'dist')
const remoteEntry = join(dist, 'assets/remoteEntry.js')
const viteBin = join(cwd, 'node_modules/vite/bin/vite.js')

const mime = {
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.map': 'application/json',
}

function runVite(args) {
  return spawn(process.execPath, [viteBin, ...args], {
    cwd,
    stdio: 'inherit',
    env: {
      ...process.env,
      CONSOLE_NINJA_DISABLE: '1',
      DISABLE_CONSOLE_NINJA: '1',
    },
  })
}

async function ensureBuild() {
  if (existsSync(remoteEntry)) return
  console.log(`[start-remote] build inicial (porta ${port})...`)
  const build = runVite(['build'])
  const code = await new Promise((resolve) => build.on('close', resolve))
  if (code !== 0) process.exit(code ?? 1)
}

function startStaticServer() {
  const server = createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
    const rel = urlPath === '/' ? '/index.html' : urlPath
    const file = normalize(join(dist, rel))

    if (!file.startsWith(dist)) {
      res.writeHead(403)
      res.end('Forbidden')
      return
    }

    try {
      if (!statSync(file).isFile()) throw new Error('not a file')
      const body = readFileSync(file)
      res.writeHead(200, {
        'Content-Type': mime[extname(file)] || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'no-store',
      })
      res.end(body)
    } catch {
      res.writeHead(404, { 'Access-Control-Allow-Origin': '*' })
      res.end('Not found')
    }
  })

  server.listen(port, '127.0.0.1', () => {
    console.log(
      `[start-remote] static remote em http://127.0.0.1:${port}/assets/remoteEntry.js`,
    )
  })

  return server
}

await ensureBuild()

if (!existsSync(remoteEntry)) {
  console.error(`[start-remote] missing ${remoteEntry}`)
  process.exit(1)
}

const server = startStaticServer()
const watch = runVite(['build', '--watch'])

function shutdown(code = 0) {
  watch.kill('SIGTERM')
  server.close()
  process.exit(code)
}

watch.on('close', (code) => {
  if (code && code !== 0) {
    console.error(`[start-remote] watch encerrou com código ${code}`)
  }
})
process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

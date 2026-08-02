import { spawn, execFile, execSync } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/**
 * High-level com Playwright e2e.
 * Pré-sobe os apps (sequencial) e o Playwright só reusa — senão 5 webServers
 * Turbopack/MFE sobem juntos e o macOS mata com SIGKILL.
 */
const projects = [
  {
    name: 'partial',
    dir: '2-high-level/5-mfe-partial',
    label: '5-mfe-partial',
    color: '94',
    uiPort: 8084,
    runner: ['npm', 'exec', '--', 'playwright'],
    appCmd: ['npm', 'run', 'dev'],
    readyPorts: [5000, 5001, 5002, 5003],
  },
  {
    name: 'mono',
    dir: '2-high-level/1-monolito',
    label: '1-monolito',
    color: '35',
    uiPort: 8080,
    readyPorts: [3010],
  },
  {
    name: 'mod',
    dir: '2-high-level/2-monolito-modular',
    label: '2-monolito-modular',
    color: '31',
    uiPort: 8081,
    readyPorts: [3020],
  },
  {
    name: 'repo',
    dir: '2-high-level/3-monolito-modular-monorepo/main-app',
    label: '3-monolito-modular-monorepo',
    color: '37',
    uiPort: 8082,
    readyPorts: [3030],
  },
  {
    name: 'mfe',
    dir: '2-high-level/4-mfe-routes',
    label: '4-mfe-routes',
    color: '90',
    uiPort: 8083,
    appCmd: ['pnpm', 'run', 'dev:stack'],
    readyPorts: [3000, 3001, 3002, 3003],
  },
]

const args = process.argv.slice(2)
const useUi =
  args.includes('--ui') ||
  args.includes('--UI') ||
  args.includes('-u')
const filters = args.filter((a) => !a.startsWith('-'))

const selected =
  filters.length === 0
    ? projects
    : projects.filter((p) => filters.includes(p.name))

if (selected.length === 0) {
  console.error(
    `Nenhum projeto encontrado. Use: ${projects.map((p) => p.name).join(', ')}`,
  )
  process.exit(1)
}

function freePorts(ports) {
  const killed = []
  for (const port of ports) {
    try {
      const pids = execSync(`lsof -tiTCP:${port} -sTCP:LISTEN`, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      })
        .trim()
        .split('\n')
        .filter(Boolean)
      if (pids.length === 0) continue
      execSync(`kill -9 ${pids.join(' ')}`, { stdio: 'ignore' })
      killed.push(port)
    } catch {
      // porta livre
    }
  }
  if (killed.length > 0) {
    console.log(`Portas liberadas: ${killed.join(', ')}`)
  }
}

execSync('node scripts/kill-ports.mjs', { cwd: root, stdio: 'inherit' })
freePorts(selected.map((p) => p.uiPort))

/** Cache Turbopack corrompido após kill -9 → "module factory is not available". */
const nextDirs = {
  mono: ['2-high-level/1-monolito/.next'],
  mod: ['2-high-level/2-monolito-modular/.next'],
  repo: ['2-high-level/3-monolito-modular-monorepo/main-app/.next'],
  mfe: [
    '2-high-level/4-mfe-routes/apps/home/.next',
    '2-high-level/4-mfe-routes/apps/jsonplaceholder/.next',
    '2-high-level/4-mfe-routes/apps/pokemon/.next',
    '2-high-level/4-mfe-routes/apps/rick-and-morty/.next',
  ],
}
for (const project of selected) {
  for (const rel of nextDirs[project.name] ?? []) {
    fs.rmSync(path.join(root, rel), { recursive: true, force: true })
  }
}
console.log('Caches .next limpos para:', selected.map((p) => p.name).join(', '))

if (selected.some((p) => p.name === 'repo')) {
  execSync('node scripts/link-e2e.mjs', {
    cwd: path.join(root, '2-high-level/3-monolito-modular-monorepo/main-app'),
    stdio: 'inherit',
  })
}

const env = { ...process.env }
for (const key of Object.keys(env)) {
  if (/^npm_config_/i.test(key) || key === 'PNPM_SCRIPT_SRC_DIR') {
    delete env[key]
  }
}
/** Apps sobem neste script; Playwright não deve disparar webServer. */
delete env.CI
env.E2E_EXTERNAL_SERVER = '1'
env.CONSOLE_NINJA_DISABLE = '1'
env.DISABLE_CONSOLE_NINJA = '1'
if (env.NODE_OPTIONS) {
  env.NODE_OPTIONS = env.NODE_OPTIONS
    .split(/\s+/)
    .filter((part) => !/console-ninja|wallabyjs/i.test(part))
    .join(' ')
}
if (useUi) {
  env.BROWSER = 'chrome'
  env.COPILOT_CLI = '1'
}

function waitForPort(port, timeoutMs = 180_000) {
  const start = Date.now()
  const hosts = ['127.0.0.1', '::1', 'localhost']

  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      let pending = hosts.length
      let resolved = false

      for (const host of hosts) {
        const socket = net.connect({ host, port }, () => {
          socket.end()
          if (!resolved) {
            resolved = true
            resolve()
          }
        })
        socket.on('error', () => {
          socket.destroy()
          pending -= 1
          if (pending > 0 || resolved) return
          if (Date.now() - start >= timeoutMs) {
            reject(new Error(`Timeout aguardando porta ${port}`))
            return
          }
          setTimeout(tryConnect, 400)
        })
      }
    }
    tryConnect()
  })
}

function pipePrefixed(stream, prefix) {
  let buf = ''
  stream.on('data', (chunk) => {
    buf += chunk.toString()
    const lines = buf.split('\n')
    buf = lines.pop() ?? ''
    for (const line of lines) process.stdout.write(`${prefix}${line}\n`)
  })
  stream.on('end', () => {
    if (buf) process.stdout.write(`${prefix}${buf}\n`)
  })
}

function startAppServer(project) {
  const cwd = path.join(root, project.dir)
  const prefix = `\x1b[${project.color}m[${project.name}:app]\x1b[0m `
  const [command, ...args] = project.appCmd ?? ['pnpm', 'run', 'dev']

  console.log(`${prefix}subindo ${command} ${args.join(' ')}`)

  const child = spawn(command, args, {
    cwd,
    env,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  pipePrefixed(child.stdout, prefix)
  pipePrefixed(child.stderr, prefix)

  child.on('exit', (code, signal) => {
    console.log(
      `${prefix}exited ${signal ? `signal ${signal}` : `code ${code ?? 0}`}`,
    )
  })

  return child
}

/**
 * UI Mode exige ?ws=<token> (redirect de `/`). Abrir `/trace/uiMode.html`
 * sem o query param deixa a sidebar em "Loading…" para sempre.
 */
function resolveUiModeUrl(baseUrl) {
  return new Promise((resolve) => {
    const req = http.get(baseUrl, (res) => {
      const loc = res.headers.location
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && loc) {
        resolve(new URL(loc, baseUrl).href)
        return
      }
      resolve(baseUrl)
    })
    req.on('error', () => resolve(baseUrl))
    req.setTimeout(3000, () => {
      req.destroy()
      resolve(baseUrl)
    })
  })
}

function openInChrome(url) {
  execFile('open', ['-a', 'Google Chrome', url], (err) => {
    if (err) {
      console.error(
        `Não abriu o Chrome em ${url}. Abra a URL impressa no Chrome (não no Safari; não use /trace/uiMode.html sem ?ws=).`,
      )
    }
  })
}

function startPlaywright(project) {
  const cwd = path.join(root, project.dir)
  const prefix = `\x1b[${project.color}m[${project.name}]\x1b[0m `
  const url = `http://127.0.0.1:${project.uiPort}`
  const runner = project.runner ?? ['pnpm', 'exec', 'playwright']

  const cmd = useUi
    ? [
        ...runner,
        'test',
        '--ui',
        `--ui-port=${project.uiPort}`,
        '--ui-host=127.0.0.1',
        ...(project.playwrightArgs ?? []),
      ]
    : [...runner, 'test', ...(project.playwrightArgs ?? [])]

  console.log(
    useUi
      ? `${prefix}${project.label} → ${url}`
      : `${prefix}playwright test`,
  )

  const child = spawn(cmd[0], cmd.slice(1), {
    cwd,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  let opened = false
  const maybeOpen = (chunk) => {
    if (!useUi || opened) return
    if (String(chunk).includes('Listening on')) {
      opened = true
      // Segue o 302 para incluir ?ws=… — sem isso a UI fica em Loading…
      resolveUiModeUrl(url).then((fullUrl) => {
        console.log(`${prefix}UI Mode: ${fullUrl}`)
        openInChrome(fullUrl)
      })
    }
  }

  const pipe = (stream) => {
    let buf = ''
    stream.on('data', (chunk) => {
      maybeOpen(chunk)
      buf += chunk.toString()
      const lines = buf.split('\n')
      buf = lines.pop() ?? ''
      for (const line of lines) process.stdout.write(`${prefix}${line}\n`)
    })
    stream.on('end', () => {
      if (buf) process.stdout.write(`${prefix}${buf}\n`)
    })
  }

  pipe(child.stdout)
  pipe(child.stderr)

  child.on('exit', (code, signal) => {
    console.log(
      `${prefix}exited ${signal ? `signal ${signal}` : `code ${code ?? 0}`}`,
    )
  })

  return child
}

const appChildren = []

console.log('\nPré-subindo apps (sequencial, evita OOM dos webServers paralelos)...\n')

for (const project of selected) {
  const child = startAppServer(project)
  appChildren.push(child)

  try {
    await Promise.all(
      project.readyPorts.map((port) => waitForPort(port)),
    )
    console.log(
      `\x1b[${project.color}m[${project.name}:app]\x1b[0m pronto (${project.readyPorts.join(', ')})`,
    )
  } catch (error) {
    console.error(
      `\x1b[${project.color}m[${project.name}:app]\x1b[0m ${error.message}`,
    )
    for (const c of appChildren) {
      if (!c.killed) c.kill('SIGTERM')
    }
    process.exit(1)
  }
}

if (useUi) {
  console.log('\nE2E UI (high) — apps prontos; Playwright reusa (sem webServer):')
  console.log('  Abra a raiz (com ?ws=…) no Chrome — /trace/uiMode.html sem token = Loading eterno.')
  for (const p of selected) {
    console.log(`  http://127.0.0.1:${p.uiPort}/  →  ${p.label}`)
  }
  console.log('')
} else {
  console.log(
    `\nE2E (high) — ${selected.map((p) => p.name).join(', ')}\n`,
  )
}

const children = selected.map((project) => startPlaywright(project))

const shutdown = () => {
  for (const child of [...children, ...appChildren]) {
    if (!child.killed) child.kill('SIGTERM')
  }
  try {
    execSync('node scripts/kill-ports.mjs', { cwd: root, stdio: 'ignore' })
    freePorts(selected.map((p) => p.uiPort))
  } catch {
    // best-effort
  }
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

const codes = await Promise.all(
  children.map(
    (child) =>
      new Promise((resolve) => {
        child.on('exit', (code, signal) => {
          resolve(code ?? (signal ? 1 : 0))
        })
      }),
  ),
)

shutdown()

const failed = codes.filter((c) => c !== 0).length
if (failed > 0) {
  console.error(`\n${failed} projeto(s) falharam.`)
  process.exit(1)
}

console.log('\nTodos os e2e passaram.')

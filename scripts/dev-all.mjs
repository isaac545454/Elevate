import { spawn, execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import net from 'node:net'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

execSync('node scripts/kill-ports.mjs', { cwd: root, stdio: 'inherit' })

const projects = [
  {
    name: 'partial',
    dir: '2-high-level/5-mfe-partial',
    color: '94',
    cmd: ['npm', 'run', 'dev'],
  },
  { name: 'arch', dir: '1-low-level/1-arch-react-layer', color: '36' },
  { name: 'mvvm', dir: '1-low-level/2-mvvm', color: '36' },
  { name: 'cp', dir: '1-low-level/3-container-presentation', color: '32' },
  { name: 'fsd', dir: '1-low-level/4-feature-sliced', color: '33' },
  { name: 'mono', dir: '2-high-level/1-monolito', color: '35' },
  { name: 'mod', dir: '2-high-level/2-monolito-modular', color: '31' },
  { name: 'repo', dir: '2-high-level/3-monolito-modular-monorepo', color: '37' },
  { name: 'mfe', dir: '2-high-level/4-mfe-routes', color: '90' },
]

const env = { ...process.env }
for (const key of Object.keys(env)) {
  if (/^npm_config_/i.test(key) || key === 'PNPM_SCRIPT_SRC_DIR') {
    delete env[key]
  }
}

function waitForPort(port, timeoutMs = 120_000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = net.connect({ host: '127.0.0.1', port }, () => {
        socket.end()
        resolve()
      })
      socket.on('error', () => {
        socket.destroy()
        if (Date.now() - start >= timeoutMs) {
          reject(new Error(`Timeout aguardando porta ${port}`))
          return
        }
        setTimeout(tryConnect, 500)
      })
    }
    tryConnect()
  })
}

function startProject(project) {
  const cwd = path.join(root, project.dir)
  const [command, ...args] = project.cmd ?? ['pnpm', 'run', 'dev']
  const child = spawn(command, args, {
    cwd,
    env,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  const prefix = `\x1b[${project.color}m[${project.name}]\x1b[0m `
  const pipe = (stream) => {
    let buf = ''
    stream.on('data', (chunk) => {
      buf += chunk.toString()
      const lines = buf.split('\n')
      buf = lines.pop() ?? ''
      for (const line of lines) {
        process.stdout.write(`${prefix}${line}\n`)
      }
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

const children = []

// sobe o MFE partial primeiro (remotes + shell), depois o resto
const [partial, ...rest] = projects
children.push(startProject(partial))

console.log(
  '\x1b[94m[partial]\x1b[0m aguardando remotes (5001–5003) antes de subir os outros...',
)

try {
  await Promise.all([
    waitForPort(5001),
    waitForPort(5002),
    waitForPort(5003),
  ])
  console.log('\x1b[94m[partial]\x1b[0m remotes ok — subindo os demais projetos')
} catch (error) {
  console.error(`\x1b[94m[partial]\x1b[0m ${error.message}`)
  console.error(
    '\x1b[94m[partial]\x1b[0m continuando mesmo assim; o shell pode falhar',
  )
}

for (const project of rest) {
  children.push(startProject(project))
}

const shutdown = () => {
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM')
  }
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

await Promise.all(
  children.map(
    (child) =>
      new Promise((resolve) => {
        child.on('exit', resolve)
      }),
  ),
)

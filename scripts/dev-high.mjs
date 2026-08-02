import { spawn, execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import net from 'node:net'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const projects = [
  {
    name: 'partial',
    dir: '2-high-level/5-mfe-partial',
    color: '94',
    cmd: ['npm', 'run', 'dev'],
    readyPorts: [5000, 5001, 5002, 5003],
  },
  {
    name: 'mono',
    dir: '2-high-level/1-monolito',
    color: '35',
    readyPorts: [3010],
  },
  {
    name: 'mod',
    dir: '2-high-level/2-monolito-modular',
    color: '31',
    readyPorts: [3020],
  },
  {
    name: 'repo',
    dir: '2-high-level/3-monolito-modular-monorepo',
    color: '37',
    readyPorts: [3030],
  },
  {
    name: 'mfe',
    dir: '2-high-level/4-mfe-routes',
    color: '90',
    readyPorts: [3000, 3001, 3002, 3003],
  },
]

execSync('node scripts/kill-ports.mjs', { cwd: root, stdio: 'inherit' })

const env = { ...process.env }
for (const key of Object.keys(env)) {
  if (/^npm_config_/i.test(key) || key === 'PNPM_SCRIPT_SRC_DIR') {
    delete env[key]
  }
}
env.CONSOLE_NINJA_DISABLE = '1'
env.DISABLE_CONSOLE_NINJA = '1'

function waitForPort(port, timeoutMs = 180_000) {
  const start = Date.now()
  const hosts = ['127.0.0.1', '::1']

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

const children = []
const [partial, ...rest] = projects

console.log('\x1b[94m[partial]\x1b[0m subindo 5-mfe-partial primeiro...')
children.push(startProject(partial))

try {
  await Promise.all(partial.readyPorts.map((p) => waitForPort(p)))
  console.log('\x1b[94m[partial]\x1b[0m pronto — subindo 1–4')
} catch (error) {
  console.error(`\x1b[94m[partial]\x1b[0m ${error.message}`)
  console.error('\x1b[94m[partial]\x1b[0m subindo os demais mesmo assim')
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
    (child) => new Promise((resolve) => child.on('exit', resolve)),
  ),
)

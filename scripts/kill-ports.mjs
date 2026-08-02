import { execSync } from 'node:child_process'

const ports = [
  // low-level (vite)
  5173, 5174, 5175, 5176,
  // high-level next / mfe
  3000, 3001, 3002, 3003,
  3010, 3020, 3030,
  // mfe-partial
  5000, 5001, 5002, 5003, 5004, 5005, 5006, 5007, 5008, 5009, 5010,
]

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

console.log(
  killed.length > 0
    ? `Portas liberadas: ${killed.join(', ')}`
    : 'Nenhuma porta em uso.',
)

import { execSync } from 'node:child_process'

const ports = Array.from({ length: 11 }, (_, i) => 5000 + i)

for (const port of ports) {
  try {
    execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null`, { stdio: 'ignore', shell: true })
  } catch {
    // porta livre
  }
}

console.log(`Portas liberadas: ${ports.join(', ')}`)

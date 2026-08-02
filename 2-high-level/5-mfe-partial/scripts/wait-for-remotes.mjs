import { spawn } from 'node:child_process'

const maxAttempts = 120
const delayMs = 1000

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  try {
    const result = spawn('node', ['scripts/verify-remotes.mjs'], {
      stdio: 'inherit',
    })
    const code = await new Promise((resolve) => result.on('close', resolve))

    if (code === 0) {
      process.exit(0)
    }
  } catch {
    // tenta novamente
  }

  console.log(`Aguardando remotes... (${attempt}/${maxAttempts})`)
  await sleep(delayMs)
}

console.error('Timeout: remotes não ficaram prontos a tempo')
process.exit(1)

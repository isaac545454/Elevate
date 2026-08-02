const remotes = [
  { port: 5001, expose: './Card', name: 'JSONPlaceholder (Vue)' },
  { port: 5002, expose: './Card', name: 'Pokémon (React)' },
  { port: 5003, expose: './Card', name: 'Rick and Morty (Angular)' },
]

async function verify() {
  const errors = []

  for (const { port, expose, name } of remotes) {
    const url = `http://127.0.0.1:${port}/assets/remoteEntry.js`

    try {
      const res = await fetch(url)
      if (!res.ok) {
        errors.push(`${name} (porta ${port}): HTTP ${res.status}`)
        continue
      }

      const body = await res.text()
      if (!body.includes(expose)) {
        errors.push(`${name} (porta ${port}): esperado ${expose}, mas o remoteEntry não contém esse módulo`)
      }
    } catch {
      errors.push(`${name} (porta ${port}): não acessível em ${url}`)
    }
  }

  if (errors.length > 0) {
    console.error('Remotes com problema:\n')
    errors.forEach((e) => console.error(`  ✗ ${e}`))
    console.error('\nExecute: npm run kill-ports && npm run dev')
    process.exit(1)
  }

  console.log('Todos os remotes estão corretos nas portas 5001–5003')
}

await verify()

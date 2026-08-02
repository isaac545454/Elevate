import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** Recria hardlinks em main-app/e2e → specs dos modules (UI Mode não trava). */
const mainApp = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const monorepo = path.join(mainApp, '..')

const links = [
  {
    dest: path.join(mainApp, 'e2e/home'),
    src: path.join(mainApp, 'src/app/tests-e2e'),
  },
  {
    dest: path.join(mainApp, 'e2e/jsonplaceholder'),
    src: path.join(monorepo, 'modules/jsonplaceholder/src/postlist/tests-e2e'),
  },
  {
    dest: path.join(mainApp, 'e2e/pokemon'),
    src: path.join(monorepo, 'modules/pokemon/src/pokemon-list/tests-e2e'),
  },
  {
    dest: path.join(mainApp, 'e2e/rick-and-morty'),
    src: path.join(
      monorepo,
      'modules/rick-and-morty/src/character-list/tests-e2e',
    ),
  },
]

for (const { dest, src } of links) {
  fs.rmSync(dest, { recursive: true, force: true })
  fs.mkdirSync(dest, { recursive: true })
  for (const name of fs.readdirSync(src)) {
    if (!name.endsWith('.ts')) continue
    fs.linkSync(path.join(src, name), path.join(dest, name))
  }
}

console.log('e2e hardlinks ok:', links.map((l) => path.basename(l.dest)).join(', '))

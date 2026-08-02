# MFE Platform (partial)

Demo de Micro Frontends com [vite-plugin-federation](https://github.com/originjs/vite-plugin-federation). O shell mantém a barra lateral; cada remote busca e exibe dados de uma API pública (mesmo padrão do `4-mfe-routes`).

## Estrutura

```
├── shared/          # event-bus + shadow-mount
├── mfe-shell/       # Host React — porta 5000
├── mfe-vue/         # JSONPlaceholder — porta 5001
├── mfe-react/       # Pokémon — porta 5002
└── mfe-angular/     # Rick and Morty — porta 5003
```

## Setup

```bash
npm install
npm run install:all
```

## Rodar tudo

```bash
npm run dev
```

Abra [http://localhost:5000](http://localhost:5000).

## Sidebar ↔ eventos

| Sidebar | Evento | Remote | API |
|---------|--------|--------|-----|
| JSONPlaceholder | `home-jsonplaceholder` | Vue `:5001` | jsonplaceholder.typicode.com |
| Pokémon | `home-pokemon` | React `:5002` | pokeapi.co |
| Rick and Morty | `home-rick` | Angular `:5003` | rickandmortyapi.com |

## E2E (Playwright)

Duas estratégias:

| Comando | Escopo |
|---------|--------|
| `npm run test:e2e:isolated` | Cada MFE na própria porta (`:5001` / `:5002` / `:5003`) |
| `npm run test:e2e:integrated` | Shell `:5000` + troca de remotes via event bus |
| `npm run test:e2e` | As duas estratégias |

## Spec

Ver [SPEC.md](./SPEC.md).

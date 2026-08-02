# Spec — Micro Frontends com Module Federation (Partial)

> **Objetivo:** shell com barra lateral que troca remotes via event bus; cada MFE apenas chama uma API pública e exibe o resultado (mesmo conteúdo conceitual do `4-mfe-routes`).

---

## 1. Visão geral

| Item | Decisão |
|------|---------|
| Arquitetura | Polyrepo local (pastas independentes) |
| Orquestração | App Shell carrega remotes em runtime |
| Bundler | Vite + `@originjs/vite-plugin-federation` |
| Comunicação | Event bus compartilhado (`shared/event-bus.ts`) |
| UI | Sidebar no shell + lista de dados por remote |

## 2. Estrutura

```
5-mfe-partial/
├── shared/          # event-bus + shadow-mount
├── mfe-shell/       # Host — React :5000
├── mfe-vue/         # JSONPlaceholder :5001
├── mfe-react/       # Pokémon :5002
└── mfe-angular/     # Rick and Morty :5003
```

## 3. Portas

| App | Porta | Conteúdo |
|-----|-------|----------|
| Shell | `5000` | Sidebar + slots Shadow DOM |
| Vue | `5001` | Posts JSONPlaceholder + Picsum |
| React | `5002` | Pokémon + sprites |
| Angular | `5003` | Personagens Rick and Morty |

## 4. Eventos de navegação

```ts
export type MfeEvents = {
  'home-jsonplaceholder': { mfeId: 'jsonplaceholder' }
  'home-pokemon': { mfeId: 'pokemon' }
  'home-rick': { mfeId: 'rick' }
}
```

O clique na sidebar chama `emitNavChange(mfeId)`, que emite o evento correspondente (`home-*`).

## 5. Dev local

```bash
npm run install:all
npm run dev
```

Os remotes rodam em build-watch + preview para expor `remoteEntry.js`. O shell sobe após `wait-for-remotes`.

## 6. E2E

Um único project no Playwright (o UI Mode só seleciona o 1º project por padrão). Cada spec define o `baseURL`:

| Spec | Alvo | O que valida |
|------|------|----------------|
| `mfe-vue` / `mfe-react` / `mfe-angular` | Páginas `:5001` / `:5002` / `:5003` | Cada MFE isolado (lista + paginação) |
| `mfe-shell` | Shell `:5000` | Sidebar → event bus (`home-*`) → troca de remote |

```bash
npm run test:e2e:isolated
npm run test:e2e:integrated
npm run test:e2e
```

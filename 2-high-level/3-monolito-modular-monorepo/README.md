# Monolito modular · monorepo (Turborepo)

Arquitetura do `2-monolito-modular`, enxuta: app shell + shared + modules.

## Estrutura

```
main-app/              # Next.js — shell + uma rota por módulo
shared/                # @repo/shared — UI e infra
modules/
  jsonplaceholder/     # @repo/jsonplaceholder
  pokemon/             # @repo/pokemon
  rick-and-morty/      # @repo/rick-and-morty
turbo.json
pnpm-workspace.yaml
```

Cada módulo monta a página. O app só declara a rota e reexporta:

```tsx
// main-app/src/app/pokemon/page.tsx
export { default } from "@repo/pokemon/page";
```

```
main-app/src/app/
  page.tsx                 # home
  jsonplaceholder/page.tsx
  pokemon/page.tsx
  rick-and-morty/page.tsx
```

## Dependências

```
main-app
  ├── @repo/shared
  ├── @repo/jsonplaceholder  → @repo/shared
  ├── @repo/pokemon          → @repo/shared
  └── @repo/rick-and-morty   → @repo/shared
```

## Scripts

```bash
pnpm install
pnpm dev      # :3030
pnpm build
pnpm test:e2e
```

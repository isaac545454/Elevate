---
name: react-modular-monorepo
description: >-
  Guides React/Next modular monorepo architecture: high-level like
  3-monolito-modular-monorepo (shell + shared + modules) and low-level like
  5-react-arch-based (api · service · query · model · view) inside each module.
  Use when scaffolding or refactoring React architecture, monorepos, modular
  monoliths, Turborepo/pnpm workspaces, domain modules, or when the user mentions
  React-modular-Monorepo, módulos desacoplados, monolito modular, api service
  query model view, or imports entre módulos. Enforces hard decoupling: modules
  must not import each other.
---

# React-modular-Monorepo

Two reference models, one architecture:

| Level | Reference | Responsibility |
|-------|-----------|----------------|
| **High** | `2-high-level/3-monolito-modular-monorepo` | App shell + shared + domain modules as packages |
| **Low** | `1-low-level/5-react-arch-based` | Inside each module: **api · service · query · model · view** |

Domain modules are installable packages. The shell wires them. Shared holds
generic UI and infra only. Code **inside** a module follows the 5-layer
pipeline — never mix layers or skip the DAG.

## Hard rules (non-negotiable)

1. **não pode ter import entre modulos, que os modulos devem ser desacoplados**
2. Modules depend **only** on `@repo/shared` (and their own relative code).
3. `@repo/shared` must **never** import a domain module.
4. Only the shell (`main-app`) may import domain modules — and only to compose
   routes / providers / layout.
5. Domain knowledge stays inside its module.
6. Inside a module, respect **api → service → query → model → view** (no upward
   or sideways skips: view never calls service/query/api directly).

If a change needs data or UI from another module, **do not import that module**.
Lift shared primitives into `@repo/shared`, or compose in the shell, or
communicate via URL/route ownership — never via cross-module imports.

## Workspace shape

```
<project>/
├── main-app/                 # shell (Next.js or equivalent)
├── shared/                   # @repo/shared — UI + infra only
├── modules/
│   ├── <domain-a>/           # @repo/<domain-a>
│   └── <domain-b>/           # @repo/<domain-b>
├── pnpm-workspace.yaml
└── turbo.json                # optional
```

`pnpm-workspace.yaml`:

```yaml
packages:
  - "main-app"
  - "shared"
  - "modules/*"
```

Package naming: `@repo/<slug>`. Exports without barrels:

```json
"exports": { "./*": "./src/*" }
```

## Dependency DAG

```
main-app
  ├── @repo/shared
  ├── @repo/<module-a>  → @repo/shared
  └── @repo/<module-b>  → @repo/shared
```

| From → To | Allowed? |
|-----------|----------|
| shell → shared | ✅ |
| shell → module | ✅ (composition only) |
| module → shared | ✅ |
| module → module | ❌ |
| shared → module | ❌ |

Enforce in `package.json` (module deps list only `@repo/shared`) and in
tsconfig paths (each module resolves itself + shared, never siblings). Prefer
also adding ESLint `no-restricted-imports` / boundaries so cross-module imports
fail in CI.

## Composition (shell)

- Shell owns routing, root layout, global CSS/tokens, and providers
  (`createQueryClient` from shared).
- Each module owns its page entry (`src/page.tsx`) and the full low-level
  pipeline for its features.
- Shell declares one thin re-export per route:

```tsx
// main-app/src/app/pokemon/page.tsx
export { default } from "@repo/pokemon/page";
```

- Home/hub pages link by URL; they do **not** import domain packages unless
  composing intentionally at the shell boundary.

## Low-level inside each module (`5-react-arch-based`)

Slogan: **api · service · query · model · view**

| Layer | Where | Role | React? | RQ? |
|-------|-------|------|--------|-----|
| **API** | `api/` | baseURL, headers, errors (`createApi`) | No | No |
| **Service** | `services/<name>/` | HTTP + map DTO → domain | No | No |
| **Query** | `queries/useX/` | `queryKey` + `useQuery` → service | Hook | Yes |
| **Model** | `pages/X/useXModel.ts` | Consumes query; view-model shape | Hook | Via query |
| **View** | `pages/X/page.tsx` | Calls model; JSX only | Yes | No |
| **Types** | `types/` | Domain + API DTOs | — | — |
| **Components** | `components/` | Dumb UI (props in) | Yes | No |

### Module folder layout

```
modules/<domain>/src/
├── page.tsx                 # module entry (compose page views + shared nav)
├── api/                     # or use @repo/shared http client + thin wrappers
├── services/
│   └── <name>Service/<name>Service.ts
├── queries/
│   └── useX/useX.ts
├── pages/
│   └── XxxPage/
│       ├── page.tsx         # View
│       ├── page.types.ts    # XxxPageModel contract
│       └── useXxxModel.ts   # Model hook
├── components/              # module-local dumb UI (optional)
├── types/
└── tests-e2e/               # Playwright owned by the module
```

Prefer **folder-per-unit** naming (`postService/postService.ts`,
`usePosts/usePosts.ts`, `PostsPage/…`).

Shared http/query factories live in `@repo/shared`; domain API wrappers,
services, queries, models, and views stay in the module.

### Low-level dependency DAG (inside one module)

```
View → Model → Query → Service → API
View → components, types
Model → queries, page.types, types
Query → services
Service → api, types
API → (no domain)
components → props only (no fetch)
```

**Forbidden inside a module:**

- View → service / query / api
- Model → JSX
- Query → pages / components
- Service → React / React Query
- API → services / pages
- Components → data fetching

### Layer responsibilities (from `5-react-arch-based`)

- **API:** setup da requisição (baseURL, headers, tratamento de erro).
- **Service:** consome a API — só HTTP + mapeamento de resposta. If mapping
  grows large, extract `map/` next to the service — still no React.
- **Query:** estado da request (cache, loading, error, refetch).
- **Model:** consome a query, aplica regras e prepara o shape que a view precisa.
- **View:** chama o model hook e só renderiza UI. Não conhece service nem
  React Query.

### Snippets

```ts
// Query
export function usePostsList(limit = 8) {
  return useQuery({
    queryKey: postsKeys.list(limit),
    queryFn: () => listPosts(limit),
  });
}

// Model
export function usePostsModel(): PostsPageModel {
  const query = usePostsList(8);
  return {
    posts: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    onReload: () => { void query.refetch(); },
  };
}

// View
export function PostsPage() {
  const { posts, loading, error, onReload } = usePostsModel();
  return (/* JSX only */);
}
```

- React / Next / TanStack Query are **peerDependencies** on modules; the shell
  installs concrete versions and `transpilePackages` the `@repo/*` packages.
- E2E lives in the module; the shell may link specs into its Playwright tree.

## Allowed vs forbidden

### Allowed

```ts
// shell → module page
export { default } from "@repo/pokemon/page";

// shell → shared
import { createQueryClient } from "@repo/shared/lib/query/createQueryClient";

// module → shared
import { httpClient } from "@repo/shared/lib/http/httpClient";

// module low-level pipeline
// view → model → query → service → api (same module only)
```

### Forbidden

```ts
// module → module (FORBIDDEN)
import { listPokemonPage } from "@repo/pokemon/...";

// shared → module (FORBIDDEN)
import { PokemonList } from "@repo/pokemon/...";

// module package.json depending on another domain (FORBIDDEN)
{ "dependencies": { "@repo/pokemon": "workspace:*" } }

// view → service / query (FORBIDDEN — skip model)
import { listPosts } from "../services/postService/postService";
import { usePostsList } from "../queries/usePosts/usePosts";
```

## Checklist before shipping architecture changes

**High-level**
- [ ] New domain lives under `modules/<slug>` as `@repo/<slug>`
- [ ] Module `package.json` depends only on `@repo/shared` (+ peers)
- [ ] No `@repo/<other-module>` imports under `modules/` or `shared/`
- [ ] Shell route is a one-line re-export of `@repo/<slug>/page`
- [ ] Shared code has zero domain knowledge

**Low-level (inside the module)**
- [ ] Feature uses api → service → query → model → view
- [ ] View only calls the model hook + dumb components
- [ ] `page.types.ts` defines the model contract
- [ ] Model has no JSX; query owns keys + `queryFn` → service
- [ ] Service has no React / RQ; API has no domain rules
- [ ] E2E stays in the owning module

## When refactoring toward this model

1. Identify domain boundaries (one package per product area).
2. Extract generic UI/infra to `@repo/shared`.
3. Move domain code into `modules/<slug>`; fix imports to shared/relative only.
4. Reshape each feature to **api · service · query · model · view**.
5. Wire shell routes as re-exports.
6. Delete any leftover cross-module imports — **não pode ter import entre modulos, que os modulos devem ser desacoplados**.
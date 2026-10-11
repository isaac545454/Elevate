# Elevate

Material do Elevate TLC. A mesma ideia de produto — posts, Pokémon, Rick and Morty — reaparece em arquiteturas diferentes: do componente React até monolito modular, microfrontend e um shell nativo.

Três trilhas:

| Pasta | O que é |
| --- | --- |
| [`1-low-level`](./1-low-level) | Padrões de UI em apps Vite isolados |
| [`2-high-level`](./2-high-level) | Mesmos domínios, do Next monolítico ao MFE e ao iOS |
| [`3-AI-final`](./3-AI-final) | Agent skills. Sem app |

## Rodar da raiz

Node 20+. Low-level e a maioria do high-level usam **pnpm**. O `5-mfe-partial` usa **npm**. O `6-kmp` precisa de **JDK 21** (sem Kotlin CLI).

```bash
npm run dev        # high-level (Next + os dois MFEs)
npm run dev:all    # low-level 1–4 + high-level, menos 5-react-arch-based e 6-kmp
npm run e2e        # Playwright dos high-level que têm spec
npm run e2e:ui     # mesmo, com UI do Playwright
npm run kill-ports # libera 3000–3030, 5000–5010 e 5173–5176
```

`dev` e `dev:all` matam essas portas antes de subir. Cada projeto também roda sozinho: `pnpm install && pnpm dev` na pasta (no partial, `npm install && npm run dev`).

Filtro do e2e: `npm run e2e -- partial` (nomes: `partial`, `mono`, `mod`, `repo`, `mfe`).

## Low-level

Vite + React. Cada um é um app pequeno para um padrão.

| Projeto | Padrão | Porta |
| --- | --- | --- |
| [1-arch-react-layer](./1-low-level/1-arch-react-layer) | Page → hook → service. Page não faz fetch; service não conhece React | [5173](http://localhost:5173) |
| [2-mvvm](./1-low-level/2-mvvm) | `page.model` + `page.view` por tela | [5174](http://localhost:5174) |
| [3-container-presentation](./1-low-level/3-container-presentation) | Container busca; presentation só renderiza | [5175](http://localhost:5175) |
| [4-feature-sliced](./1-low-level/4-feature-sliced) | FSD num fluxo de auth. Feature exporta a rota; `app` só agrega | [5176](http://localhost:5176) |
| [5-react-arch-based](./1-low-level/5-react-arch-based) | `api` → `service` → `query` → `model` → `view`. Fora do `dev:all` | [5177](http://localhost:5177) |

## High-level

Os três domínios (JSONPlaceholder, PokéAPI, Rick and Morty) sobem juntos. A diferença é o corte do código.

| Projeto | Corte | URL |
| --- | --- | --- |
| [1-monolito](./2-high-level/1-monolito) | Um Next. Rotas no mesmo app | [3010](http://localhost:3010) |
| [2-monolito-modular](./2-high-level/2-monolito-modular) | Módulos dentro de um Next | [3020](http://localhost:3020) |
| [3-monolito-modular-monorepo](./2-high-level/3-monolito-modular-monorepo) | Turborepo: shell + `shared` + um pacote por domínio. Módulos não se importam | [3030](http://localhost:3030) |
| [4-mfe-routes](./2-high-level/4-mfe-routes) | Quatro apps Next. Home em 3000; domínios em 3001–3003 | [3000](http://localhost:3000) |
| [5-mfe-partial](./2-high-level/5-mfe-partial) | Shell React + remotes Vue, React e Angular (vite-plugin-federation) | [5000](http://localhost:5000) |
| [6-kmp](./2-high-level/6-kmp) | Kotlin compartilhado + sidebar SwiftUI. `WKWebView` abre o partial com `?native=1` | Simulator |

Remotes do partial: Vue `5001`, React `5002`, Angular `5003`. O shell iOS não troca esses remotes — só esconde a sidebar web e dispara o mesmo event bus.

Detalhe de cada um fica no README (e no `SPEC.md`, onde existe) da pasta.

## Agent skills

[`3-AI-final/.cursor/skills`](./3-AI-final) guarda as skills usadas no TLC: arquitetura React, composição, performance, design, acessibilidade e spec-driven. Lista em [3-AI-final/README.md](./3-AI-final/README.md).

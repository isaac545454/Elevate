# SPEC — 6-kmp

Projeto de estudo: **Kotlin Multiplatform** + shell nativo iOS que consome o `5-mfe-partial`.

## Objetivo pedagógico

Depois de monolito → modular → monorepo → MFE, este passo mostra **share de código nativo** (`commonMain` + `expect`/`actual`) e um **host nativo** que orquestra remotes JS via WebView + event bus.

## Fronteiras

| Módulo | Papel |
|--------|--------|
| `shared` | Greeting + `Platform` + catálogo MFE (`MfeId`, `MfeCatalog`, `NativeBridgeJs`) |
| `app` | `main()` JVM que imprime greeting + links |
| `iosApp` | Shell nativo: sidebar Kotlin/Swift + `WKWebView` em `http://127.0.0.1:5000/?native=1` |

## Contratos

- Lógica comum não importa Android SDK / UIKit / `java.io` específico.
- API de plataforma passa por `expect fun` em `commonMain` e `actual` em cada target.
- Catálogo de links (`MfeId`) vive em `commonMain`. Swift só renderiza.
- Nativo **não** carrega `remoteEntry.js`. Federation fica no JS do `5-mfe-partial`.
- Clique nativo → `evaluateJavaScript(__NATIVE_EMIT_NAV__)` → bus `home-*`.
- Bus → `webkit.messageHandlers.mfeBus` → sidebar nativa pinta o ativo.
- Gradle Wrapper é a única toolchain Kotlin. Sem `kotlin` no PATH.
- Repos: só Maven Central + Gradle Plugin Portal (sem Google Maven).

## Fora de escopo (v1)

- Compose Multiplatform / Android (AGP) — depende de `maven.google.com`
- Integração com `scripts/dev-high.mjs`
- E2E Playwright no app iOS

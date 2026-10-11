# Kotlin Multiplatform — shell nativo

KMP enxuto: lógica em `shared` (JVM, iOS, JS, Wasm) + **shell iOS** que hospeda o `5-mfe-partial` num `WKWebView`.

**Kotlin CLI não precisa.** JDK 21 + `./gradlew`. O wrapper baixa o compiler (Kotlin 2.2.20) do Maven Central / Plugin Portal.

Compose / Android ficam de fora: AGP e androidx moram no Google Maven, e o HTTP client do Gradle nesta máquina falha SSL (PKIX) em `maven.google.com`.

## Estrutura

```
shared/   # commonMain + expect/actual + MfeCatalog
app/      # JVM — fun main() imprime greeting + links
iosApp/   # SwiftUI — sidebar nativa + WKWebView
```

Sidebar nativa lê `MfeCatalog` (Kotlin). Clique emite o mesmo event bus do MFE (`home-jsonplaceholder` / `home-pokemon` / `home-rick`). Remotes Vue/React/Angular **não mudam**.

## Rodar

1. Sobe o `5-mfe-partial` (portas 5000–5003):

```bash
cd 2-high-level/5-mfe-partial
npm run dev
```

2. Abre o Simulator (sobe remotes se precisar; se :5000 estiver com AirPlay, usa :5100):

```bash
cd 2-high-level/6-kmp
chmod +x scripts/run-hybrid.sh scripts/run-ios.sh
./scripts/run-hybrid.sh
```

Ou só o app, se o MFE já estiver no ar:

```bash
cd 2-high-level/6-kmp
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-21.jdk/Contents/Home
./scripts/run-ios.sh
```

WebView tenta `http://127.0.0.1:5000/?native=1`, depois `:5100`. Sidebar web some; links nativos à esquerda trocam o remote.

JVM (só terminal, **não abre Simulator**):

```bash
cd 2-high-level/6-kmp
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-21.jdk/Contents/Home
./gradlew :app:run
```

## Spec

Ver [SPEC.md](./SPEC.md).

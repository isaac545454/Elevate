# Feature-Sliced Design (exemplo: auth)

Exemplo didático das camadas do FSD usando um módulo de login.

## Camadas

```
src/
  app/                 # shell + agrega rotas
  features/            # cada feature monta a própria rota
    login/             # ui · page · route
    register/
    forgot-password/
  entities/
    user/
  shared/
    api/               # auth mock
    lib/               # session + delay
```

## Ideia

- **features** são interações de UI e **também exportam a rota** (`RouteObject`).
- **app/router** só agrega com `useRoutes([...])` — não “conhece” o detalhe de cada tela.
- **shared/api** concentra a API mock.

## Rodar

```bash
pnpm install
pnpm dev
```

Porta: `http://localhost:5176`

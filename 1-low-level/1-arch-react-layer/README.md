# Arquitetura em camadas (React)

Exemplo didático de organização por camadas:

```
src/
  pages/
    HomePage/HomePage.tsx
    PostsPage/PostsPage.tsx
    PokemonPage/PokemonPage.tsx
  components/
    Nav/Nav.tsx
    PostCard/PostCard.tsx
    PokemonCard/PokemonCard.tsx
    StatusMessage/StatusMessage.tsx
  hooks/
    usePosts/usePosts.ts
    usePokemonList/usePokemonList.ts
  services/
    postService/postService.ts
    pokemonService/pokemonService.ts
  types/
```

Cada item (page, component, hook, service) fica na própria pasta.

## Fluxo de dependência

```
Page  →  Hook  →  Service  →  API pública
  ↓
Component (props)
```

- **pages** não fazem `fetch`
- **hooks** não renderizam JSX
- **services** não conhecem React
- **components** não sabem de onde vêm os dados

## APIs usadas

- [JSONPlaceholder](https://jsonplaceholder.typicode.com) — posts
- [PokéAPI](https://pokeapi.co) — lista de pokémon

## Rodar

```bash
pnpm install
pnpm dev
```

App em `http://localhost:5173`.

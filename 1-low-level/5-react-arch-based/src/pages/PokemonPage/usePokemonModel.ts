import { usePokemonList } from '../../queries/usePokemon/usePokemon'

import type { PokemonPageModel } from './page.types'

/**
 * Model / Container (hook): consome a query, aplica regras e
 * prepara o shape que a view precisa.
 */
export function usePokemonModel(): PokemonPageModel {
  const limit = 12
  const query = usePokemonList(limit)

  return {
    pokemon: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    onReload: () => {
      void query.refetch()
    },
  }
}

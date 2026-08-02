import { useQuery } from '@tanstack/react-query'

import type { PokemonPageModel, PokemonPageModelDeps } from './page.types'

export function usePokemonPageModel({
  pokemonService,
  limit = 12,
}: PokemonPageModelDeps): PokemonPageModel {
  const query = useQuery({
    queryKey: ['pokemon', limit],
    queryFn: () => pokemonService.listPokemon(limit),
  })

  return {
    pokemon: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    onReload: () => {
      void query.refetch()
    },
  }
}

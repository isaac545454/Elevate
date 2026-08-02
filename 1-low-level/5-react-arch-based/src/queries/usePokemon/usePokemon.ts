import { useQuery } from '@tanstack/react-query'

import { listPokemon } from '../../services/pokemonService/pokemonService'

export const pokemonKeys = {
  all: ['pokemon'] as const,
  list: (limit: number) => [...pokemonKeys.all, 'list', limit] as const,
}

/** Query: estado da request (cache, loading, error, refetch). */
export function usePokemonList(limit = 12) {
  return useQuery({
    queryKey: pokemonKeys.list(limit),
    queryFn: () => listPokemon(limit),
  })
}

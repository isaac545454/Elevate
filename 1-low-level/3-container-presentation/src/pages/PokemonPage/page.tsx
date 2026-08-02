import { useQuery } from '@tanstack/react-query'

import { listPokemon } from '../../services/pokemonService/pokemonService'
import { PokemonPageView } from './page.view'

/** Container: React Query + service; passa props para a presentation. */
export function PokemonPage() {
  const limit = 12
  const query = useQuery({
    queryKey: ['pokemon', limit],
    queryFn: () => listPokemon(limit),
  })

  return (
    <PokemonPageView
      pokemon={query.data ?? []}
      loading={query.isLoading}
      error={query.error instanceof Error ? query.error.message : null}
      onReload={() => {
        void query.refetch()
      }}
    />
  )
}

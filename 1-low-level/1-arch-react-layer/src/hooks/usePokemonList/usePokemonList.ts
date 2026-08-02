import { useEffect, useState } from 'react'

import { listPokemon } from '../../services/pokemonService/pokemonService'
import type { Pokemon } from '../../types/pokemon'

type UsePokemonListState = {
  pokemon: Pokemon[]
  loading: boolean
  error: string | null
}

export function usePokemonList(limit = 12): UsePokemonListState {
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)

    listPokemon(limit)
      .then((data) => {
        if (!cancelled) setPokemon(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro desconhecido')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [limit])

  return { pokemon, loading, error }
}

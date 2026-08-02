import type { Pokemon } from '../../types/pokemon'

export type PokemonPageModel = {
  pokemon: Pokemon[]
  loading: boolean
  error: string | null
  onReload: () => void
}

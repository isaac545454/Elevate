import type { PokemonService } from '../../services/pokemonService/pokemonService'
import type { Pokemon } from '../../types/pokemon'

export type PokemonPageModelDeps = {
  pokemonService: PokemonService
  limit?: number
}

export type PokemonPageModel = {
  pokemon: Pokemon[]
  loading: boolean
  error: string | null
  onReload: () => void
}

export type PokemonPageViewProps = PokemonPageModel

import type { Pokemon } from '../../types/pokemon'

export type PokemonPageViewProps = {
  pokemon: Pokemon[]
  loading: boolean
  error: string | null
  onReload: () => void
}

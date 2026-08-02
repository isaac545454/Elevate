import { HttpClient } from '../../http/httpClient'
import { PokemonService } from '../../services/pokemonService/pokemonService'
import { usePokemonPageModel } from './page.model'
import { PokemonPageView } from './page.view'

/** ViewModel: injeta http → service → model e liga na view. */
export function PokemonPage() {
  const httpClient = new HttpClient()
  const pokemonService = new PokemonService(httpClient)
  const model = usePokemonPageModel({ pokemonService })

  return <PokemonPageView {...model} />
}

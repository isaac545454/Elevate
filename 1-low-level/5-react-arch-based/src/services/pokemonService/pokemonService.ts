import { pokeApi } from '../../api/pokeApi'
import type { Pokemon, PokemonListApiResponse } from '../../types/pokemon'

function pokemonIdFromUrl(url: string): number {
  const segments = url.split('/').filter(Boolean)
  return Number(segments[segments.length - 1])
}

function pokemonSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
}

/** Service: consome a API — só HTTP + mapeamento de resposta. */
export async function listPokemon(limit = 12): Promise<Pokemon[]> {
  const data = await pokeApi.get<PokemonListApiResponse>(
    `/pokemon?limit=${limit}`,
  )

  return data.results.map((entry) => {
    const id = pokemonIdFromUrl(entry.url)
    return {
      id,
      name: entry.name,
      imageSrc: pokemonSpriteUrl(id),
    }
  })
}

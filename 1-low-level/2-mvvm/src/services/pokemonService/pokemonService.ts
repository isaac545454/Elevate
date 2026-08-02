import type { HttpClient } from '../../http/httpClient'
import type { Pokemon, PokemonListApiResponse } from '../../types/pokemon'

function pokemonIdFromUrl(url: string): number {
  const segments = url.split('/').filter(Boolean)
  return Number(segments[segments.length - 1])
}

function pokemonSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
}

export class PokemonService {
  constructor(
    private readonly http: HttpClient,
    private readonly baseUrl = 'https://pokeapi.co/api/v2',
  ) {}

  async listPokemon(limit = 12): Promise<Pokemon[]> {
    const data = await this.http.get<PokemonListApiResponse>(
      `${this.baseUrl}/pokemon?limit=${limit}`,
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
}

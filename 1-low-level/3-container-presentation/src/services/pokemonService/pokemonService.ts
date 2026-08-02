import type { Pokemon, PokemonListApiResponse } from '../../types/pokemon'

const BASE_URL = 'https://pokeapi.co/api/v2'

function pokemonIdFromUrl(url: string): number {
  const segments = url.split('/').filter(Boolean)
  return Number(segments[segments.length - 1])
}

function pokemonSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
}

export async function listPokemon(limit = 12): Promise<Pokemon[]> {
  const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}`)

  if (!response.ok) {
    throw new Error(`Falha HTTP (${response.status}) ao listar pokémon`)
  }

  const data = (await response.json()) as PokemonListApiResponse

  return data.results.map((entry) => {
    const id = pokemonIdFromUrl(entry.url)
    return {
      id,
      name: entry.name,
      imageSrc: pokemonSpriteUrl(id),
    }
  })
}

import type { Pokemon, PokemonListApiResponse } from '../../types/pokemon'

const BASE = 'https://pokeapi.co/api/v2'

function pokemonIdFromUrl(url: string): number {
  const segments = url.split('/').filter(Boolean)
  return Number(segments[segments.length - 1])
}

function pokemonSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
}

export async function listPokemon(limit = 12): Promise<Pokemon[]> {
  const response = await fetch(`${BASE}/pokemon?limit=${limit}`)

  if (!response.ok) {
    throw new Error(`Falha ao buscar pokémon (${response.status})`)
  }

  const data: PokemonListApiResponse = await response.json()

  return data.results.map((entry) => {
    const id = pokemonIdFromUrl(entry.url)
    return {
      id,
      name: entry.name,
      imageSrc: pokemonSpriteUrl(id),
    }
  })
}

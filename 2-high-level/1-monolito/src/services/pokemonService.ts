import { httpClient } from "@/lib/http/httpClient";
import type {
  PokemonListApiResponse,
  PokemonListItem,
  PokemonListPagePayload,
} from "@/models/pokemon";

import { pokemonListConfig } from "./pokemonListConfig";

const BASE = "https://pokeapi.co/api/v2";

function pokemonIdFromUrl(url: string): number {
  const segments = url.split("/").filter(Boolean);
  return Number(segments[segments.length - 1]);
}

function pokemonSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export async function listPokemonPage(
  page: number,
): Promise<PokemonListPagePayload> {
  const offset = (page - 1) * pokemonListConfig.pageSize;
  const { data } = await httpClient.get<PokemonListApiResponse>(
    `${BASE}/pokemon`,
    {
      params: { offset, limit: pokemonListConfig.pageSize },
    },
  );

  const totalPages = Math.max(
    1,
    Math.ceil(data.count / pokemonListConfig.pageSize),
  );
  const items: PokemonListItem[] = data.results.map((entry) => {
    const id = pokemonIdFromUrl(entry.url);
    return {
      id,
      name: entry.name,
      imageSrc: pokemonSpriteUrl(id),
    };
  });

  return { items, totalPages };
}

import type {
  PokemonListPage,
  PokemonListPagePayload,
} from "@/models/pokemon";

export function mapPokemonListPage(
  data: PokemonListPagePayload,
): PokemonListPage {
  return {
    totalPages: data.totalPages,
    items: data.items.map((pokemon) => ({
      id: pokemon.id,
      imageSrc: pokemon.imageSrc,
      imageAlt: pokemon.name,
      title: pokemon.name.replace(/-/g, " "),
      description: `#${String(pokemon.id).padStart(4, "0")}`,
    })),
  };
}

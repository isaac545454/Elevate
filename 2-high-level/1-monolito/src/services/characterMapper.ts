import type {
  CharacterListPage,
  CharacterListResponse,
} from "@/models/character";
import { characterListConfig } from "@/services/characterListConfig";

export function mapCharacterListPage(
  data: CharacterListResponse,
): CharacterListPage {
  return {
    totalPages: Math.max(
      1,
      Math.ceil(data.info.count / characterListConfig.pageSize),
    ),
    characters: data.results.map((character) => ({
      id: character.id,
      imageSrc: character.image,
      imageAlt: character.name,
      title: character.name,
      description: `${character.status} · ${character.species}`,
    })),
  };
}

export type PokemonListApiResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{ name: string; url: string }>;
};

export type PokemonListItem = {
  id: number;
  name: string;
  imageSrc: string;
};

export type PokemonListPagePayload = {
  items: PokemonListItem[];
  totalPages: number;
};

export type PokemonListItemView = {
  id: number;
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
};

export type PokemonListPage = {
  totalPages: number;
  items: PokemonListItemView[];
};

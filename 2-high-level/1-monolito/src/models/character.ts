export type CharacterSummary = {
  id: number;
  name: string;
  status: string;
  species: string;
  image: string;
};

export type CharacterListResponse = {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: CharacterSummary[];
};

export type CharacterListItemView = {
  id: number;
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
};

export type CharacterListPage = {
  totalPages: number;
  characters: CharacterListItemView[];
};

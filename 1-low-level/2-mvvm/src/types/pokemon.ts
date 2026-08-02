export type PokemonListApiResponse = {
  count: number
  results: Array<{ name: string; url: string }>
}

export type Pokemon = {
  id: number
  name: string
  imageSrc: string
}

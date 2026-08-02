import { createApi } from './http'

/** Cliente HTTP da PokéAPI. */
export const pokeApi = createApi({
  baseURL: 'https://pokeapi.co/api/v2',
})

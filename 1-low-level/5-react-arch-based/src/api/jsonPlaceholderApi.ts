import { createApi } from './http'

/** Cliente HTTP do JSONPlaceholder. */
export const jsonPlaceholderApi = createApi({
  baseURL: 'https://jsonplaceholder.typicode.com',
})

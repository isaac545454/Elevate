import type { Post } from '../../types/post'

const BASE_URL = 'https://jsonplaceholder.typicode.com'

export async function listPosts(limit = 8): Promise<Post[]> {
  const response = await fetch(`${BASE_URL}/posts?_limit=${limit}`)

  if (!response.ok) {
    throw new Error(`Falha HTTP (${response.status}) ao listar posts`)
  }

  return response.json() as Promise<Post[]>
}

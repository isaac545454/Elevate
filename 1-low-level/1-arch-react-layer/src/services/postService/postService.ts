import type { Post } from '../../types/post'

const BASE = 'https://jsonplaceholder.typicode.com'

export async function listPosts(limit = 8): Promise<Post[]> {
  const response = await fetch(`${BASE}/posts?_limit=${limit}`)

  if (!response.ok) {
    throw new Error(`Falha ao buscar posts (${response.status})`)
  }

  return response.json()
}

import { jsonPlaceholderApi } from '../../api/jsonPlaceholderApi'
import type { Post } from '../../types/post'

/** Service: consome a API — só HTTP + mapeamento de resposta. */
export async function listPosts(limit = 8): Promise<Post[]> {
  return jsonPlaceholderApi.get<Post[]>(`/posts?_limit=${limit}`)
}

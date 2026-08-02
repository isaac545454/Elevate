import type { HttpClient } from '../../http/httpClient'
import type { Post } from '../../types/post'

export class PostService {
  constructor(
    private readonly http: HttpClient,
    private readonly baseUrl = 'https://jsonplaceholder.typicode.com',
  ) {}

  listPosts(limit = 8): Promise<Post[]> {
    return this.http.get<Post[]>(`${this.baseUrl}/posts?_limit=${limit}`)
  }
}

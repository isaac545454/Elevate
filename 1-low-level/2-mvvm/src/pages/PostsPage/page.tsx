import { HttpClient } from '../../http/httpClient'
import { PostService } from '../../services/postService/postService'
import { usePostsPageModel } from './page.model'
import { PostsPageView } from './page.view'

/** ViewModel: injeta http → service → model e liga na view. */
export function PostsPage() {
  const httpClient = new HttpClient()
  const postService = new PostService(httpClient)
  const model = usePostsPageModel({ postService })

  return <PostsPageView {...model} />
}

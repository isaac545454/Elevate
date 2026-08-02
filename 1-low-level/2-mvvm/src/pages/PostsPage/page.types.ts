import type { PostService } from '../../services/postService/postService'
import type { Post } from '../../types/post'

export type PostsPageModelDeps = {
  postService: PostService
  limit?: number
}

export type PostsPageModel = {
  posts: Post[]
  loading: boolean
  error: string | null
  onReload: () => void
}

export type PostsPageViewProps = PostsPageModel

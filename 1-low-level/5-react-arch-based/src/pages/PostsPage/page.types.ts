import type { Post } from '../../types/post'

export type PostsPageModel = {
  posts: Post[]
  loading: boolean
  error: string | null
  onReload: () => void
}

import type { Post } from '../../types/post'

export type PostsPageViewProps = {
  posts: Post[]
  loading: boolean
  error: string | null
  onReload: () => void
}

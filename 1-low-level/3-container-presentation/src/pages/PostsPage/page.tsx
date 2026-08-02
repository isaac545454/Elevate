import { useQuery } from '@tanstack/react-query'

import { listPosts } from '../../services/postService/postService'
import { PostsPageView } from './page.view'

/** Container: React Query + service; passa props para a presentation. */
export function PostsPage() {
  const limit = 8
  const query = useQuery({
    queryKey: ['posts', limit],
    queryFn: () => listPosts(limit),
  })

  return (
    <PostsPageView
      posts={query.data ?? []}
      loading={query.isLoading}
      error={query.error instanceof Error ? query.error.message : null}
      onReload={() => {
        void query.refetch()
      }}
    />
  )
}

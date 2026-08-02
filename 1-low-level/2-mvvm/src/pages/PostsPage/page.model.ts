import { useQuery } from '@tanstack/react-query'

import type { PostsPageModel, PostsPageModelDeps } from './page.types'

export function usePostsPageModel({
  postService,
  limit = 8,
}: PostsPageModelDeps): PostsPageModel {
  const query = useQuery({
    queryKey: ['posts', limit],
    queryFn: () => postService.listPosts(limit),
  })

  return {
    posts: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    onReload: () => {
      void query.refetch()
    },
  }
}

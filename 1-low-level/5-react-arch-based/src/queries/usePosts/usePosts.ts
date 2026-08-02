import { useQuery } from '@tanstack/react-query'

import { listPosts } from '../../services/postService/postService'

export const postsKeys = {
  all: ['posts'] as const,
  list: (limit: number) => [...postsKeys.all, 'list', limit] as const,
}

/** Query: estado da request (cache, loading, error, refetch). */
export function usePostsList(limit = 8) {
  return useQuery({
    queryKey: postsKeys.list(limit),
    queryFn: () => listPosts(limit),
  })
}

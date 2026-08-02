import { usePostsList } from '../../queries/usePosts/usePosts'

import type { PostsPageModel } from './page.types'

/**
 * Model / Container (hook): consome a query, aplica regras e
 * prepara o shape que a view precisa.
 */
export function usePostsModel(): PostsPageModel {
  const limit = 8
  const query = usePostsList(limit)

  return {
    posts: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    onReload: () => {
      void query.refetch()
    },
  }
}

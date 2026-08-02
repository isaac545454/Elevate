import { useEffect, useState } from 'react'

import { listPosts } from '../../services/postService/postService'
import type { Post } from '../../types/post'

type UsePostsState = {
  posts: Post[]
  loading: boolean
  error: string | null
}

export function usePosts(limit = 8): UsePostsState {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)

    listPosts(limit)
      .then((data) => {
        if (!cancelled) setPosts(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro desconhecido')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [limit])

  return { posts, loading, error }
}

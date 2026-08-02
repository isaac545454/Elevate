import { PostCard } from '../../components/PostCard/PostCard'
import { StatusMessage } from '../../components/StatusMessage/StatusMessage'
import { usePosts } from '../../hooks/usePosts/usePosts'

export function PostsPage() {
  const { posts, loading, error } = usePosts(8)

  return (
    <section className="page">
      <header className="page__header">
        <p className="eyebrow">JSONPlaceholder</p>
        <h1>Posts</h1>
        <p className="page__lead">
          Page usa o hook <code>usePosts</code>, que chama{' '}
          <code>postService</code>.
        </p>
      </header>

      {loading && <StatusMessage>Carregando posts…</StatusMessage>}
      {error && <StatusMessage variant="error">{error}</StatusMessage>}

      {!loading && !error && (
        <div className="grid">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  )
}

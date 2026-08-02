import { StatusMessage } from '../../components/StatusMessage/StatusMessage'

import { usePostsModel } from './usePostsModel'

/** View: chama o model hook e só renderiza UI. */
export function PostsPage() {
  const { posts, loading, error, onReload } = usePostsModel()

  return (
    <section className="page">
      <header className="page__header">
        <p className="eyebrow">JSONPlaceholder · View + Model hook</p>
        <h1>Posts</h1>
        <p className="page__lead">
          A view chama <code>usePostsModel</code>. Não conhece service nem React
          Query.
        </p>
      </header>

      <div className="page__toolbar">
        <button type="button" className="btn btn--ghost" onClick={onReload}>
          Recarregar
        </button>
      </div>

      {loading && <StatusMessage>Carregando posts…</StatusMessage>}
      {error && <StatusMessage variant="error">{error}</StatusMessage>}

      {!loading && !error && (
        <div className="grid">
          {posts.map((post) => (
            <article key={post.id} className="card">
              <span className="card__meta">#{post.id}</span>
              <h3 className="card__title">{post.title}</h3>
              <p className="card__body">{post.body}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

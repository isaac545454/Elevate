import type { Post } from '../../types/post'

type PostCardProps = {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="card">
      <span className="card__meta">#{post.id}</span>
      <h3 className="card__title">{post.title}</h3>
      <p className="card__body">{post.body}</p>
    </article>
  )
}

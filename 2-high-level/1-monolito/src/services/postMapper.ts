import type { Post, PostListRow } from "@/models/post";

function postCoverImageUrl(postId: number): string {
  return `https://picsum.photos/seed/jsonplaceholder-${postId}/600/375`;
}

export function mapPostListRows(posts: Post[]): PostListRow[] {
  return posts.map((post) => ({
    ...post,
    coverImageSrc: postCoverImageUrl(post.id),
    coverImageAlt: `Capa ilustrativa do post ${post.id}`,
  }));
}

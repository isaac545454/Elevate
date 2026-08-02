import { httpClient } from "@/lib/http/httpClient";
import type { Post } from "@/models/post";

import { postListConfig } from "./postListConfig";

const BASE = "https://jsonplaceholder.typicode.com";

export async function listPosts(page: number): Promise<Post[]> {
  const { data } = await httpClient.get<Post[]>(`${BASE}/posts`, {
    params: { _page: page, _limit: postListConfig.pageSize },
  });
  return data;
}

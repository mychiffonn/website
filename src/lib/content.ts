import { getCollection, type CollectionEntry } from "astro:content"
import { isSubpost } from "@/lib/utils"

export async function getPosts(): Promise<CollectionEntry<"blog">[]> {
  const posts = await getCollection("blog", ({ data }) => !data.draft)
  return posts
    .filter((post) => !isSubpost(post.id))
    .sort((a, b) => b.data.createdAt.getTime() - a.data.createdAt.getTime())
}

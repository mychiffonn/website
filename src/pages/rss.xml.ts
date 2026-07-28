import { SITE } from "@site-config"
import { PostManager } from "@/lib/blog"
import rss from "@astrojs/rss"
import type { APIContext } from "astro"

export async function GET(context: APIContext) {
  const posts = await PostManager.getInstance().getMainPosts()
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.createdAt,
      link: `/blog/${post.id}`,
    })),
  })
}

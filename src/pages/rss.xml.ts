import { SITE } from '@/config'
import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { PostManager } from '@/lib/post-manager'

export async function GET(context: APIContext) {
  try {
    const posts = await PostManager.getInstance().getAllPosts()

    const items = await Promise.all(
      posts.map(async (post) => {
        // Render the full post content to get processed images
        // const { Content } = await render(post)

        // Just use the description as-is
        const fullContent = post.data.description

        return {
          title: post.data.title,
          description: fullContent,
          pubDate: post.data.createdAt,
          link: `/blog/${post.id}/`,
          categories: post.data.tags,
          ...(post.data.updatedAt && { customData: `<updated>${post.data.updatedAt.toISOString()}</updated>` })
        }
      })
    )

    return rss({
      title: SITE.title,
      description: SITE.description,
      site: context.site ?? SITE.href,
      stylesheet: '/pretty-feed-v3.xsl',
      items,
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new Response('Error generating RSS feed', { status: 500 })
  }
}

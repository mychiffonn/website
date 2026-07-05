import type { GetStaticPaths } from "astro"
import type { CollectionEntry } from "astro:content"

import { PostManager } from "@/lib/blog"
import { renderPostImage } from "@/lib/og"

type Post = CollectionEntry<"blog">

type Props = {
  post: Post
}

export const getStaticPaths = (async () => {
  const posts = await PostManager.getInstance().getAllPostsAndSubposts()

  return posts.map((post) => ({
    params: { id: post.id },
    props: { post },
  }))
}) satisfies GetStaticPaths

export async function GET({ props }: { props: Props }): Promise<Response> {
  const image = await renderPostImage({
    title: props.post.data.title,
    description: props.post.data.description,
  })

  return new Response(new Uint8Array(image), {
    headers: {
      "Content-Type": "image/png",
    },
  })
}

import { z } from "astro/zod"

export const WebmentionConfigSchema = z.object({
  enabled: z.boolean().default(false)
})

export type WebmentionConfig = z.infer<typeof WebmentionConfigSchema>

export interface WebmentionAuthor {
  name: string
  url: string
  photo: string
}

export interface WebmentionEntry {
  type: string
  author: WebmentionAuthor
  url: string
  published: string | null
  "wm-received": string
  "wm-id": number
  "wm-property": "like-of" | "repost-of" | "in-reply-to" | "mention-of" | "bookmark-of"
  "wm-source": string
  "wm-target": string
  content?: { text: string; html: string }
}

export interface WebmentionFeed {
  type: "feed"
  name: string
  children: WebmentionEntry[]
}

export interface GroupedMentions {
  likes: { entries: WebmentionEntry[]; count: number }
  reposts: { entries: WebmentionEntry[]; count: number }
  replies: { entries: WebmentionEntry[]; count: number }
  mentions: { entries: WebmentionEntry[]; count: number }
  bookmarks: { entries: WebmentionEntry[]; count: number }
}

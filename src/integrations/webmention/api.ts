import { WEBMENTION_TOKEN } from "astro:env/server"

import type { GroupedMentions, WebmentionEntry, WebmentionFeed } from "./types"

export async function fetchWebmentions(postUrl: string): Promise<WebmentionEntry[]> {
  const token = WEBMENTION_TOKEN
  if (!token) return []

  const url = new URL("https://webmention.io/api/mentions.jf2")
  url.searchParams.set("target", postUrl)
  url.searchParams.set("token", token)
  url.searchParams.set("per-page", "200")

  try {
    const response = await fetch(url.toString())
    if (!response.ok) return []
    const feed: WebmentionFeed = await response.json()
    return feed.children ?? []
  } catch {
    return []
  }
}

const WM_PROPERTY_MAP: Record<string, keyof GroupedMentions> = {
  "like-of": "likes",
  "repost-of": "reposts",
  "in-reply-to": "replies",
  "mention-of": "mentions",
  "bookmark-of": "bookmarks"
}

export function groupMentions(entries: WebmentionEntry[]): GroupedMentions {
  const groups: GroupedMentions = {
    likes: { entries: [], count: 0 },
    reposts: { entries: [], count: 0 },
    replies: { entries: [], count: 0 },
    mentions: { entries: [], count: 0 },
    bookmarks: { entries: [], count: 0 }
  }

  for (const entry of entries) {
    const key = WM_PROPERTY_MAP[entry["wm-property"]] ?? "mentions"
    groups[key].entries.push(entry)
    groups[key].count++
  }

  return groups
}

const PLATFORM_PATTERNS: [RegExp, string][] = [
  [/twitter\.com|x\.com/, "X"],
  [/mastodon\.|mstdn\.|hachyderm\.io|fosstodon\.org/, "Mastodon"],
  [/bsky\.app/, "Bluesky"],
  [/reddit\.com/, "Reddit"],
  [/github\.com/, "GitHub"],
  [/news\.ycombinator\.com/, "Hacker News"],
  [/linkedin\.com/, "LinkedIn"],
  [/threads\.net/, "Threads"],
  [/lobste\.rs/, "Lobsters"]
]

export function getMentionSourceName(url: string): string {
  for (const [pattern, name] of PLATFORM_PATTERNS) {
    if (pattern.test(url)) return name
  }
  try {
    return new URL(url).hostname
  } catch {
    return "Web"
  }
}

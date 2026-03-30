import type { AuthorData } from "./types"

export type ShareActionKey =
  | "email"
  | "x"
  | "linkedin"
  | "facebook"
  | "bluesky"
  | "mastodon"
  | "reddit"

export interface ShareActionConfig {
  key: ShareActionKey
  label: string
  icon: string
  href: string
}

/**
 * Extract a platform handle from a profile URL.
 * Returns the handle without @ prefix, or null if unrecognized.
 */
export function extractHandle(
  url: string,
  platform: "x" | "bluesky"
): string | null {
  try {
    const parsed = new URL(url)
    if (platform === "x") {
      // https://x.com/username or https://twitter.com/username
      const match = parsed.pathname.match(/^\/([A-Za-z0-9_]+)\/?$/)
      return match ? match[1] : null
    }
    if (platform === "bluesky") {
      // https://bsky.app/profile/handle.bsky.social
      const match = parsed.pathname.match(/^\/profile\/(.+?)\/?$/)
      return match ? match[1] : null
    }
  } catch {
    return null
  }
  return null
}

function getAuthorHandles(
  authors: AuthorData[],
  platform: "x" | "bluesky"
): string[] {
  const handles: string[] = []
  for (const author of authors) {
    const linkVal = author.links?.[platform]
    const url = typeof linkVal === "string" ? linkVal : linkVal?.href
    if (!url) continue
    const handle = extractHandle(url, platform)
    if (handle) handles.push(handle)
  }
  return handles
}

function buildAuthorByline(authors: AuthorData[]): string {
  if (authors.length === 0) return ""
  return "by " + authors.map((a) => a.name).join(", ")
}

/**
 * Build share action configs from keys, post metadata, and authors.
 */
export function getShareActions(
  keys: ShareActionKey[],
  title: string,
  url: string,
  authors: AuthorData[]
): ShareActionConfig[] {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  return keys.map((key) => {
    switch (key) {
      case "email": {
        const byline = buildAuthorByline(authors)
        const body = encodeURIComponent(`${url}\n\n${byline}`.trim())
        const subject = encodedTitle
        return {
          key,
          label: "Share via Email",
          icon: "mail-send",
          href: `mailto:?subject=${subject}&body=${body}`
        }
      }

      case "x": {
        const handles = getAuthorHandles(authors, "x")
        const via = handles[0] ? `&via=${handles[0]}` : ""
        // Mention additional authors in tweet text
        const mentions =
          handles.length > 1
            ? " " + handles.slice(1).map((h) => `@${h}`).join(" ")
            : ""
        const text = encodeURIComponent(`${title}${mentions}`)
        return {
          key,
          label: "Share on X",
          icon: "mingcute:social-x-line",
          href: `https://x.com/intent/tweet?text=${text}&url=${encodedUrl}${via}`
        }
      }

      case "linkedin":
        return {
          key,
          label: "Share on LinkedIn",
          icon: "mingcute:linkedin-line",
          href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        }

      case "facebook":
        return {
          key,
          label: "Share on Facebook",
          icon: "mingcute:facebook-line",
          href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        }

      case "bluesky": {
        const bskyHandles = getAuthorHandles(authors, "bluesky")
        const mentions = bskyHandles.map((h) => `@${h}`).join(" ")
        const text = encodeURIComponent(
          `${title} ${mentions}`.trim() + `\n\n${url}`
        )
        return {
          key,
          label: "Share on Bluesky",
          icon: "mingcute:bluesky-social-line",
          href: `https://bsky.app/intent/compose?text=${text}`
        }
      }

      case "mastodon":
        return {
          key,
          label: "Share on Mastodon",
          icon: "mingcute:mastodon-line",
          href: `https://mastodonshare.com/?text=${encodedTitle}&url=${encodedUrl}`
        }

      case "reddit":
        return {
          key,
          label: "Share on Reddit",
          icon: "mingcute:reddit-line",
          href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`
        }
    }
  })
}

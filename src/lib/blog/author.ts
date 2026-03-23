import { getCollection, getEntry } from "astro:content"

import { PROFILE, SITE } from "@site-config"

import type { AuthorData, AuthorReference } from "./types"

/**
 * Build an AuthorData object from site config as a fallback
 * when no authors are defined or people.toml is missing/empty.
 */
export function getSiteAuthor(): AuthorData {
  return {
    id: PROFILE.name.toLowerCase().replace(/\s+/g, "-"),
    name: SITE.author,
    pronouns: PROFILE.pronouns,
    avatar: undefined,
    bio: SITE.description,
    affiliation: undefined,
    links: PROFILE.links ?? {}
  }
}

export async function getAllAuthors(): Promise<AuthorData[]> {
  try {
    const authors = await getCollection("people")
    return authors.map((author) => author.data)
  } catch (error) {
    console.warn("Failed to retrieve authors from people collection:", error)
    return []
  }
}

export async function getAuthorById(authorId: string): Promise<AuthorData | null> {
  try {
    const author = await getEntry("people", authorId)
    return author?.data || null
  } catch (error) {
    console.warn(`Failed to retrieve author ${authorId}:`, error)
    return null
  }
}

/**
 * Resolves author references to author data objects.
 * Processes all references in parallel.
 */
export async function resolveAuthors(authorRefs: AuthorReference[]): Promise<AuthorData[]> {
  if (!authorRefs?.length) return []

  const resolvedAuthors = await Promise.allSettled(
    authorRefs.map(async (authorRef) => {
      const author = await getEntry(authorRef)
      return author?.data || null
    })
  )

  return resolvedAuthors
    .filter(
      (result): result is PromiseFulfilledResult<AuthorData> =>
        result.status === "fulfilled" && result.value !== null
    )
    .map((result) => result.value)
}

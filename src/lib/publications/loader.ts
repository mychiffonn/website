/**
 * Publication loading and processing utilities
 */
import { PUB_CONFIG } from "@site-config"

import {
  getPublicationData,
  getSelectedPublications,
  parseBibTeX,
  sortPublications,
  sortPublicationsByRelevance
} from "./utils"
import bibContent from "/src/content/publications/main.bib?raw"

/**
 * Load and process all publications grouped by year
 * @returns Object with publications grouped by year and years array
 */
export async function loadAllPublications() {
  try {
    const allPublications = parseBibTeX(bibContent)
    const sorted = sortPublications(allPublications, PUB_CONFIG)

    const processedPublicationsByYear: Record<string, any[]> = {}
    const yearsSet = new Set<number>()
    const keywordCounts = new Map<string, number>()

    for (const pub of sorted) {
      const year = pub.year || 0
      const yearStr = year.toString()

      if (!processedPublicationsByYear[yearStr]) {
        processedPublicationsByYear[yearStr] = []
      }

      processedPublicationsByYear[yearStr].push(getPublicationData(pub, PUB_CONFIG))
      yearsSet.add(year)

      if (pub.keywords) {
        for (const kw of pub.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean)) {
          keywordCounts.set(kw, (keywordCounts.get(kw) || 0) + 1)
        }
      }
    }

    const years = Array.from(yearsSet).sort((a, b) => b - a)

    // Flat list sorted by relevance
    const relevanceSorted = sortPublicationsByRelevance(allPublications, PUB_CONFIG)
    const allPublicationsFlat = relevanceSorted.map((pub) => getPublicationData(pub, PUB_CONFIG))

    // Sort keywords by count (descending) then name (ascending), like blog tags
    const allKeywords = [...keywordCounts.entries()]
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => {
        const countDiff = b.count - a.count
        return countDiff !== 0 ? countDiff : a.keyword.localeCompare(b.keyword)
      })

    return {
      publicationsByYear: processedPublicationsByYear,
      years,
      allPublicationsFlat,
      allKeywords
    }
  } catch (error) {
    console.error("Error loading publications:", error)
    return {
      publicationsByYear: {},
      years: [],
      allPublicationsFlat: [],
      allKeywords: [] as { keyword: string; count: number }[]
    }
  }
}

/**
 * Load and process selected publications sorted by year
 * @returns Array of selected publications
 */
export async function loadSelectedPublications() {
  try {
    const allPublications = parseBibTeX(bibContent)
    const selectedPublications = getSelectedPublications(allPublications)
    const sortedPublications = sortPublications(selectedPublications, PUB_CONFIG)

    return sortedPublications.map((pub) => getPublicationData(pub, PUB_CONFIG))
  } catch (error) {
    console.error("Error loading selected publications:", error)
    return []
  }
}

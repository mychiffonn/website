/**
 * Publication loading and processing utilities
 */
import { PUB_CONFIG } from "@site-config"

import { getPublicationData, getSelectedPublications, parseBibTeX, sortPublications } from "./utils"
import bibContent from "/src/content/publications/main.bib?raw"

/**
 * Load and process all publications grouped by year
 * @returns Object with publications grouped by year and years array
 */
export async function loadAllPublications() {
  try {
    const allPublications = parseBibTeX(bibContent)

    // Group publications by year and process in a single pass
    const processedPublicationsByYear: Record<string, any[]> = {}
    const yearsSet = new Set<number>()

    for (const pub of allPublications) {
      const year = pub.year || 0
      const yearStr = year.toString()

      if (!processedPublicationsByYear[yearStr]) {
        processedPublicationsByYear[yearStr] = []
      }

      processedPublicationsByYear[yearStr].push(getPublicationData(pub, PUB_CONFIG))
      yearsSet.add(year)
    }

    // Sort publications within each year (reverse chronological by default)
    for (const yearStr of Object.keys(processedPublicationsByYear)) {
      processedPublicationsByYear[yearStr].sort((a, b) => (b.year || 0) - (a.year || 0))
    }

    // Convert set to sorted array (newest first)
    const years = Array.from(yearsSet).sort((a, b) => b - a)

    return { publicationsByYear: processedPublicationsByYear, years }
  } catch (error) {
    console.error("Error loading publications:", error)
    return { publicationsByYear: {}, years: [] }
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
    const sortedPublications = sortPublications(selectedPublications)

    return sortedPublications.map((pub) => getPublicationData(pub, PUB_CONFIG))
  } catch (error) {
    console.error("Error loading selected publications:", error)
    return []
  }
}

/**
 * Publication loading and processing utilities
 */
import { PUB_CONFIG } from "@site-config"
import {
  parseBibTeX,
  sortPublications,
  groupPublicationsByYear,
  getSelectedPublications,
  getPublicationData,
  type Publication
} from "./utils"

/**
 * Load and process all publications grouped by year
 * @returns Object with publications grouped by year and years array
 */
export async function loadAllPublications() {
  try {
    const bibContent = await import("/src/content/publications/main.bib?raw").then(m => m.default)
    const allPublications = parseBibTeX(bibContent)
    const sortedPublications = sortPublications(allPublications, PUB_CONFIG)
    const publicationsByYear = groupPublicationsByYear(sortedPublications)

    // Process publications for display and sort years in one pass
    const processedPublicationsByYear: Record<string, any[]> = {}
    const years: number[] = []

    for (const [year, publications] of Object.entries(publicationsByYear)) {
      processedPublicationsByYear[year] = publications.map(pub => getPublicationData(pub, PUB_CONFIG))
      years.push(Number(year))
    }

    // Sort years based on configuration
    years.sort((a, b) => PUB_CONFIG.sortOrder === "chronological" ? a - b : b - a)

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
    const bibContent = await import("/src/content/publications/main.bib?raw").then(m => m.default)
    const allPublications = parseBibTeX(bibContent)
    const sortedPublications = sortPublications(allPublications, PUB_CONFIG)
    const selectedPublications = getSelectedPublications(sortedPublications)
    
    return selectedPublications.map(pub => getPublicationData(pub, PUB_CONFIG))
  } catch (error) {
    console.error("Error loading selected publications:", error)
    return []
  }
}

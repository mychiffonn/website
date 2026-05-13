import customFieldDefinitions from "./custom-fields.json"
import venuePatternGroups from "./venue-patterns.json"

export type BibTeXFieldType = "field" | "list" | "separated"
export type BibTeXValueType = "literal" | "title" | "name" | "date" | "verbatim" | "uri" | "other"

type FieldCategory = "metadata" | "link"

interface CustomFieldDefinition {
  name: string
  fieldType: BibTeXFieldType
  valueType: BibTeXValueType
  category: FieldCategory
}

interface VenuePatternDefinition {
  pattern: string
  venue: string
  flags?: string
}

interface VenuePatternGroups {
  booktitle: VenuePatternDefinition[]
  url: VenuePatternDefinition[]
  doi: VenuePatternDefinition[]
}

export interface CustomFieldConfig {
  fieldType: BibTeXFieldType
  valueType: BibTeXValueType
  category: FieldCategory
}

function buildVenuePatterns(definitions: VenuePatternDefinition[]): [RegExp, string][] {
  return definitions.map(({ pattern, venue, flags = "i" }) => [new RegExp(pattern, flags), venue])
}

const typedCustomFieldDefinitions = customFieldDefinitions as CustomFieldDefinition[]
const typedVenuePatternGroups = venuePatternGroups as VenuePatternGroups

export const CUSTOM_FIELD_NAMES = typedCustomFieldDefinitions.map((definition) => definition.name)
export const LINK_FIELD_NAMES = typedCustomFieldDefinitions
  .filter((definition) => definition.category === "link")
  .map((definition) => definition.name)

export const CUSTOM_FIELDS_CONFIG = Object.fromEntries(
  typedCustomFieldDefinitions.map(({ name, ...config }) => [name, config])
) as Record<string, CustomFieldConfig>

export const VENUE_BOOKTITLE_PATTERNS = buildVenuePatterns(typedVenuePatternGroups.booktitle)
export const VENUE_URL_PATTERNS = buildVenuePatterns(typedVenuePatternGroups.url)
export const VENUE_DOI_PATTERNS = buildVenuePatterns(typedVenuePatternGroups.doi)

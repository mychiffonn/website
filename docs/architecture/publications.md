# Publications System Architecture

## Overview

The publications system is built using `citation-js` for BibTeX parsing and provides automatic processing, author highlighting, and responsive display of academic publications.

- `@citation-js/core` - BibTeX parsing
- `@citation-js/plugin-bibtex` - BibTeX plugin

## File Structure

```
src/
├── lib/publications/
│   ├── data/
│   │   ├── custom-fields.json   # BibTeX field definitions
│   │   ├── index.ts            # Runtime config built from JSON
│   │   └── venue-patterns.json  # Venue inference patterns
│   ├── loader.ts           # Publication loading functions
│   └── utils.ts            # Citation processing utilities
├── components/publications/
│   └── PubCard.astro       # Publication card component
├── pages/
│   └── publications.astro  # Publications listing page
├── content/publications/
│   └── main.bib           # Bibliography file
└── icon.config.ts         # Publication link icons
```

## Custom BibTeX Fields Support

The following custom fields are supported beyond standard BibTeX:

- `eprint` and `archivePrefix` - arXiv preprint fields (standard BibTeX for arXiv)
- `award` - Award/honor received
- `code` - Source code repository URL
- `data` - Dataset URL
- `demo` - Live demo URL
- `models` - Model artifact URL
- `pdf` - PDF file path or URL
- `post` - Blog post URL
- `poster` - Poster file path or URL
- `resources` - Additional resources URL
- `selected` - Boolean for featured publications (`selected={true}` or `selected="true"`)
- `slides` - Presentation slides URL
- `talk` - Talk/presentation URL
- `thread` - Social media thread URL, such as X/Twitter/BlueSky summary or discussion thread
- `venue` - Publication venue (overrides journal/booktitle)
- `video` - Video URL
- `website` - Project website URL

### Adding/Editing Custom Fields

To add or remove custom fields:

1. **Add field support in `src/lib/publications/data/custom-fields.json`**:
   - Add a new entry with `name`, `fieldType`, `valueType`, and `category`
   - Metadata fields are normalized onto publication objects
   - Link fields automatically show up in publication action buttons

2. **Add icon mapping in `src/icon.config.ts`**:

   ```typescript
   export const PUBLICATION_LINK_TYPES = {
     // ... existing fields
     mynewfield: { iconName: "lucide:external-link", label: "My Field" }
   }
   ```

3. **If the field should render as an action button, add it to the data file with `category: "link"`**

Venue inference patterns live in `src/lib/publications/data/venue-patterns.json`.

## 4. Configuration

Publications are configured in `src/site.config.ts`:

```typescript
export const PUBLICATIONS: PublicationConfig = {
  maxFirstAuthors: 3, // Number of first authors to show
  maxLastAuthors: 2, // Number of last authors to show (0 = none)
  highlightAuthor: {
    firstName: "My Chiffon",
    lastName: "Nguyen",
    aliases: ["My Nguyen", "M. Nguyen", "Chiffon Nguyen"]
  }
}
```

## Core Components

### PubCard Component (`src/components/publications/PubCard.astro`)

Displays individual publication entries with:

- **Award display**: Gold trophy icon for awarded publications
- **Title linking**: Auto-links to DOI, arXiv, or URL (in that priority)
- **Author highlighting**: Bolds configured author names
- **Author truncation**: Shows first N and last M authors with expandable middle section
- **Publication details**: Venue/journal • year format
- **Expandable abstract**: Using `<details>` element with custom styling
- **Action buttons**: Links to PDF, code, demo, etc. with appropriate icons

### Citation Processing (`src/lib/publications/utils.ts`)

**Key Functions**:

- `parseBibTeX(bibContent)` - Parse .bib file with custom field extraction
- `highlightAuthorName(authors, config)` - Bold configured author names
- `truncateAuthors(authors, maxFirst, maxLast)` - Handle author list truncation
- `getPublicationLinks(entry)` - Extract action links (excludes title links)
- `sortPublications(publications, config)` - Sort by year
- `getSelectedPublications(publications)` - Filter by `selected` field
- `getPublicationData(publication, config)` - Process for display

## Page Integration

### Publications Page (`src/pages/publications.astro`)

- Groups publications by year in reverse chronological order
- Uses `loadAllPublications()` from loader
- Displays empty state when no publications found
- Full-width responsive layout

### Selected Publications (Homepage)

- Use `loadSelectedPublications()` to get featured publications
- Filter publications where `selected=true` in BibTeX
- Same PubCard component for consistency

### Loaders (`src/lib/publications/loader.ts`)

- `loadAllPublications()` - All publications grouped by year
- `loadSelectedPublications()` - Only selected publications
- Both handle parsing, sorting, and processing automatically

# Project Content Schema

Astro will load all files of types Markdown or MarkdownX in this project folder. The frontmatter
keys of each Markdown file are documented below.

## Quick examples

Simple frontmatter

```markdown
---
title: "Synthetic Control Analysis"
description:
  "Replication study of Philadelphia excise tax impact using synthetic control methods in R with
  causal inference."
repo: "https://github.com/username/synthetic-control"
context: "school"
---
```

Full frontmatter

```markdown
---
title: "Synthetic Control Analysis"
description:
  "Replication study of Philadelphia excise tax impact using synthetic control methods in R with
  causal inference."
fromDate: "2023-10"
toDate: "2023-12"
repo: "https://github.com/username/synthetic-control"
doc: "https://docs.example.com/synthetic-control"
url: "https://synthetic-control.example.com"
context: "work"
isHighlighted: true
release: "https://github.com/username/synthetic-control/releases/tag/v1.0.0"
tags:
  - "data-science"
  - "python"
  - "statistics"
---
```

## Fields

| Key             | Type     | Required? | Description                                              | Notes                                            |
| --------------- | -------- | --------- | -------------------------------------------------------- | ------------------------------------------------ |
| `title`         | String   | ✅        | The title of the project                                 |                                                  |
| `description`   | String   | ❌        | Brief project description (max 100 characters)           | Used in project cards; falls back to content     |
| `fromDate`      | Date     | ❌        | Start date of the project                                | YYYY-MM or YYYY-MM-DD format                     |
| `toDate`        | Date     | ❌        | End date of the project                                  | YYYY-MM or YYYY-MM-DD format. Must be ≥ fromDate |
| `repo`          | URL      | ❌        | Link to source code repository                           | Must be a valid URL                              |
| `doc`           | URL      | ❌        | Link to project documentation                            | Must be a valid URL                              |
| `url`           | URL      | ❌        | Link to live site or demo                                | Must be a valid URL                              |
| `context`       | Enum     | ❌        | One of: `school`, `personal`, `work`, `collab`           |                                                  |
| `isHighlighted` | Boolean  | ❌        | Whether to feature this project                          | Defaults to `false`                              |
| `release`       | URL      | ❌        | Link to release or deployment                            | Must be a valid URL                              |
| `tags`          | String[] | ❌        | Project keywords, categories, frameworks, languages, etc | Will be lowercased and deduplicated              |

## Notes

- `README.md` will be ignored by the content loader
- To modify the schema, see [src/types/projects.ts](../../src/types/projects.ts)
- Projects are sorted by `isHighlighted` (true > false) `toDate` (descending), then `fromDate`
  (descending), then `title` (ascending)
- Project cards show `description` if available, otherwise truncated content with a "read more" link
- External links use the LinkExternal component and include hover effects
- The entire project card is clickable and navigates to the project detail page
- EITHER avoid using values that has colon `:` or `[]` OR wrap it in quotes `'` or double-quotes
  `"`. Otherwise Zod validation would fail.

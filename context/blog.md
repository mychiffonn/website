# Overview

- Blog route: `[site]/[base]/blog` (configure site and base in [astro.config.ts](../astro.config.ts))
- Content: Markdown/MDX files in `src/content/blog/`
- Schema: Validated against `blog` collection in [src/content.config.ts](../src/content.config.ts)
- Main files:
  - Post rendering: [src/pages/blog/[...id].astro](../src/pages/blog/[...id].astro)
  - Listing/pagination: [src/pages/blog/[...page].astro](../src/pages/blog/[...page].astro)
  - Content management: [PostManager](../src/lib/blog/index.ts)

# Post metadata / Frontmatter

All blog posts must include frontmatter fields defined in the `blog` collection schema in [src/content.config.ts](../src/content.config.ts:22-49):

### Required Fields

- `title`: String - Post title
- `description`: String - Post description
- `createdAt`: Date - Publication date (YYYY-MM-DD format)

### Optional Fields

- `updatedAt`: Date - Last modified date
- `order`: Number - Custom ordering for subposts
- `image`: Image asset - Hero image for the post
- `tags`: Array of strings - Post tags (auto-processed)
- `authors`: Array of author ids - Post authors (defaults to empty)
- `draft`: Boolean - Draft status (defaults to false)

### Validation

- `updatedAt` must be after `createdAt` if both are provided
- Authors must reference valid entries in the `authors` collection (defined in [authors.toml](../src/content/authors.toml)).

# Post-subpost relationship

The blog system supports hierarchical relationships between posts through a parent-subpost structure.

## Organization in src/content/blog

Posts are organized in the filesystem as follows:

- **Standalone posts**: `src/content/blog/post-name.md` or `src/content/blog/post-name/index.md`
- **Parent-subpost structure**:
  - Parent post: `src/content/blog/parent-name/index.md`
  - Subposts: `src/content/blog/parent-name/subpost-name.md`

Example structure:

```
src/content/blog/
├── standalone-post.md
├── knowledge-diversity/
│   ├── index.md        # Parent post
│   └── subpost.md      # Subpost
└── another-post/
    └── index.md        # Standalone post in folder
```

## URLs

Post URLs are dynamically generated based on file structure:

- **Standalone posts**: `/blog/[post-id]` where `post-id` is the file/folder name
- **Parent posts**: `/blog/[parent-id]`
- **Subposts**: `/blog/[parent-id]/[subpost-id]`

URL generation is handled by [src/pages/blog/[...id].astro](../src/pages/blog/[...id].astro) using dynamic routing.

## Parent-Subpost Logic

The [PostManager](../src/lib/blog/index.ts) automatically detects relationships:

- Posts with `/` in their ID are treated as subposts (e.g., `knowledge-diversity/methodology`)
- Parent ID is extracted using [PostUtils.getParentId()](../src/lib/blog/index.ts:278)
- Subpost detection uses [PostUtils.isSubpost()](../src/lib/blog/index.ts:268)

## Tags

Tags are processed (normalized/slugified then deduplicated) automatically:

- Defined in frontmatter as an array: `tags: [philosophy, research]`
- Automatically slugified by [src/content.config.ts](../src/content.config.ts:36) to be URL friendly (e.g., "Artificial Intelligence" tag will turn to "artificial-intelligence")
- Tag pages are accessible at `/tags/[tag-name]` and `/tags` for all tags

### Subpost Tag Inheritance and Aggregation

Subposts can have their own tags independent of their parent post. However, we don't want to show subposts when user browse tag listings, since they're out of context.

Instead, when a subpost has a tag, the **parent post is included** in that tag's post listing. This ensures tag pages show navigable parent posts.

Implementation see -> ([repositories.ts:getPostsByTag](../src/lib/blog/repositories.ts))

**Example**:

```
- knowledge-diversity/index.md (tags: [philosophy])
- knowledge-diversity/methodology.md (tags: [research, methods])
```

- `/tags/philosophy` shows: knowledge-diversity (parent)
- `/tags/research` shows: knowledge-diversity (parent, due to subpost tag)
- `/tags/methods` shows: knowledge-diversity (parent, due to subpost tag)

# Anatomy of a Post

## Metadata

Post metadata is computed and displayed information beyond the basic frontmatter. The system generates rich metadata through the [PostManager.getMetadata()](../src/lib/blog/index.ts:155) method and [PostMeta interface](../src/lib/blog/types.d.ts:71-86):

**Core Fields** (from frontmatter):

- `id`: Post identifier
- `title`, `description`, `createdAt`, `updatedAt`, `image`, `tags`, `draft`
- `authors` (references will be resolved into an Author object)

**Computed Fields**:

- `wordCount`: Word count for this post only
- `combinedWordCount`: Total word count including subposts (null for subposts)
- `isSubpost`: Whether this post is a subpost
- `subpostCount`: Number of subposts (0 if isSubpost is true)
- `hasSubposts`: Whether this post has subposts (false if isSubpost is true)

Metadata is rendered by [PostMetadata.astro](../src/components/blog/PostMetadata.astro) with two variants:

- **Full variant**: Shows all metadata with author links and detailed reading time
- **Card variant**: Compact display for post listings

**Displayed Information**:

- Author avatars and names (with links in full variant)
- Publication date with calendar icon
- Last updated date (if different from publication)
- Subpost count (for parent posts)
- Reading time with word count (individual + combined for parent posts)

## Post Navigation

Navigation is automatically generated by [PostManager.getNavigation()](../src/lib/blog/index.ts:145):

- **Newer post**: Next post chronologically
- **Older post**: Previous post chronologically
- **Parent post**: For subposts only
- Rendered by [PostNavigation component](../src/components/blog/PostNavigation.astro)

## List of subposts (Left sidebar or Header)

For posts with subposts, a navigation sidebar is shown:

- Lists all subposts under the parent
- Highlights current active post
- Rendered by [SubpostsSidebar](../src/components/blog/SubpostsSidebar.astro) and [SubpostsHeader](../src/components/blog/SubpostsHeader.astro)

## Table of content (Right sidebar or Header)

Generated from markdown headings:

- Supports hierarchical structure (H2-H6)
- Maximum depth controlled by `SITE.tocMaxDepth` in [site.config.ts](../src/site.config.ts)
- Includes subpost headings for parent posts
- Rendered by [TOCSidebar](../src/components/blog/TOCSidebar.astro) and [TOCHeader](../src/components/blog/TOCHeader.astro)
- TOC generation handled by [TOCManager](../src/lib/blog/toc.ts)

## Content from Markdown and MDX

Post content is rendered using Astro's content rendering:

- Processed by [src/pages/blog/[...id].astro](../src/pages/blog/[...id].astro:40)
- Wrapped in semantic `<article>` element with prose styling

## Scroll-to-top Button

Provided by [BackToTop component](../src/components/base/BackToTop.astro) for improved navigation.

# Automatic content transformation

The blog system applies several automatic transformations to content during build time:

## Headings are normalized

Headings are automatically normalized to create proper document hierarchy:

- Implemented via [src/plugins/remark-normalize-headings.ts](../src/plugins/remark-normalize-headings.ts)
- Ensures all headings start from H2 (since post title is H1)
- Eliminates gaps in heading hierarchy

## Links to headings are auto-generated

Automatic anchor links are added to all headings:

- Implemented via `rehype-autolink-headings` plugin in [astro.config.ts](../astro.config.ts:97)
- Appends 🔗 emoji link after each heading (`behavior: "append"` configuration)

## Links are distinguishable between external and internal

External links are automatically enhanced:

- Implemented via `rehype-external-links` plugin in [astro.config.ts](../astro.config.ts:88)
- External links open in new tab (`target="_blank"`) with security attributes (`rel="nofollow noreferrer noopener"`) and visual indicator (↗ symbol appended)

## Code highlighting

Highlight code in both code blocks (`astro-expressive-code` integration in [astro.config.ts](../astro.config.ts:28)) and in-line code (using `rehype-pretty-code` plugin in [astro.config.ts](../astro.config.ts:106), like `code{:js}`)

- Themes: Catppuccin Macchiato (dark) and Catppuccin Latte (light)
- Features: Collapsible sections, line numbers, syntax highlighting
- Shell commands (bash, zsh, etc.) have line numbers disabled by default

This behavior was inherited from astro-erudite theme. [Click to read more](https://astro-erudite.vercel.app/blog/rehype-patch).

## Mathematics rendering

LaTeX math expressions are supported through KaTeX

- `remark-math` plugin for parsing in [astro.config.ts](../astro.config.ts:119)
- `rehype-katex` plugin for rendering in [astro.config.ts](../astro.config.ts:104)

## Content sectioning

Heading and its respective content is automatically wrapped inside semantic sections (<section> tag) using `remark-sectionize` plugin in [astro.config.ts](../astro.config.ts:117)

## Emojis

Other than inserting emojis directly, emoji shortcode, like :sparkles: is supported using `remark-emoji` plugin in [astro.config.ts](../astro.config.ts:120)

## [Optional plugin] Obsidian-flavored markdown with wikilinks, backlinks, and callouts

See [plugins documentation](../context/plugins.md) for additional Obsidian integration features.

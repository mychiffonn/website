# Customize Astro Scholar

Start with content and configuration. Move into CSS, icons, and Markdown
pipeline changes only after the site builds with your own data.

## 1. Replace content

Most site content lives in `src/content/`.

- `src/content/about.md`: about-page prose.
- `src/content/now.md`: `/now`.
- `src/content/tech.md`, `src/content/misc.md`, `src/content/services.md`:
  homepage/profile sections.
- `src/content/blog/`: blog posts and subposts.
- `src/content/projects/`: project cards and project detail pages.
- `src/content/updates/`: timeline updates.
- `src/content/experience.json`: education, research, and teaching timeline.
- `src/content/people.toml`: authors used by blog posts.
- `src/content/publications/main.bib`: BibTeX source for `/publications`.

Blog posts use Markdown, not MDX. Required frontmatter is:

```yaml
---
title: Example post
description: Short social and SEO description.
createdAt: 2026-01-15
tags:
  - research
authors:
  - your-author-id
draft: false
---
```

Subposts are folders under `src/content/blog/` with an `index.md` parent and
ordered child `.md` files. Prefix a Markdown filename with `_` if you do not want
the loader to collect it.

## 2. Replace public assets

Static files live in `public/` and are served from the site root.

- Favicons and app icons: `public/favicon.ico`, `public/favicon.svg`,
  `public/apple-touch-icon.png`, `public/web-app-manifest-*.png`.
- Web manifest: `public/site.webmanifest`.
- Social fallback image: `public/img/social-preview.png`.
- Documents: `public/doc/`.
- Fonts: `public/fonts/`.

If you remove or rename an asset, update paths in `src/site.config.ts`, Markdown
frontmatter, and any page/component references.

## 3. Configure identity, navigation, and metadata

Edit `src/site.config.ts`.

- `SITE`: title, description, canonical URL, author, default images, locale,
  blog pagination, table-of-contents depth, share actions, favicon, and content
  license.
- `PROFILE`: name, tagline, email, pronunciation, pronouns, and social links.
- `NAV_LINKS`: top-level header navigation.
- `PUB_CONFIG`: publication author highlighting and equal-contribution symbols.
- `FOOTER`: source links, footer links, and theme credits.

The config is validated in development with Zod schemas from `src/schemas.ts`.
If a dev server or build fails, read the schema error before changing layout code.

## 4. Change routes and pages

Pages live in `src/pages/`.

- Remove a page by deleting its route file and removing any navigation link.
- Add a simple content page by following `src/pages/now.astro` or
  `src/pages/uses.astro`.
- Add collection-backed pages by following `src/pages/projects/index.astro` and
  `src/pages/projects/[...id].astro`.

Keep route changes paired with `src/site.config.ts`, `src/content.config.ts`,
and sitemap filtering in `astro.config.ts`.

## 5. Change colors

Theme colors are CSS custom properties in `src/styles/color.css`.

The palette uses OKLCH and `light-dark()`:

```css
:root {
  --background: light-dark(oklch(...), oklch(...));
  --foreground: light-dark(oklch(...), oklch(...));
  --primary: light-dark(oklch(...), oklch(...));
}
```

Change semantic tokens instead of hard-coding colors in components:

- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`
- `--border`, `--ring`

Check both light and dark modes after changing colors. The theme toggle relies on
`color-scheme` and `[data-theme]` selectors in the same file.

## 6. Change typography, spacing, and shape

- Fonts: `src/styles/fonts.css` and `public/fonts/`.
- Type scale and prose measure: `src/styles/typography.css`.
- Heading treatment: `src/styles/typography-headings.css`.
- Utopia spacing and grid tokens: `src/styles/layout.css`.
- Radius and motion tokens: `src/styles/shape.css`.

Prefer adjusting tokens first. Component-local CSS should consume those tokens
instead of creating one-off visual systems.

## 7. Change icons

Astro Scholar supports three icon paths:

1. Semantic names in `src/icon.config.ts`, such as `blog`, `research`, or
   `arrow-right`.
2. Direct Iconify names from installed sets, such as `mingcute:github-line`.
3. Local SVG files in `src/assets/icons/`, referenced by filename without
   `.svg`.

To add a profile link type, add a key to `PROFILE_ICON_MAP` in
`src/icon.config.ts`, then use that key in `PROFILE.links`.

To add a new Iconify set:

```bash
pnpm add @iconify-json/<set-name>
```

Then import it and register it in `src/lib/icons.ts`.

## 8. Change callouts, math, code, and Markdown behavior

Markdown behavior is configured in `astro.config.ts` through Sätteri plugins.

Current features include:

- Directive and Obsidian-style callouts from `src/lib/callout.ts`.
- Inline and display math from `src/lib/math.ts`.
- Code highlighting from `src/lib/expressive-code/`.
- External-link attributes from `src/lib/external-links.ts`.
- Heading ids and anchor links from `src/lib/heading-namespace.ts` and
  `src/lib/heading-anchors.ts`.
- Sidenotes from `src/plugins/rehype-sidenotes.ts`.

Use Markdown directives for callouts:

```md
:::note[Optional label]
Callout body.
:::
```

or Obsidian-style callouts:

```md
> [!warning]- Collapsed warning
> Callout body.
```

## 9. Change publications

Publications are loaded from `src/content/publications/main.bib` and rendered by
`src/lib/publications/` plus `src/components/publications/PubCard.astro`.

Use BibTeX fields consistently. Link-like fields are mapped to icons by
`PUBLICATION_LINK_TYPES` in `src/icon.config.ts`. If you add a custom BibTeX
field for links, add a matching entry there.

## 10. Agent workflow

When using a coding agent:

1. Ask it to read `docs/INSTALL.md`, this file, `src/site.config.ts`,
   `src/content.config.ts`, and `src/icon.config.ts` first.
2. Replace content before redesigning components.
3. Run `pnpm build` after content changes.
4. Run `pnpm format:check`, `pnpm lint`, and `pnpm astro check` before opening a
   pull request.
5. Take screenshots of at least `/`, `/blog`, `/projects`, `/publications`, and
   one post page after visual changes.

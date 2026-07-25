# Astro Scholar Agent Guide

This repository is an Astro theme for academic portfolios and research blogs.
Preserve its static-first, Markdown-first design and keep it reusable beyond the
sample personal site.

## Installation

- Read `package.json`, `astro.config.ts`, and `docs/INSTALL.md` before changing
  dependencies, scripts, adapters, or deployment behavior.
- Use Node.js `>=22.12.0` and pnpm because the repository has a
  `pnpm-lock.yaml`.
- For a new site, follow Astro's
  [starter-template instructions](https://docs.astro.build/en/install-and-setup/#use-a-theme-or-starter-template)
  and run:

```bash
pnpm create astro@latest --template mychiffonn/astro-scholar
```

- Prefer Astro's native commands and integrations over hand-written setup
  instructions.
- Keep the default output static. Add a server adapter only when a requested
  feature requires on-demand rendering.

## Current Astro guidance

- Astro APIs and integrations change. Consult Astro's
  [Build with AI guide](https://docs.astro.build/en/guides/build-with-ai/) and
  current documentation before relying on model memory.
- When MCP is available, connect the official Astro Docs server at
  `https://mcp.docs.astro.build/mcp` so agents can retrieve current framework
  documentation.
- Before adding an integration, read Astro's
  [integrations guide](https://docs.astro.build/en/guides/integrations/) and the
  integration's own documentation.
- Use `pnpm astro add <integration>` for supported integrations. The command
  installs dependencies and updates `astro.config.ts`; some community
  integrations still require manual configuration.
- Do not add a framework integration or server adapter unless the requested
  feature needs it.

## Customization

- Read `docs/CUSTOMIZATION.md`, `src/site.config.ts`, `src/content.config.ts`,
  and the relevant schema before editing user-facing configuration or content.
- Treat `src/site.config.ts`, `src/content/`, `src/assets/`, and `public/` as the
  primary customization surfaces.
- Preserve content collection validation and useful schema errors.
- Reuse existing color, typography, spacing, shape, motion, card, button, and
  disclosure primitives before introducing new styles.
- Check both light and dark modes after visual changes.

## Blog: Writing in Markdown

- Blog entries live in `src/content/blog/`; a folder with `index.md` and child
  posts creates a post/subpost series.
- Use Markdown rather than MDX unless interactive components inside prose are
  essential.
- The configured Sätteri pipeline supports GFM, directives and callouts,
  LaTeX-style math rendered by Temml, wikilinks, code highlighting, heading
  anchors, external links, and sidenotes.
- Keep demo content public, reusable, and free of private personal information.
- Supply descriptive image alt text and valid author references.

## Development and build

- Read `DEVELOPMENT.md` and follow nearby component patterns.
- Prefer native Astro, semantic HTML, and native CSS before adding client-side
  JavaScript or a UI framework.
- Keep functions and components single-purpose.
- Preserve existing user changes in a dirty worktree and avoid unrelated
  rewrites.
- Do not add hardcoded secrets, debug output, commented-out code, or AI
  attribution.

## Formatting, linting, and validation

- Biome is the formatter for Astro, JavaScript, TypeScript, CSS, JSON, and other
  supported repository files.
- oxlint is the JavaScript and TypeScript linter. It complements Biome; the
  Biome linter is intentionally disabled.
- `pnpm lint:styles` enforces the repository's small set of CSS architecture
  invariants that neither formatter nor oxlint covers.
- Format touched files, then run the narrowest relevant check. Before handoff,
  run:

```bash
pnpm format:check
pnpm lint
pnpm lint:styles
pnpm test:markdown
pnpm astro check
pnpm build
```

- For visual work, inspect the affected pages at desktop and mobile widths and
  verify keyboard, hover, focus, light, and dark states as applicable.

## Publishing

- Read the theme checklist in `DEVELOPMENT.md` before a release or Astro theme
  directory submission.
- Keep `package.json`, the README version badge, screenshots, and release post
  aligned with the release version.
- Run the complete validation suite and inspect the production build in both
  color modes.
- Do not commit generated output from `dist/`, `.astro/`, `.playwright-cli/`,
  or `output/`.
- Use one to four 1600×900 desktop previews for the Astro theme directory; do
  not substitute tall full-page captures.

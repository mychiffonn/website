# My (Chiffon) Nguyen website

[![Version](https://img.shields.io/badge/version-v2.2.5-blue?style=for-the-badge)](https://github.com/mychiffonn/astro-scholar/releases) [![Astro 7](https://img.shields.io/badge/Astro_7-BC52EE?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build) [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

![Astro Scholar social preview](public/img/social-preview.png)

**If you want to clone my website, see my [Astro theme](https://astro-scholar.pages.dev/)**. The repository with more information is [here](https://astro-scholar.pages.dev/).

Astro Star Scholar is an [Astro](https://docs.astro.build/en/concepts/why-astro/) theme for academic personal sites, research blogs, projects, publications, and more pages. It packages the design and publishing system behind [My (Chiffon) Nguyen's website](https://mychiffonn.com) as a reusable open-source starter.

## Previews

| Home                                                | Projects                                                    |
| --------------------------------------------------- | ----------------------------------------------------------- |
| ![Home page preview](docs/assets/previews/home.png) | ![Projects page preview](docs/assets/previews/projects.png) |

| Publications                                                        | Uses                                                |
| ------------------------------------------------------------------- | --------------------------------------------------- |
| ![Publications page preview](docs/assets/previews/publications.png) | ![Uses page preview](docs/assets/previews/uses.png) |

| Blog index (light)                                               | Blog post (light)                                                    |
| ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| ![Blog index in light mode](docs/assets/previews/blog-light.png) | ![Blog post in light mode](docs/assets/previews/blog-post-light.png) |

| Blog index (dark)                                              | Blog post (dark)                                                   |
| -------------------------------------------------------------- | ------------------------------------------------------------------ |
| ![Blog index in dark mode](docs/assets/previews/blog-dark.png) | ![Blog post in dark mode](docs/assets/previews/blog-post-dark.png) |

## Features

- Astro 7 with a static-first, content-focused build and support for Astro's
  integration ecosystem.
- Academic profile, projects, updates, blog posts, authors, and publications.
- SEO-included: sitemap, robots.txt, Open Graph metadata, and generated social images.
- Publications rendered from a BibTeX file.
- Markdown-first writing with Sätteri, callouts, math, code highlighting, heading
  anchors, and sidenotes.
- Blog post/subpost system with tags, stages, table of contents, share actions,
  and multiple authors.
- Native CSS with little interaction scripts shipped.
- Local and Iconify-backed SVG icon system.
- Type-safe config and content schemas with Zod.

## Getting Started

Have Node.js `>=22.12.0` and pnpm installed. Create a site directly from the
GitHub starter:

```bash
pnpm create astro@latest --template mychiffonn/website
```

Astro's wizard asks for the destination, installs dependencies, and can
initialize Git. See Astro's official
[install and starter-template guide](https://docs.astro.build/en/install-and-setup/#use-a-theme-or-starter-template)
for branch and repository URL options.

Then:

1. Start the development server with `pnpm dev`.
2. Visit <http://localhost:4321>.
3. Follow [docs/INSTALL.md](docs/INSTALL.md) to configure the starter.
4. Personalize content and design with
   [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md).

To contribute to the theme itself, clone this repository and run
`corepack enable && pnpm install`.

## Astro and AI-assisted development

Astro's [Build with AI guide](https://docs.astro.build/en/guides/build-with-ai/)
explains how to give coding agents current Astro documentation instead of
relying on potentially stale framework knowledge. This repository also includes
[AGENTS.md](AGENTS.md) with the theme's installation, customization,
development, validation, and publishing conventions.

For supported adapters and integrations, use Astro's setup command:

```bash
pnpm astro add <integration>
```

The command installs the package and updates `astro.config.ts`. Read the
[Astro integrations guide](https://docs.astro.build/en/guides/integrations/)
and the selected integration's documentation first; the theme does not require
a UI framework or server adapter for its default static build.

## Built With

This theme is built on enscribe's
[astro-erudite](https://github.com/jktrn/astro-erudite) v2.0.1, and references
from [Maggie Appleton](https://github.com/MaggieAppleton/maggieappleton.com-V3)'s
digital garden and al-folio.

## Development

- [DEVELOPMENT.md](DEVELOPMENT.md): architecture, commands, Erudite v2
  principles, and theme publishing checklist.
- [CONTRIBUTING.md](CONTRIBUTING.md): contribution workflow and pull request
  expectations.

Common checks:

```bash
pnpm format:check
pnpm lint
pnpm lint:styles
pnpm test:markdown
pnpm astro check
pnpm build
```

# Install Astro Scholar

Astro Scholar is a source theme for academic portfolios and research blogs. The
recommended setup uses Astro's project wizard with this GitHub repository as the
template. This keeps installation aligned with Astro instead of duplicating
framework setup steps here.

## Requirements

- Node.js `>=22.12.0`
- pnpm `10.x`
- Git

See Astro's current [installation prerequisites][astro-install] if your local
toolchain is not ready. This repository includes `pnpm-lock.yaml`, so use pnpm
for dependency and lockfile changes.

## Create your site from the theme

Astro's `create astro` command can initialize a project from any public GitHub
repository:

```bash
pnpm create astro@latest --template mychiffonn/astro-scholar
```

Choose a new directory name when prompted. The wizard can install dependencies
and initialize Git for you. See Astro's
[theme and starter template instructions][astro-template] for all supported
template formats and branch selection.

To contribute to Astro Scholar itself, clone this repository instead:

```bash
git clone https://github.com/mychiffonn/astro-scholar.git
cd astro-scholar
corepack enable
pnpm install
```

Start Astro's development server:

```bash
pnpm dev
```

Open <http://localhost:4321>.

## Personalize the starter

1. Set your canonical `site` URL in `astro.config.ts`. Astro uses this value for
   canonical URLs and the sitemap. See the [`site` configuration reference][site].
2. Update `SITE`, `PROFILE`, `NAV_LINKS`, `PUB_CONFIG`, and `FOOTER` in
   `src/site.config.ts`.
3. Replace the example collections in `src/content/`. Astro Scholar uses
   [Astro content collections][content-collections] for typed blog, project,
   people, and experience data.
4. Replace the avatar in `src/assets/` and site files in `public/`.
5. Follow [CUSTOMIZATION.md](CUSTOMIZATION.md) for content schemas, colors,
   typography, icons, and Markdown features.

## Astro integrations

The starter already configures the official [`@astrojs/sitemap` integration][sitemap].
Astro Scholar's RSS feed uses Astro's official [`@astrojs/rss` package][rss].
Keep `site` accurate so both produce your production URLs.

Use Astro's integration command when you intentionally add an official adapter
or supported integration:

```bash
pnpm astro add <integration>
```

The command installs the package and updates `astro.config.ts`. Read
[Astro's integrations guide][integrations] and the integration's own guide
before adding it. A front-end framework or server adapter is not required for
the theme's default static build.

## Check the production build

```bash
pnpm sync
pnpm format:check
pnpm lint
pnpm lint:styles
pnpm test:markdown
pnpm astro check
pnpm build
pnpm preview
```

`pnpm build` writes the static site to `dist/`. `pnpm preview` serves that build
locally. Check navigation, images, `/rss.xml`, the generated sitemap, and social
preview images before deploying.

Astro documents these commands in its
[develop and build guide][develop-and-build].

## Deploy

Astro Scholar uses Astro's default static output, so it does not need a server
adapter on a static host. Follow the official guide for your provider instead of
copying provider settings from this repository:

- [Deployment overview][deploy]
- [Vercel][vercel] — static Astro sites deploy with zero configuration.
- [Netlify][netlify] — static Astro sites need no adapter.
- [GitHub Pages][github-pages] — use Astro's official GitHub Action and configure
  `site` and, for project pages, `base` as documented.

Only add a provider adapter with `pnpm astro add` if you switch to on-demand
rendering or need provider-specific server features.

[astro-install]: https://docs.astro.build/en/install-and-setup/#prerequisites
[astro-template]: https://docs.astro.build/en/install-and-setup/#use-a-theme-or-starter-template
[content-collections]: https://docs.astro.build/en/guides/content-collections/
[deploy]: https://docs.astro.build/en/guides/deploy/
[develop-and-build]: https://docs.astro.build/en/develop-and-build/
[github-pages]: https://docs.astro.build/en/guides/deploy/github/
[integrations]: https://docs.astro.build/en/guides/integrations/
[netlify]: https://docs.astro.build/en/guides/deploy/netlify/
[rss]: https://docs.astro.build/en/recipes/rss/
[site]: https://docs.astro.build/en/reference/configuration-reference/#site
[sitemap]: https://docs.astro.build/en/guides/integrations-guide/sitemap/
[vercel]: https://docs.astro.build/en/guides/deploy/vercel/

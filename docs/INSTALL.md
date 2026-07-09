# Install Astro Scholar

Astro Scholar is an Astro theme source repository. Use it like a template: fork
or clone it, replace the sample personal content with your own, then deploy the
generated static site.

## Requirements

- Node.js `>=22.12.0`
- pnpm `10.x`
- Git

This repository includes `pnpm-lock.yaml`, so use pnpm instead of npm or yarn.

## Start locally

```bash
git clone https://github.com/mychiffonn/astro-scholar.git
cd astro-scholar
corepack enable
pnpm install
pnpm dev
```

Open <http://localhost:4321>.

If you are working from the current personal-site repository instead of the
future template repository, clone that repo first and follow the same commands.

## Verify before publishing

```bash
pnpm sync
pnpm format:check
pnpm lint
pnpm astro check
pnpm build
pnpm preview
```

`pnpm build` writes the production site to `dist/`. `pnpm preview` serves that
build locally so you can check links, images, RSS, sitemap output, and generated
Open Graph images.

## Deploy

Astro Scholar builds as a static site, so any static host works.

### Vercel

1. Create a new Vercel project from your GitHub repository.
2. Use the Astro preset if Vercel detects it.
3. Set the install command to `pnpm install --frozen-lockfile`.
4. Set the build command to `pnpm build`.
5. Set the output directory to `dist`.

### Netlify

1. Create a new Netlify site from your GitHub repository.
2. Set build command to `pnpm build`.
3. Set publish directory to `dist`.

### GitHub Pages

1. Change `site` in `astro.config.ts` to the final GitHub Pages URL.
2. Keep `trailingSlash: "never"` unless you intentionally change URL style.
3. Add a Pages workflow or deploy `dist/` with your preferred action.

## Fresh demo repository

For a public Astro theme, keep two repositories if possible:

- `astro-scholar`: the template users click "Use this template" from.
- `astro-scholar-demo`: a freshly deployed demo using the template.

The demo repo can either keep normal sample posts in `src/content/blog` or source
posts from `docs/` to make the documentation double as demo content. If you want
the latter, change the blog collection loader in `src/content.config.ts` from:

```ts
glob({ pattern: "**/*.md", base: "./src/content/blog" })
```

to:

```ts
glob({ pattern: "**/*.md", base: "./docs" })
```

Then keep only publishable demo articles in `docs/`, because every matching
Markdown file must satisfy the blog schema frontmatter.

## First setup checklist

1. Update `astro.config.ts`:
   - `site`: canonical production URL.
   - `image.remotePatterns`: external image hosts you use.
2. Update `src/site.config.ts`:
   - `SITE`, `PROFILE`, `NAV_LINKS`, `PUB_CONFIG`, and `FOOTER`.
3. Replace content in `src/content/`.
4. Replace static assets in `public/`.
5. Replace `src/assets/avatar.jpg`.
6. Run `pnpm build` and fix content schema errors.
7. Deploy and confirm `/rss.xml`, `/sitemap-index.xml`, `/robots.txt`, and social
   preview images.

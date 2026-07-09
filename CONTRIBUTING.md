# Contributing

Thanks for helping improve Astro Scholar. This project is both a personal-site
codebase and a theme template, so changes should keep the theme reusable for
other researchers, students, and builders.

## Before you start

1. Read `docs/INSTALL.md`.
2. Read `docs/CUSTOMIZATION.md` if your change affects theme users.
3. Read `DEVELOPMENT.md` if your change affects architecture, CSS, Markdown, or
   publishing workflow.
4. Open an issue first for large visual redesigns, schema changes, routing
   changes, or dependency additions.

## Local setup

```bash
corepack enable
pnpm install
pnpm dev
```

## Pull request checklist

- Keep changes focused.
- Add or update docs when behavior, configuration, or user workflow changes.
- Avoid new dependencies unless the feature clearly needs them.
- Preserve static output and low client-side JavaScript.
- Run:

```bash
pnpm format:check
pnpm lint
pnpm astro check
pnpm build
```

- Include screenshots for visual changes.

## Commit style

Use clear, descriptive commit messages:

```text
Add publication keyword filtering docs
Fix project category chip state
```

Do not add AI attribution or co-author lines.

## Reporting bugs

Include:

- What page or command failed.
- Expected behavior.
- Actual behavior.
- Node and pnpm versions.
- Relevant console output or build errors.
- Screenshots for visual bugs.

## Proposing features

Explain:

- The user problem.
- The pages/components affected.
- Whether it adds dependencies or client JavaScript.
- How it fits the theme's academic/personal-site use case.

Features that improve content portability, performance, accessibility, or
customization are more likely to fit the project than broad UI framework
rewrites.

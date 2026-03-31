# My (Chiffon) Nguyen's Academic Website

[![Version](https://img.shields.io/badge/version-v1.1.2-blue?style=for-the-badge)](https://github.com/mychiffonn/website/releases) [![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge)](LICENSE) [![Astro 6](https://img.shields.io/badge/Astro_6-BC52EE?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build) [![MDX](https://img.shields.io/badge/MDX-1B1F24?style=for-the-badge&logo=mdx&logoColor=white)](https://mdxjs.com/) [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![TailwindCSS 4](https://img.shields.io/badge/TailwindCSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/) [![Catppuccin](https://img.shields.io/badge/Catppuccin-F5E0DC?style=for-the-badge&logo=catppuccin&logoColor=11111b)](https://catppuccin.com/palette/) [![Prettier](https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7BA3E)](https://prettier.io/) [![oxlint](https://img.shields.io/badge/oxlint-000000?style=for-the-badge&logo=rust&logoColor=white)](https://oxc-project.github.io/docs/guide/usage/linter.html)

![](public/img/social-preview.png)

[View design on Canva](https://www.canva.com/design/DAGsRHHhIqQ/ePJ1pDEP4iyrbvmgUiuwIA/edit?utm_content=DAGsRHHhIqQ&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

This website serves as a digital portfolio and blog where I share my work, insights, and journey in academia (NLP+HCI), technology, and anything I'm interested in. Co-created with Claude Code.

> 🌱 Theme will be refactored to "astro-scholar" and posted to Astro community once all features are complete.

## Features

- ⚡ Fast loading, build, and previewing with Astro 5 as static generator
- 💻 Showcase projects, news, blog posts, and publications from .bib file
- ✏️ Writing in Github-flavored markdown, a subset of Obsidian-flavored markdown (wikilinks + callouts), KaTeX-rendered math, code (block and inline, supported by Expressive Code), and embeds
- 📝 Blog supports post-subpost system, with tags and multiple authors
- 🌐 i18n: Support non-English scripts, and (upcoming) i18n page routing and language toggle
- 👩‍💻 Developer experience: type-safe with zod-first schema and TypeScript
- 🔎 SEO friendly and ARIA accessibility compliant
- 🔧 Easily configure [theme](src/styles/global.css), [page & personal information](src/config.ts), [content](src/content)
- 💬 Show mentions of a post across the web (via [webmention.io](https://webmention.io)) in lieu of comment section
- [UPCOMING] Search with pagefind/typesense

## Built With

This website is built on enscribe's [astro-erudite](https://github.com/jktrn/astro-erudite) template and references from [Maggie Appleton](https://github.com/MaggieAppleton/maggieappleton.com-V3)'s digital garden.

Other inspirations:

- [PreviewCard](src/components/blog/PreviewCard.astro) inspired by cworld1's [pure](https://astro-pure.js.org/) theme
- Publications from [al-folio](https://github.com/alshedivat/al-folio)

## Getting Started

Have Node.js >= 22 (tested with Node 24) and pnpm installed:

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Start development server: `pnpm dev`
4. Visit `http://localhost:4321`
5. Read docs or search `TODO` across the codebase to complete setup
6. Search `OPTIONAL` to customize as needed (color themes, icons, etc)

# My (Chiffon) Nguyen's Academic Website

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/tiny.svg)](https://astro.build)

![](public/img/social-preview.png)

This website serves as a digital portfolio and blog where I share my work, insights, and journey in academia (NLP+HCI), technology, and anything I'm interested in. Co-created with Claude Code.

> ⚠️ Warning: Unstable. Theme will be refactored to "astro-academic" and posted to Astro community once all features are complete.

## Features

- ⚡ Fast loading, build, and previewing with Astro 5 as static generator
- 💻 Showcase projects, news, blog posts, and publications from .bib file
- ✏️ Github-flavored markdown with KaTeX-rendered math, code highlighting (block and inline), and embeds
- 📝 Blog supports post-subpost system, with tags and multiple authors
- 🌐 i18n: Support non-English scripts, and (upcoming) i18n page routing and language toggle
- 👩‍💻 Developer experience: type-safe with zod-first schema and TypeScript
- 🔎 SEO friendly and ARIA accessibility compliant
- 🔧 Easily configure [theme](src/styles/global.css), [page & personal information](src/config.ts), [content](src/content)
- [IN PROGRESS] Obsidian-flavored markdown with wikilinks and callouts (no backlinks yet).
- [UPCOMING] Show mentions of a post across the web in lieu of comment section
- [UPCOMING] Search with pagefind/typesense
- [UPCOMING] Render /media library from .json and from scraped Storygraph

## Built With

This website is built on enscribe's [astro-erudite](https://github.com/jktrn/astro-erudite) template and references from [Maggie Appleton](https://github.com/MaggieAppleton/maggieappleton.com-V3)'s digital garden:

- [Astro](https://astro.build/) - Modern content-driven web framework
- [TailwindCSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- Markdown and [MDX](https://mdxjs.com/) (the latter uses [@astrojs/mdx](https://docs.astro.build/en/guides/integrations-guide/mdx/) to inject astro components in markdown)

Other inspirations:

- [PreviewCard](src/components/blog/PreviewCard.astro) inspired by cworld1's [pure](https://astro-pure.js.org/) theme
- [Color palettes](src/styles/global.css) from [catpuccin](https://catppuccin.com/palette/)
- Publications from [al-folio](https://github.com/alshedivat/al-folio)

## Getting Started

Have Node.js >= 20 (tested with Node 24) and pnpm installed:

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Start development server: `pnpm dev`
4. Visit `http://localhost:4321`

## License

[Apache License 2.0](LICENSE).

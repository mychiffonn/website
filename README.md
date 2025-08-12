# My (Chiffon) Nguyen's Academic Website

This is my personal academic website built with Astro, showcasing my research, projects, and
thoughts as a researcher, developer, teacher, and life-long learner.

This website serves as a digital portfolio and blog where I share my work, insights, and journey in
academia (NLP+HCI), technology, and anything I'm interested in.

## Built With

This website is built on enscribe's [astro-erudite](https://github.com/jktrn/astro-erudite)
template and references from [Maggie Appleton](https://github.com/MaggieAppleton/maggieappleton.com-V3)'s digital garden:

- [Astro](https://astro.build/) - Modern content-driven web framework
- [TailwindCSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- Markdown and [MDX](https://mdxjs.com/) (the latter uses [@astrojs/mdx](https://docs.astro.build/en/guides/integrations-guide/mdx/) to inject astro components in markdown)

Other inspirations:

- [PreviewCard](src/components/blog/PreviewCard.astro) inspired by cworld1's
  [pure](https://astro-pure.js.org/) theme
- [Color palettes](src/assets/styles/global.css) from [catpuccin](https://catppuccin.com/palette/)
- Projects and publications from [al-folio](https://github.com/alshedivat/al-folio)

## Getting Started

Assume Node.js >= 22 and pnpm installed:

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Start development server: `pnpm dev`
4. Visit `http://localhost:4321`

## License

[Apache License 2.0](LICENSE).

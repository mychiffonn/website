---
title: Astro Scholar theme is ready
description: A theme built for academic portfolios, lab website, and technical writing that are easy to use and maintain (Markdown & TeX), thoughtfully designed, and extensible.
createdAt: 2026-07-24T12:00:00
updatedAt: 2026-07-28T00:41:00.000-07:00
image: ./assets/astro-scholar-release.png
tags:
  - astro
  - release
  - theme
authors:
  - mychiffon
stage: evergreen
audience: Researchers, students, and technical writers looking for an Astro portfolio and blog theme.
---

Astro Scholar 2.1.0 turns the site behind my portfolio into a reusable
open-source theme for **academic profiles**, _research blogs_, projects, and
publications. What began as a personal site is now a starter that other
researchers can install, understand, and make their own.[^portable]

![A light and dark research workspace with connected publication, code, chart, and writing cards.](./assets/astro-scholar-release.png)

:::note[Start from the theme]
Create a new site with
`pnpm create astro@latest --template mychiffonn/astro-scholar`, then follow [the repository documentation](https://github.com/mychiffonn/astro-scholar)
:::

## What ships in 2.1

The release brings the portfolio and the writing system together instead of
treating the blog as an afterthought:

| Surface              | What it is designed to show                             |
| -------------------- | ------------------------------------------------------- |
| Profile and timeline | Research interests, experience, teaching, and updates   |
| Projects             | Methods, artifacts, collaborators, code, and outcomes   |
| Publications         | BibTeX-backed papers with abstracts and resource links  |
| Research blog        | Long-form arguments, working notes, and connected ideas |
| Uses page            | The tools and practices behind the work                 |

The interface uses native CSS, very little client-side JavaScript, typed content
collections, and a responsive light/dark theme. Publications, projects, tags,
stages, RSS, sitemap, social images, and author profiles are included.

- [x] Reusable installation and customization guides
- [x] Desktop previews for the Astro theme directory
- [x] Light and dark blog previews
- [x] Automated formatting, linting, Markdown tests, type checks, and builds
- [ ] Your own research and writing

## Technical writing stays readable

Research writing moves between prose, evidence, equations, code, and
qualifications. Astro Scholar keeps those forms in ordinary Markdown instead of
requiring a custom component for each one.

For example, Bayes' rule can sit inline,
$p(\theta \mid D) \propto p(D \mid \theta)p(\theta)$, or expand into a display:

$$
p(\theta \mid D)
= \frac{p(D \mid \theta)\,p(\theta)}
       {\int p(D \mid \theta)\,p(\theta)\,d\theta}
$$

The configured Sätteri pipeline renders the expression as semantic MathML with
Temml. It also supports syntax-highlighted code:

```ts
const release = {
  version: "2.1.0",
  output: "static",
  writing: ["math", "figures", "code", "sidenotes", "wikilinks"],
} as const
```

> A research site should make the path from question to evidence easy to
> inspect—not bury it beneath the machinery of the site.

## A connected research record

Wikilinks connect the release to [[/projects|project notes]],
[[/publications|formal publications]], and [[/now|short updates]]. Ordinary
[Markdown links](https://docs.astro.build/en/guides/markdown-content/) work
alongside them, so the source remains portable.

:::tip{closed}
Callouts can begin collapsed when implementation detail should remain available
without interrupting the main argument.
:::

:::warning[Before upgrading an existing site]
Review your local configuration and content changes before copying release
files. Run the full validation suite after updating dependencies.
:::

Footnotes become margin sidenotes on wide screens and compact disclosures on
narrow ones.[^sidenotes] Figures remain local to the post, with descriptive alt
text and Astro image optimization.

## Built for continued maintenance

Version 2.1 also tightens the less visible parts of the theme: the Astro-native
installation path, current integration guidance, agent-facing project context,
Markdown plugin tests, and small architecture checks that protect shared CSS
patterns.

The result is not a frozen personal-site export. It is a foundation intended to
be forked, adapted, and kept current—whether the next entry is a paper summary,
a tutorial, a lab note, or a reflection that begins with a ~~perfect result~~
better question.

[^portable]: Plain Markdown is easy to search, version, migrate, and reuse outside this theme.

[^sidenotes]: Sidenotes keep citations and qualifications near the claim they support while preserving an accessible reading order.

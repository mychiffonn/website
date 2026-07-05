import { defineConfig } from "astro/config"
import sitemap from "@astrojs/sitemap"
import { satteri } from "@astrojs/markdown-satteri"
import {
  blockExpressiveCode,
  inlineExpressiveCode,
} from "./src/lib/expressive-code"
import { temmlMath } from "./src/lib/math"
import { calloutDirective } from "./src/lib/callout"
import { externalLinks } from "./src/lib/external-links"
import { headingNamespace } from "./src/lib/heading-namespace"
import { headingAnchors } from "./src/lib/heading-anchors"
import { rehypeSidenotes } from "./src/plugins/rehype-sidenotes"
import { remarkNormalizeHeadings } from "./src/plugins/remark-normalize-headings"

export default defineConfig({
  site: "https://mychiffonn.com",
  compressHTML: true,
  trailingSlash: "never",
  output: "static",
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  image: {
    responsiveStyles: true,
    layout: "constrained",
    remotePatterns: [
      { protocol: "data" },
      { protocol: "https", hostname: "gravatar.com" },
    ],
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !/\/blog\/[^/]+\/[^/]+\/?$/.test(page) &&
        !/\/people\/[^/]+\/?$/.test(page) &&
        !page.includes("/blog/tags/"),
    }),
  ],
  server: { port: 4321, host: true },
  devToolbar: { enabled: false },
  markdown: {
    syntaxHighlight: false,
    processor: satteri({
      features: { directive: true, math: true },
      mdastPlugins: [
        remarkNormalizeHeadings,
        calloutDirective,
        inlineExpressiveCode,
        temmlMath,
      ],
      hastPlugins: [
        externalLinks,
        blockExpressiveCode,
        ...rehypeSidenotes(),
        headingNamespace,
        headingAnchors,
      ],
    }),
  },
})

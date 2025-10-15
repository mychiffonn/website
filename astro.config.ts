import { defineConfig } from "astro/config"
import { rehypeHeadingIds } from "@astrojs/markdown-remark"
import mdx from "@astrojs/mdx"
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"
import expressiveCode from "astro-expressive-code"
import icon from "astro-icon"
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections"
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers"

import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeExternalLinks from "rehype-external-links"
import rehypeKatex from "rehype-katex"
import rehypePrettyCode from "rehype-pretty-code"

import remarkNormalizeHeadings from "./src/plugins/remark-normalize-headings"
import remarkCallout from "@r4ai/remark-callout"
import remarkEmoji from "remark-emoji"
import remarkMath from "remark-math"
import remarkSectionize from "remark-sectionize"

import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  site: "https://mychiffonn.com",
  trailingSlash: "never",
  integrations: [
    expressiveCode({
      themes: ["catppuccin-macchiato", "catppuccin-latte"],
      plugins: [pluginCollapsibleSections(), pluginLineNumbers()],
      themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
      defaultProps: {
        wrap: true,
        collapseStyle: "collapsible-auto",
        overridesByLang: {
          "ansi,bat,bash,batch,cmd,console,powershell,ps,ps1,psd1,psm1,sh,shell,shellscript,shellsession,text,zsh":
          {
            showLineNumbers: false
          }
        }
      },
      styleOverrides: {
        codeFontSize: "0.75rem",
        borderColor: "var(--border)",
        codeFontFamily: "var(--font-mono)",
        codeBackground: "color-mix(in oklab, var(--muted) 25%, transparent)",
        frames: {
          editorActiveTabForeground: "var(--muted-foreground)",
          editorActiveTabBackground: "color-mix(in oklab, var(--muted) 25%, transparent)",
          editorActiveTabIndicatorBottomColor: "transparent",
          editorActiveTabIndicatorTopColor: "transparent",
          editorTabBorderRadius: "0",
          editorTabBarBackground: "transparent",
          editorTabBarBorderBottomColor: "transparent",
          frameBoxShadowCssValue: "none",
          terminalBackground: "color-mix(in oklab, var(--muted) 25%, transparent)",
          terminalTitlebarBackground: "transparent",
          terminalTitlebarBorderBottomColor: "transparent",
          terminalTitlebarForeground: "var(--muted-foreground)"
        },
        lineNumbers: {
          foreground: "var(--muted-foreground)"
        },
        uiFontFamily: "var(--font-sans)"
      }
    }),
    mdx(),
    react(),
    sitemap(),
    icon({
      iconDir: "src/assets/icons/"
    })
  ],
  vite: {
    plugins: [tailwindcss()]
  },
  server: {
    port: 4321,
    host: true
  },
  devToolbar: {
    enabled: false
  },
  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: "_blank",
          rel: ["nofollow", "noreferrer", "noopener"],
          content: { type: "text", value: "↗" }
        }
      ],
      rehypeHeadingIds,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: { className: ["anchor"] },
          content: { type: "text", value: " 🔗" }
        }
      ],
      rehypeKatex,
      [
        rehypePrettyCode,
        {
          theme: {
            light: "catppuccin-latte",
            dark: "catppuccin-macchiato"
          }
        }
      ]
    ],
    remarkPlugins: [remarkMath, remarkEmoji, remarkCallout, remarkNormalizeHeadings, remarkSectionize]
  },
  experimental: {
    contentIntellisense: true,
    headingIdCompat: true
  }
})

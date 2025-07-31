// @ts-check

/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
export default {
  arrowParens: "always",
  bracketSameLine: false,
  bracketSpacing: true,
  embeddedLanguageFormatting: "auto",
  endOfLine: "lf",
  jsxSingleQuote: false,
  htmlWhitespaceSensitivity: "css",
  insertPragma: false,
  printWidth: 100,
  proseWrap: "preserve",
  quoteProps: "as-needed",
  requirePragma: false,
  semi: false,
  singleAttributePerLine: false,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "none",
  useTabs: false,

  // Prettier plugins
  plugins: [
    "prettier-plugin-astro",
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss"
  ],
  importOrder: [
    "<BUILTIN_MODULES>",
    "",
    "^(astro$)",
    "^astro/(.*)$|^astro:(.*)$",
    "^@astrojs/(.*)$",
    "^(.*)/astro|^astro-(.*)",
    "<THIRD_PARTY_MODULES>",
    "",
    "^@/plugins$|^@/plugins/(.*)$",
    "^@/config$",
    "^@/lib$|^@/lib/(.*)$",
    "^@/pages/(.*)$",
    "^@/layouts$|^@/layouts/(.*)$",
    "^@/components$|^@/components/(.*)$",
    "^@/assets/(.*)$",
    "",
    "^[./]",
    ".css$",
    "^content/(.*)$|^src/content/(.*)$",
    ".*\\.md$"
  ],
  importOrderParserPlugins: ["astro", "typescript", "jsx", "decorators-legacy"],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro"
      }
    },
    {
      files: "*.{md,mdx}",
      options: {
        proseWrap: "always",
        printWidth: 100
      }
    },
    {
      files: "*.css",
      options: {
        // Disable Prettier for CSS files to avoid breaking Tailwind arbitrary values
        parser: "css",
        requirePragma: true
      }
    }
  ]
}

import { readdir, readFile } from "node:fs/promises"
import { extname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const sourceRoot = fileURLToPath(new URL("../src/", import.meta.url))
const supportedExtensions = new Set([".astro", ".css", ".js", ".ts"])
const forbiddenPatterns = [
  {
    pattern: /\.style\.display\b/g,
    message: "Use the native hidden attribute instead of inline display state.",
  },
  {
    pattern: /\[style\*=["'][^"']*display/gi,
    message: "Query semantic state, not serialized inline CSS.",
  },
  {
    pattern: /transition\s*:\s*all\b/gi,
    message: "List the properties that actually transition.",
  },
  {
    pattern: /\sstyle\s*=\s*["'][^"']+["']/gi,
    message: "Move static presentation into the component's scoped stylesheet.",
  },
]

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name)
      return entry.isDirectory() ? collectFiles(path) : [path]
    }),
  )
  return files.flat()
}

const violations = []
for (const path of await collectFiles(sourceRoot)) {
  if (!supportedExtensions.has(extname(path))) continue
  const source = await readFile(path, "utf8")
  for (const { pattern, message } of forbiddenPatterns) {
    for (const match of source.matchAll(pattern)) {
      const line = source.slice(0, match.index).split("\n").length
      violations.push(`${relative(sourceRoot, path)}:${line}: ${message}`)
    }
  }
}

if (violations.length > 0) {
  console.error(violations.join("\n"))
  process.exitCode = 1
} else {
  console.log("Style architecture checks passed.")
}

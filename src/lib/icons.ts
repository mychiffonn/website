import academiconsIcons from "@iconify-json/academicons/icons.json"
import mingcuteIcons from "@iconify-json/mingcute/icons.json"
import { getIconData, iconToSVG, replaceIDs } from "@iconify/utils"

import { SEMANTIC_ICONS } from "@icon-config"

export interface ResolvedIcon {
  attributes: Record<string, string>
  body: string
}

const iconSets = {
  academicons: academiconsIcons,
  mingcute: mingcuteIcons,
}

const localIcons = import.meta.glob("../assets/icons/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
})

const parseAttributes = (attributes: string) => {
  const parsed: Record<string, string> = {}
  const attributePattern =
    /([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g

  for (const match of attributes.matchAll(attributePattern)) {
    parsed[match[1]] = match[2] ?? match[3] ?? match[4] ?? ""
  }

  return parsed
}

const parseLocalSVG = (svg: string, icon: string): ResolvedIcon => {
  const match = svg.match(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/i)

  if (!match) {
    throw new Error(`Icon "${icon}" is not a valid inline SVG`)
  }

  return {
    attributes: parseAttributes(match[1]),
    body: match[2].trim(),
  }
}

const cache = new Map<string, ResolvedIcon>()

/**
 * Resolve a semantic, iconify ("prefix:name"), or local (src/assets/icons)
 * icon name to svg attributes and body, at build time. Parsed results are
 * memoized; `replaceIDs` still runs per call so ids stay unique per instance.
 */
export function resolveIcon(name: string): ResolvedIcon {
  const iconName =
    name in SEMANTIC_ICONS
      ? SEMANTIC_ICONS[name as keyof typeof SEMANTIC_ICONS]
      : name

  const cached = cache.get(iconName)
  if (cached)
    return { attributes: cached.attributes, body: replaceIDs(cached.body) }

  let resolved: ResolvedIcon
  if (iconName.includes(":")) {
    const [prefix, iconId] = iconName.split(":")
    const iconSet = iconSets[prefix as keyof typeof iconSets]

    if (!iconSet) {
      throw new Error(
        `Unknown Iconify prefix "${prefix}" for icon "${iconName}"`,
      )
    }

    const iconData = getIconData(iconSet, iconId)

    if (!iconData) {
      throw new Error(`Unknown Iconify icon "${iconName}"`)
    }

    const svg = iconToSVG(iconData, { height: "1em" })
    resolved = { attributes: svg.attributes, body: svg.body }
  } else {
    const svg = localIcons[`../assets/icons/${iconName}.svg`]

    if (typeof svg !== "string") {
      throw new Error(`Unknown local icon "${iconName}"`)
    }

    resolved = parseLocalSVG(svg, iconName)
  }

  cache.set(iconName, resolved)
  return { attributes: resolved.attributes, body: replaceIDs(resolved.body) }
}

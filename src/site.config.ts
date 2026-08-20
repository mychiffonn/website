import type {
  FooterConfig,
  LinkConfig,
  ProfileConfig,
  PublicationConfig,
  SiteConfig,
} from "@/types"

export const SITE: SiteConfig = {
  title: "My Chiffon N.",
  description:
    "AI research for broader world (multilinguality, alignment, human- and animal-compatible AI)",
  href: "https://mychiffonn.com",
  author: "My (Chiffon) Nguyen",
  dir: "ltr",
  defaultPageImage: "/img/social-preview.png",
  defaultPostImage: "/img/social-preview.png",

  locale: {
    lang: "en-US",
    options: {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "America/Los_Angeles", // or your preferred timezone
    },
  },

  // Table of contents depth, shared by any page that renders a TOC (blog posts, projects, etc)
  tocMaxDepth: 3,

  // Blog settings
  blog: {
    featuredPostCount: 3,
    postsPerPage: 8,
    shareActions: ["x"],
  },

  home: {
    careerHighlightCount: 4,
    updateCount: 3,
    publicationCount: 3,
  },

  // Theme settings
  favicon: "/favicon.ico",
  prerender: true,
  npmCDN: "https://cdn.jsdelivr.net/npm",

  // Content license
  license: {
    label: "CC-BY-NC-4.0",
    href: "https://creativecommons.org/licenses/by-nc/4.0/",
  },
}

export const PROFILE: ProfileConfig = {
  name: SITE.author,
  othernames: "Nguyễn Trà My / 阮沐茶 / 윈자미",
  tagline: "AI Research for Broader World & Life-long Learning",
  email: "hi@mychiffonn.com",
  location: "Hanoi, Vietnam",
  pronouns: "she/her",
  pronunciation:
    "My = /me/, Chiffon = /shi-FON/. I'm Chiffon in English-speaking context.",
  // hover or click on "links" to see all profile links supported. or search PROFILE_ICON_MAP in icon.config.ts, the keys are what used here
  links: {
    cv: "/doc/My_Chiffon_Nguyen_CV.pdf",
    resume: "/doc/My_Chiffon_Nguyen_Resume.pdf",
    github: "https://github.com/mychiffonn",
    googleScholar: "https://scholar.google.com/citations?user=a25a-rUAAAAJ",
    orcid: "https://orcid.org/0009-0002-5787-3948",
    openreview: "https://openreview.net/profile?id=~My_Chiffon_Nguyen1",
    x: "https://x.com/mychiffonn",
    // bluesky: "https://bsky.app/profile/mychiffonn.bsky.social",
    // discord: "https://discordapp.com/users/mychiffonn",
  },
  // where the links above show up. true = that section's default set, false or
  // [] = none, or list keys in the order you want them. The header renders its
  // set as bare icons, so it defaults to a handful rather than everything.
  linksPlacement: {
    header: ["email", "cv", "googleScholar", "x"],
    about: false,
    footer: true,
  },
}

export const NAV_LINKS: LinkConfig[] = [
  {
    href: "/projects",
    label: "Projects",
  },
  {
    href: "/publications",
    label: "Publications",
  },
  {
    href: "/teaching",
    label: "Teaching",
  },
  {
    href: "/blog",
    label: "Blog",
  },
  {
    href: "/now",
    label: "Now",
  },
]

export const NAVIGATION: LinkConfig[] = NAV_LINKS.map(({ href, label }) => ({
  href,
  label,
}))

export const PUB_CONFIG: PublicationConfig = {
  maxFirstAuthors: 8,
  maxLastAuthors: 2,
  highlightAuthor: {
    firstName: "My Chiffon",
    lastName: "Nguyen",
    aliases: ["My Nguyen", "M. Nguyen", "Chiffon Nguyen"],
  },
  equalSymbols: {
    first: "*",
    second: "†",
    third: "‡",
    last: "§",
  },
}

export const FOOTER: FooterConfig = {
  credits: true,
  sourceCode: "https://github.com/mychiffonn/website",
  sourceContent: "https://github.com/mychiffonn/website/tree/main/src/content",
  footerLinks: [],
}

if (import.meta.env.DEV && typeof window === "undefined") {
  const {
    FooterConfigSchema,
    ProfileConfigSchema,
    PublicationConfigSchema,
    SiteConfigSchema,
  } = await import("@/schemas")
  SiteConfigSchema.parse(SITE)
  ProfileConfigSchema.parse(PROFILE)
  FooterConfigSchema.parse(FOOTER)
  PublicationConfigSchema.parse(PUB_CONFIG)
}

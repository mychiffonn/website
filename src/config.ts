import type { FooterConfig, ProfileConfig, SiteConfig, SocialLink } from "@/types"

import { validateFooter, validateProfile, validateSiteConfig } from "@/lib/schemas"

export const SITE: SiteConfig = {
  title: "My Chiffon N.",
  description:
    "Researcher, Developer, Teacher, and Life-long Learner focused on making human knowledge work more accessible, productive, collaborative and enjoyable.",
  href: "https://chiffonng.com",
  author: "My (Chiffon) Nguyen",

  locale: {
    lang: "en-US",
    attrs: "en_US",
    dateLocale: "en-US",
    dateOptions: {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  },

  // Blog settings
  featuredPostCount: 2,
  postsPerPage: 8,

  // Theme settings
  favicon: "/favicon.ico",
  prerender: true,
  npmCDN: "https://cdn.jsdelivr.net/npm",

  // Content license
  license: {
    label: "CC-BY-NC-4.0",
    href: "https://creativecommons.org/licenses/by-nc/4.0/"
  }
}

export const PROFILE: ProfileConfig = {
  name: "My (Chiffon) Nguyen",
  tagline: "Researcher, Developer, Teacher, and Life-long Learner",
  location: "San Francisco, CA, USA",
  pronouns: "she/her/hers",
  pronunciation: "My = /me/ or 미 , Chiffon = /shif-ON/, Nguyen = /ngwen/",
  links: {
    email: "chiffonng136@gmail.com",
    github: "https://github.com/chiffonng",
    googleScholar: {
      href: "https://scholar.google.com/citations?user=a25a-rUAAAAJ",
      label: "platform"
    },
    cv: "doc/cv.pdf",
    x: "https://x.com/chiffonng"
  }
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: "/projects",
    label: "Projects"
  },
  {
    href: "/blog",
    label: "Blog"
  },
  {
    href: "/uses",
    label: "Uses"
  },
  {
    href: "/now",
    label: "Now"
  }
]

export const FOOTER: FooterConfig = {
  credits: true,
  sourceCode: "https://github.com/chiffonng/astro-academic",
  footerLinks: []
}

// Validate configuration in development for better DX
if (import.meta.env.DEV) {
  validateSiteConfig(SITE)
  validateProfile(PROFILE)
  validateFooter(FOOTER)
}

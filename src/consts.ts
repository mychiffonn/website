import type { SvgComponent } from "astro/types"
import Email from "@/assets/icons/email.svg"
import GitHub from "@/assets/icons/github.svg"
import RSS from "@/assets/icons/rss.svg"
import Twitter from "@/assets/icons/twitter.svg"
import { NAV_LINKS, PROFILE, SITE as CONFIG_SITE } from "@/site.config"

const emailHref = PROFILE.email ? `mailto:${PROFILE.email}` : undefined

export const SITE = {
  title: CONFIG_SITE.title,
  description: CONFIG_SITE.description,
  locale: CONFIG_SITE.locale.lang,
  dir: "ltr",
  defaultPageImage: "/img/social-preview.png",
  defaultPostImage: "/img/social-preview.png",
} as const

export const NAVIGATION = NAV_LINKS.map(({ href, label }) => ({ href, label }))

export const SOCIALS: { href: string; label: string; icon: SvgComponent }[] = [
  PROFILE.links.github && {
    href:
      typeof PROFILE.links.github === "string"
        ? PROFILE.links.github
        : PROFILE.links.github.href,
    label: "GitHub",
    icon: GitHub,
  },
  PROFILE.links.x && {
    href:
      typeof PROFILE.links.x === "string"
        ? PROFILE.links.x
        : PROFILE.links.x.href,
    label: "X",
    icon: Twitter,
  },
  emailHref && { href: emailHref, label: "Email", icon: Email },
  { href: "/rss.xml", label: "RSS", icon: RSS },
].filter(Boolean) as { href: string; label: string; icon: SvgComponent }[]

/**
 * @fileoverview Unified scroll management for the blog
 * @author My (Chiffon) Nguyen, Claude Code
 * @version 4.0.0
 */

import type { HeadingRegion } from "./types"

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export class UnifiedTOCController {
  private static readonly PROGRESS_CIRCLE_RADIUS = 10
  private static readonly NAV_SETTLE_DELAY_MS = 100
  private static readonly LINK_EMOJI_REGEX = /\s*🔗\s*$/
  private static readonly DEFAULT_SECTION_TEXT = "Overview"
  private activeIds: string[] = []
  private headings: HTMLElement[] = []
  private regions: HeadingRegion[] = []
  private container: HTMLElement | null = null
  private scrollArea: HTMLElement | null = null
  private tocMaxDepth: number = 6

  // Mobile-specific elements
  private progressCircle: SVGCircleElement | null = null
  private currentSectionText: HTMLElement | null = null
  private detailsElement: HTMLDetailsElement | null = null
  private markdownHeadings: Array<{ slug: string; text: string }> | null = null

  // Ultra-smooth progress animation
  private animationFrame: number | null = null
  private targetProgress: number = 0
  private currentProgress: number = 0

  constructor(
    private containerSelector: string,
    private linkSelector: string,
    private options: {
      isMobile?: boolean
      tocMaxDepth?: number
    } = {}
  ) {
    this.tocMaxDepth = options.tocMaxDepth ?? 6
  }

  private getHeaderOffset(): number {
    if (typeof window === "undefined") return 80
    const headerHeight = getComputedStyle(document.documentElement).getPropertyValue(
      "--header-height"
    )
    return parseInt(headerHeight, 10) || 80
  }

  private buildHeadingRegions(): void {
    const allHeadings = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".prose h2, .prose h3, .prose h4, .prose h5, .prose h6"
      )
    )

    this.headings = allHeadings.filter((heading) => {
      const depth = parseInt(heading.tagName.substring(1))
      return depth <= this.tocMaxDepth
    })

    if (this.headings.length === 0) {
      this.regions = []
      return
    }

    this.regions = this.headings.map((heading, index) => {
      const nextHeading = this.headings[index + 1]
      return {
        id: heading.id,
        start: heading.offsetTop,
        end: nextHeading ? nextHeading.offsetTop : document.body.scrollHeight
      }
    })

    if (this.options.isMobile) {
      this.markdownHeadings = this.headings.map((heading) => ({
        slug: heading.id,
        text: heading.textContent?.trim() ?? ""
      }))
    }
  }

  private getVisibleHeadingIds(): string[] {
    if (this.regions.length === 0) return []

    const scrollY = window.scrollY
    const viewportTop = scrollY + this.getHeaderOffset()
    const viewportBottom = scrollY + window.innerHeight
    const visibleIds = new Set<string>()

    for (const region of this.regions) {
      if (region.start <= viewportBottom && region.end >= viewportTop) {
        visibleIds.add(region.id)
      }
    }

    return Array.from(visibleIds)
  }

  private updateTOCLinks(headingIds: string[]): void {
    if (!this.container) return

    const links = this.container.querySelectorAll(this.linkSelector)
    const activeIdSet = new Set(headingIds)

    for (const link of links) {
      const id = link.getAttribute("data-heading-link")

      if (id && activeIdSet.has(id)) {
        link.setAttribute("data-active", "true")
      } else {
        link.removeAttribute("data-active")
      }
    }
  }

  private updateMobileProgressIndicator(): void {
    if (!this.progressCircle) return

    const { scrollY, innerHeight } = window
    const { scrollHeight } = document.documentElement
    this.targetProgress = Math.max(0, Math.min(1, scrollY / (scrollHeight - innerHeight)))

    if (!this.animationFrame) {
      this.animateProgress()
    }
  }

  private updateActiveSectionTitle(): void {
    if (this.currentSectionText && this.markdownHeadings) {
      const currentText =
        this.activeIds.length > 0
          ? this.markdownHeadings
              .filter((h) => this.activeIds.includes(h.slug))
              .map((h) => h.text.replace(UnifiedTOCController.LINK_EMOJI_REGEX, "").trim())
              .join(", ")
          : UnifiedTOCController.DEFAULT_SECTION_TEXT
      this.currentSectionText.textContent = currentText
    }
  }

  private animateProgress = (): void => {
    if (!this.progressCircle || !this.options.isMobile) {
      this.animationFrame = null
      return
    }

    const diff = this.targetProgress - this.currentProgress

    if (Math.abs(diff) < 0.0001) {
      this.currentProgress = this.targetProgress
      this.updateProgressCircle()
      this.animationFrame = null
      return
    }

    // Use a constant easing factor for a smoother, more continuous feel.
    // A value of 0.1 provides a good balance of responsiveness and smoothness.
    this.currentProgress += diff * 0.1

    this.updateProgressCircle()
    this.animationFrame = requestAnimationFrame(this.animateProgress)
  }

  private updateProgressCircle(): void {
    if (!this.progressCircle) return

    const circumference = 2 * Math.PI * UnifiedTOCController.PROGRESS_CIRCLE_RADIUS
    const offset = circumference * (1 - this.currentProgress)
    this.progressCircle.style.strokeDashoffset = offset.toString()
  }

  // Public method to handle large jumps (called on heading clicks, page transitions)
  handleLargeJump(): void {
    if (!this.options.isMobile || !this.progressCircle) return

    const { scrollY, innerHeight } = window
    const { scrollHeight } = document.documentElement
    this.targetProgress = Math.max(0, Math.min(1, scrollY / (scrollHeight - innerHeight)))

    if (!this.animationFrame) {
      this.animateProgress()
    }
  }

  private handleScroll = (): void => {
    if (this.options.isMobile) {
      this.updateMobileProgressIndicator()
    }

    const newActiveIds = this.getVisibleHeadingIds()

    if (!arraysEqual(newActiveIds, this.activeIds)) {
      this.activeIds = newActiveIds
      this.updateTOCLinks(this.activeIds)
      if (this.options.isMobile) {
        this.updateActiveSectionTitle()
      }
    }
  }

  private handleResize = (): void => {
    this.buildHeadingRegions()
    this.handleScroll()
  }

  scrollToActiveLink(headingId: string): void {
    if (!this.scrollArea) return

    const link = this.container?.querySelector(`[data-heading-link="${headingId}"]`)
    if (!link) return

    const areaRect = this.scrollArea.getBoundingClientRect()
    const linkRect = link.getBoundingClientRect()
    const currentScrollTop = this.scrollArea.scrollTop

    const linkTop = linkRect.top - areaRect.top + currentScrollTop
    const desiredScroll = Math.max(
      0,
      Math.min(
        linkTop - (areaRect.height - linkRect.height) / 2,
        this.scrollArea.scrollHeight - this.scrollArea.clientHeight
      )
    )

    if (Math.abs(desiredScroll - currentScrollTop) > 5) {
      this.scrollArea.scrollTop = desiredScroll
    }
  }

  init(): void {
    this.cleanup()

    const container = document.querySelector(this.containerSelector)

    this.container = container as HTMLElement
    this.scrollArea = container?.querySelector(
      "[data-scroll-area], [data-slot='scroll-area-viewport']"
    ) as HTMLElement

    if (this.options.isMobile) {
      this.progressCircle = document.querySelector<SVGCircleElement>("#mobile-toc-progress-circle")
      this.currentSectionText = document.getElementById("mobile-toc-current-section")
      this.detailsElement = document.querySelector<HTMLDetailsElement>(
        `${this.containerSelector} details`
      )

      if (this.progressCircle) {
        const circumference = 2 * Math.PI * UnifiedTOCController.PROGRESS_CIRCLE_RADIUS
        Object.assign(this.progressCircle.style, {
          strokeDasharray: circumference.toString(),
          strokeDashoffset: circumference.toString()
        })

        // Initialize with current scroll position
        const { scrollY, innerHeight } = window
        const { scrollHeight } = document.documentElement
        this.currentProgress = this.targetProgress = Math.max(
          0,
          Math.min(1, scrollY / (scrollHeight - innerHeight))
        )
        this.updateProgressCircle()
      }

      this.detailsElement?.addEventListener("toggle", () => {
        const activeId = this.activeIds?.[0]
        if (this.detailsElement?.open && activeId) {
          requestAnimationFrame(() => this.scrollToActiveLink(activeId))
        }
      })

      document
        .querySelector(`${this.containerSelector} #mobile-toc`)
        ?.querySelectorAll<HTMLElement>(".toc-item")
        .forEach((item) => {
          item.addEventListener("click", () => {
            if (this.detailsElement) this.detailsElement.open = false
            // Handle smooth animation on heading clicks
            setTimeout(() => this.handleLargeJump(), UnifiedTOCController.NAV_SETTLE_DELAY_MS)
          })
        })

      // Handle Astro page transitions
      document.addEventListener("astro:after-swap", () => {
        setTimeout(() => this.handleLargeJump(), UnifiedTOCController.NAV_SETTLE_DELAY_MS)
      })

      // Handle browser back/forward navigation
      window.addEventListener("popstate", () => {
        setTimeout(() => this.handleLargeJump(), UnifiedTOCController.NAV_SETTLE_DELAY_MS)
      })
    }

    this.buildHeadingRegions()

    if (this.headings.length === 0) {
      this.updateTOCLinks([])
      if (this.options.isMobile) {
        this.updateActiveSectionTitle()
      }
      return
    }

    window.addEventListener("scroll", this.handleScroll, { passive: true })
    window.addEventListener("resize", this.handleResize, { passive: true })

    this.handleScroll()
  }

  cleanup(): void {
    window.removeEventListener("scroll", this.handleScroll)
    window.removeEventListener("resize", this.handleResize)

    // Clean up animation
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }

    this.activeIds = []
    this.headings = []
    this.regions = []
    this.container = null
    this.scrollArea = null
    this.progressCircle = null
    this.currentSectionText = null
    this.detailsElement = null
    this.markdownHeadings = null
    this.targetProgress = 0
    this.currentProgress = 0
  }
}

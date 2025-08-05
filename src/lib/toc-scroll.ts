const HEADER_OFFSET = 80

interface HeadingRegion {
  id: string
  start: number
  end: number
}

interface TOCElements {
  scrollArea: HTMLElement | null
  container: HTMLElement | null
}

class TOCScrollState {
  private elements: TOCElements = {
    scrollArea: null,
    container: null
  }

  private data: {
    activeIds: string[]
    headings: HTMLElement[]
    regions: HeadingRegion[]
  } = {
    activeIds: [],
    headings: [],
    regions: []
  }

  get scrollArea(): HTMLElement | null {
    return this.elements.scrollArea
  }

  set scrollArea(element: HTMLElement | null) {
    this.elements.scrollArea = element
  }

  get container(): HTMLElement | null {
    return this.elements.container
  }

  set container(element: HTMLElement | null) {
    this.elements.container = element
  }

  get activeIds(): string[] {
    return this.data.activeIds
  }

  set activeIds(ids: string[]) {
    this.data.activeIds = ids
  }

  get headings(): HTMLElement[] {
    return this.data.headings
  }

  set headings(elements: HTMLElement[]) {
    this.data.headings = elements
  }

  get regions(): HeadingRegion[] {
    return this.data.regions
  }

  set regions(regions: HeadingRegion[]) {
    this.data.regions = regions
  }

  reset(): void {
    this.data = {
      activeIds: [],
      headings: [],
      regions: []
    }
    this.elements = {
      scrollArea: null,
      container: null
    }
  }
}

export class HeadingRegions {
  private state: TOCScrollState

  constructor(state: TOCScrollState) {
    this.state = state
  }

  build() {
    this.state.headings = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".prose h2, .prose h3, .prose h4, .prose h5, .prose h6"
      )
    )

    if (this.state.headings.length === 0) {
      this.state.regions = []
      return
    }

    this.state.regions = this.state.headings.map((heading, index) => {
      const nextHeading = this.state.headings[index + 1]
      return {
        id: heading.id,
        start: heading.offsetTop,
        end: nextHeading ? nextHeading.offsetTop : document.body.scrollHeight
      }
    })
  }

  getVisibleIds(): string[] {
    if (this.state.headings.length === 0) return []

    const viewportTop = window.scrollY + HEADER_OFFSET
    const viewportBottom = window.scrollY + window.innerHeight
    const visibleIds = new Set<string>()

    const isInViewport = (top: number, bottom: number) =>
      (top >= viewportTop && top <= viewportBottom) ||
      (bottom >= viewportTop && bottom <= viewportBottom) ||
      (top <= viewportTop && bottom >= viewportBottom)

    this.state.headings.forEach((heading) => {
      const headingBottom = heading.offsetTop + heading.offsetHeight
      if (isInViewport(heading.offsetTop, headingBottom)) {
        visibleIds.add(heading.id)
      }
    })

    this.state.regions.forEach((region) => {
      if (region.start <= viewportBottom && region.end >= viewportTop) {
        const heading = document.getElementById(region.id)
        if (heading) {
          const headingBottom = heading.offsetTop + heading.offsetHeight
          if (
            region.end > headingBottom &&
            (headingBottom < viewportBottom || viewportTop < region.end)
          ) {
            visibleIds.add(region.id)
          }
        }
      }
    })

    return Array.from(visibleIds)
  }
}

export class TOCScrollMask {
  private state: TOCScrollState

  constructor(state: TOCScrollState) {
    this.state = state
  }

  update(maskClasses: { top: string; bottom: string }) {
    if (!this.state.scrollArea || !this.state.container) return

    const { scrollTop, scrollHeight, clientHeight } = this.state.scrollArea
    const threshold = 5
    const isAtTop = scrollTop <= threshold
    const isAtBottom = scrollTop >= scrollHeight - clientHeight - threshold

    this.state.container.classList.toggle(maskClasses.top, !isAtTop)
    this.state.container.classList.toggle(maskClasses.bottom, !isAtBottom)
  }
}

export class TOCLinks {
  private state: TOCScrollState

  constructor(state: TOCScrollState) {
    this.state = state
  }

  update(headingIds: string[], linkSelector: string, activeClass: string = "text-foreground") {
    const links = document.querySelectorAll(linkSelector)
    links.forEach((link) => {
      link.classList.remove(activeClass)
    })

    headingIds.forEach((id) => {
      if (id) {
        const activeLink = document.querySelector(
          `${linkSelector}[data-heading-link="${id}"]`
        )
        if (activeLink) {
          activeLink.classList.add(activeClass)
        }
      }
    })

    this.scrollToActive(headingIds[0], linkSelector)
  }

  private scrollToActive(headingId: string, linkSelector: string) {
    if (!this.state.scrollArea || !headingId) return

    const activeLink = document.querySelector(
      `${linkSelector}[data-heading-link="${headingId}"]`
    )
    if (!activeLink) return

    const { top: areaTop, height: areaHeight } = this.state.scrollArea.getBoundingClientRect()
    const { top: linkTop, height: linkHeight } = activeLink.getBoundingClientRect()

    const currentLinkTop = linkTop - areaTop + this.state.scrollArea.scrollTop
    const targetScroll = Math.max(
      0,
      Math.min(
        currentLinkTop - (areaHeight - linkHeight) / 2,
        this.state.scrollArea.scrollHeight - this.state.scrollArea.clientHeight
      )
    )

    if (Math.abs(targetScroll - this.state.scrollArea.scrollTop) > 5) {
      this.state.scrollArea.scrollTop = targetScroll
    }
  }
}

export abstract class BaseTOCController {
  protected state = new TOCScrollState()
  protected headingRegions = new HeadingRegions(this.state)
  protected tocScrollMask = new TOCScrollMask(this.state)
  protected tocLinks = new TOCLinks(this.state)
  protected scrollHandler: (() => void) | null = null
  private resizeHandler: (() => void) | null = null

  abstract getContainerSelector(): string
  abstract getScrollAreaSelector(): string
  abstract getContainerAttribute(): string
  abstract getLinkSelector(): string
  abstract getMaskClasses(): { top: string; bottom: string }

  init() {
    this.state.reset()
    this.setupElements()

    this.headingRegions.build()

    if (this.state.headings.length === 0) {
      this.tocLinks.update([], this.getLinkSelector())
      return
    }

    this.setupScrollHandlers()
    this.handleScroll()
    this.setupCustomBehavior()

    setTimeout(() => {
      const maskClasses = this.getMaskClasses()
      this.tocScrollMask.update(maskClasses)
    }, 100)
  }

  private setupElements() {
    const container = document.querySelector(this.getContainerSelector())
    if (!container) return

    this.state.scrollArea = container.querySelector(this.getScrollAreaSelector())
    this.state.container = container.querySelector(`[${this.getContainerAttribute()}]`)
  }

  private setupScrollHandlers() {
    this.scrollHandler = () => this.handleScroll()
    this.resizeHandler = () => this.handleResize()

    const options = { passive: true }
    window.addEventListener("scroll", this.scrollHandler, options)
    window.addEventListener("resize", this.resizeHandler, options)

    if (this.state.scrollArea) {
      const maskClasses = this.getMaskClasses()
      const tocScrollHandler = () => this.tocScrollMask.update(maskClasses)
      this.state.scrollArea.addEventListener("scroll", tocScrollHandler, options)
    }
  }

  private handleScroll() {
    const newActiveIds = this.headingRegions.getVisibleIds()

    if (JSON.stringify(newActiveIds) !== JSON.stringify(this.state.activeIds)) {
      this.state.activeIds = newActiveIds
      this.tocLinks.update(this.state.activeIds, this.getLinkSelector())
    }
  }

  private handleResize() {
    this.headingRegions.build()
    const newActiveIds = this.headingRegions.getVisibleIds()

    if (JSON.stringify(newActiveIds) !== JSON.stringify(this.state.activeIds)) {
      this.state.activeIds = newActiveIds
      this.tocLinks.update(this.state.activeIds, this.getLinkSelector())
    }

    const maskClasses = this.getMaskClasses()
    this.tocScrollMask.update(maskClasses)
  }

  cleanup() {
    if (this.scrollHandler) {
      window.removeEventListener("scroll", this.scrollHandler)
      this.scrollHandler = null
    }
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler)
      this.resizeHandler = null
    }

    this.state.reset()
  }

  protected setupCustomBehavior() {
    // Override in subclasses for custom behavior
  }
}
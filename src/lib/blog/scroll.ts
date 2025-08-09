/**
 * @fileoverview Scroll management system for the blog
 *
 * This module provides scroll-based UI interactions including scroll masks,
 * scroll-to-active functionality, and TOC scroll tracking. It follows the
 * Template Method and Strategy patterns for extensible scroll controllers.
 *
 * @author My (Chiffon) Nguyen, Claude Code
 * @version 2.0.0
 */

import type {
  ScrollElements,
  HeadingRegion,
  ScrollMaskConfig,
  ScrollController,
  ScrollMask as ScrollMaskInterface,
  ScrollToActive as ScrollToActiveInterface
} from './types'

// ========================================
// Utility Functions
// ========================================

/**
 * Enhanced throttle function with optional trailing execution for smoother UX.
 *
 * @param func - Function to throttle
 * @param delay - Delay in milliseconds
 * @param trailing - Whether to execute on trailing edge (default: true)
 * @returns Throttled function
 */
function throttle(func: () => void, delay: number, trailing = true): () => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastExecution = 0
  let shouldCallTrailing = false

  return () => {
    const now = Date.now()

    if (now - lastExecution >= delay) {
      // Leading execution
      func()
      lastExecution = now
      shouldCallTrailing = false
    } else {
      // Schedule trailing execution if enabled
      if (trailing) {
        shouldCallTrailing = true

        if (!timeoutId) {
          const remainingTime = delay - (now - lastExecution)
          timeoutId = setTimeout(() => {
            if (shouldCallTrailing) {
              func()
              lastExecution = Date.now()
            }
            timeoutId = null
            shouldCallTrailing = false
          }, remainingTime)
        }
      }
    }
  }
}

/**
 * Scrolls an element into the center of its scroll container with smooth alignment.
 *
 * Consolidates scroll logic used across TOC components for consistent behavior
 * and easier maintenance.
 *
 * @param scrollArea - The scrollable container element
 * @param target - The target element to scroll into view
 * @param options - Configuration options for scrolling behavior
 */
function scrollElementIntoView(
  scrollArea: HTMLElement,
  target: Element,
  options: {
    threshold?: number
    shouldFocus?: boolean
    preventScroll?: boolean
  } = {}
): void {
  const { threshold = 5, shouldFocus = false, preventScroll = true } = options

  const areaRect = scrollArea.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  const currentScrollTop = scrollArea.scrollTop

  const targetTop = targetRect.top - areaRect.top + currentScrollTop
  const desiredScroll = Math.max(
    0,
    Math.min(
      targetTop - (areaRect.height - targetRect.height) / 2,
      scrollArea.scrollHeight - scrollArea.clientHeight
    )
  )

  // Only scroll if the difference is significant enough
  if (Math.abs(desiredScroll - currentScrollTop) > threshold) {
    scrollArea.scrollTop = desiredScroll
  }

  // Optional focus for keyboard navigation accessibility
  if (shouldFocus && target instanceof HTMLElement) {
    target.focus({ preventScroll })
  }
}

/**
 * Efficient array comparison for performance.
 *
 * @param a - First array
 * @param b - Second array
 * @returns True if arrays are equal
 */
function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

// ========================================
// State Management
// ========================================

/**
 * Manages scroll state for UI interactions.
 *
 * Encapsulates scroll-related DOM elements and provides
 * safe access with proper state management.
 */
export class ScrollState {
  private elements: ScrollElements = {
    scrollArea: null,
    container: null
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

  /**
   * Resets all scroll state elements.
   */
  reset(): void {
    this.elements = {
      scrollArea: null,
      container: null
    }
  }
}

/**
 * Extended scroll state for TOC functionality.
 *
 * Includes additional state for heading tracking and link management.
 */
export class TOCScrollState extends ScrollState {
  activeIds: string[] = []
  headings: HTMLElement[] = []
  regions: HeadingRegion[] = []
  cachedLinks: NodeListOf<Element> | null = null

  /**
   * Resets all TOC scroll state.
   */
  reset(): void {
    super.reset()
    this.activeIds = []
    this.headings = []
    this.regions = []
    this.cachedLinks = null
  }

  /**
   * Clears cached links when layout changes (e.g., on resize).
   * This will force TOCLinks to rebuild its link map on next update.
   */
  clearLinkCache(): void {
    this.cachedLinks = null
  }
}

// ========================================
// Scroll Functionality Components
// ========================================

/**
 * Handles scroll mask effects (fade in/out at edges).
 *
 * Provides visual feedback when content is scrollable by adding
 * CSS classes for top and bottom fade masks.
 */
export class ScrollMask implements ScrollMaskInterface {
  private readonly state: ScrollState

  constructor(state: ScrollState) {
    this.state = state
  }

  /**
   * Updates scroll mask classes based on scroll position.
   *
   * @param maskClasses - CSS classes for top/bottom masks
   */
  update(maskClasses: ScrollMaskConfig): void {
    if (!this.state.scrollArea || !this.state.container) return

    const { scrollTop, scrollHeight, clientHeight } = this.state.scrollArea
    const threshold = 5
    const isAtTop = scrollTop <= threshold
    const isAtBottom = scrollTop >= scrollHeight - clientHeight - threshold

    this.state.container.classList.toggle(maskClasses.top, !isAtTop)
    this.state.container.classList.toggle(maskClasses.bottom, !isAtBottom)
  }
}

/**
 * Handles scroll-to-active functionality.
 *
 * Automatically scrolls to keep the active item centered in the
 * scrollable area for better user experience.
 */
export class ScrollToActive implements ScrollToActiveInterface {
  private readonly state: ScrollState

  constructor(state: ScrollState) {
    this.state = state
  }

  /**
   * Scrolls to the active item in the scrollable area.
   *
   * @param activeItemSelector - CSS selector for the active item
   * @param options - Optional configuration for focus behavior
   */
  scroll(
    activeItemSelector: string,
    options: { shouldFocus?: boolean } = {}
  ): void {
    if (!this.state.scrollArea) return

    const activeItem = this.state.scrollArea.querySelector(activeItemSelector)
    if (!activeItem) return

    scrollElementIntoView(this.state.scrollArea, activeItem, options)
  }
}

// ========================================
// TOC-Specific Components
// ========================================

/**
 * Manages heading regions for TOC scroll tracking.
 *
 * Builds and maintains regions based on heading positions
 * and determines which headings are currently visible.
 */
export class HeadingRegions {
  private readonly state: TOCScrollState
  private static readonly HEADER_OFFSET = 80

  constructor(state: TOCScrollState) {
    this.state = state
  }

  /**
   * Builds heading regions from current DOM headings.
   *
   * Scans the page for headings and creates regions for
   * scroll position tracking.
   */
  build(): void {
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

  /**
   * Gets IDs of headings currently visible in viewport.
   *
   * @returns Array of visible heading IDs
   */
  getVisibleIds(): string[] {
    if (this.state.headings.length === 0) return []

    const scrollY = window.scrollY
    const viewportTop = scrollY + HeadingRegions.HEADER_OFFSET
    const viewportBottom = scrollY + window.innerHeight
    const visibleIds = new Set<string>()

    // Check headings directly visible in viewport
    for (const heading of this.state.headings) {
      const headingTop = heading.offsetTop
      const headingBottom = headingTop + heading.offsetHeight

      if (headingBottom >= viewportTop && headingTop <= viewportBottom) {
        visibleIds.add(heading.id)
      }
    }

    // Check regions (sections) that overlap with viewport
    for (const region of this.state.regions) {
      if (region.start <= viewportBottom && region.end >= viewportTop) {
        visibleIds.add(region.id)
      }
    }

    return Array.from(visibleIds)
  }
}

/**
 * Manages TOC link highlighting and scrolling.
 *
 * Handles the visual state of TOC links based on visible headings
 * and provides scroll-to-active functionality for TOC navigation.
 */
export class TOCLinks {
  private readonly state: TOCScrollState
  private linkMap: Map<string, Element> | null = null

  constructor(state: TOCScrollState) {
    this.state = state
  }

  /**
   * Updates TOC link active states based on visible headings.
   *
   * @param headingIds - Array of currently visible heading IDs
   * @param linkSelector - CSS selector for TOC links
   */
  update(headingIds: string[], linkSelector: string): void {
    // Use cached links if available, otherwise query and cache
    if (!this.state.cachedLinks) {
      this.state.cachedLinks = document.querySelectorAll(linkSelector)
      // Build link map for O(1) lookups instead of O(n) nested loops
      this.linkMap = new Map(
        Array.from(this.state.cachedLinks).map(link => [
          link.getAttribute('data-heading-link') ?? '',
          link
        ])
      )
    }

    // If cache was cleared but linkMap still exists, rebuild it
    if (!this.linkMap && this.state.cachedLinks) {
      this.linkMap = new Map(
        Array.from(this.state.cachedLinks).map(link => [
          link.getAttribute('data-heading-link') ?? '',
          link
        ])
      )
    }

    // Remove active attribute from all links
    for (const link of this.state.cachedLinks) {
      link.removeAttribute('data-active')
    }

    // Add active attribute to visible heading links using map lookup
    for (const id of headingIds) {
      if (!id) continue

      const link = this.linkMap?.get(id)
      if (link) {
        link.setAttribute('data-active', 'true')
      }
    }

    // Scroll to the first active heading
    if (headingIds[0]) {
      this.scrollToActive(headingIds[0])
    }
  }

  /**
   * Scrolls TOC to keep active link visible.
   *
   * @param headingId - ID of the heading to scroll to
   */
  scrollToActive(headingId: string): void {
    if (!this.state.scrollArea || !this.linkMap) return

    const activeLink = this.linkMap.get(headingId)
    if (!activeLink) return

    scrollElementIntoView(this.state.scrollArea, activeLink)
  }
}

// ========================================
// Abstract Controller Base Classes
// ========================================

/**
 * Abstract base controller for scroll functionality.
 *
 * Implements the Template Method pattern, providing a common
 * structure for scroll controllers while allowing customization
 * of specific behaviors.
 */
export abstract class BaseScrollController implements ScrollController {
  protected readonly state = new ScrollState()
  protected readonly scrollMask = new ScrollMask(this.state)
  protected readonly scrollToActive = new ScrollToActive(this.state)
  private scrollHandler: (() => void) | null = null

  // Template method hooks - subclasses must implement
  abstract getContainerSelector(): string
  abstract getActiveItemSelector(): string

  // Conventional data attributes with overridable defaults
  protected getScrollAreaSelector(): string { return "[data-scroll-area]" }
  protected getContainerAttribute(): string { return "data-scroll-container" }
  protected getMaskClasses(): ScrollMaskConfig { return { top: "mask-t-from-90%", bottom: "mask-b-from-90%" } }

  /**
   * Initializes the scroll controller.
   *
   * Template method that sets up common functionality
   * and delegates to subclass-specific setup.
   */
  init(): void {
    this.state.reset()

    const container = document.querySelector(this.getContainerSelector())
    if (!container) return

    this.state.scrollArea = container.querySelector(this.getScrollAreaSelector())
    this.state.container = container.querySelector(`[${this.getContainerAttribute()}]`)

    if (this.state.scrollArea) {
      const maskClasses = this.getMaskClasses()
      this.scrollHandler = () => this.scrollMask.update(maskClasses)
      this.state.scrollArea.addEventListener("scroll", this.scrollHandler, { passive: true })
    }

    this.setupCustomBehavior()

    requestAnimationFrame(() => {
      this.scrollToActive.scroll(this.getActiveItemSelector())
      setTimeout(() => this.scrollMask.update(this.getMaskClasses()), 100)
    })
  }

  /**
   * Cleans up event listeners and resets state.
   */
  cleanup(): void {
    if (this.state.scrollArea && this.scrollHandler) {
      this.state.scrollArea.removeEventListener("scroll", this.scrollHandler)
      this.scrollHandler = null
    }
    this.state.reset()
  }

  /**
   * Hook for subclass-specific behavior setup.
   *
   * Override in subclasses for custom initialization.
   */
  protected setupCustomBehavior(): void {
    // Override in subclasses for custom behavior
  }
}

/**
 * Abstract base controller for TOC scroll functionality.
 *
 * Extends the basic scroll controller with TOC-specific features
 * like heading tracking and link highlighting.
 */
export abstract class BaseTOCController implements ScrollController {
  public readonly state = new TOCScrollState()
  protected readonly headingRegions = new HeadingRegions(this.state)
  protected readonly tocScrollMask = new ScrollMask(this.state)
  public readonly tocLinks = new TOCLinks(this.state)
  protected scrollHandler: (() => void) | null = null
  private resizeHandler: (() => void) | null = null

  // Template method hooks - subclasses must implement
  abstract getContainerSelector(): string
  abstract getLinkSelector(): string

  // Conventional data attributes (no need to abstract)
  protected getScrollAreaSelector(): string { return "[data-scroll-area]" }
  protected getContainerAttribute(): string { return "data-scroll-container" }
  protected getMaskClasses(): ScrollMaskConfig { return { top: "mask-t-from-90%", bottom: "mask-b-from-90%" } }

  /**
   * Initializes the TOC scroll controller.
   *
   * Sets up heading tracking, scroll handlers, and initial state.
   */
  init(): void {
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

    // Development-only debug tools
    if (import.meta.env.DEV) {
      this.setupDebugTools()
    }

    setTimeout(() => {
      const maskClasses = this.getMaskClasses()
      this.tocScrollMask.update(maskClasses)
    }, 100)
  }

  /**
   * Sets up DOM elements for scroll tracking.
   */
  private setupElements(): void {
    const container = document.querySelector(this.getContainerSelector())
    if (!container) return

    this.state.scrollArea = container.querySelector(this.getScrollAreaSelector())
    this.state.container = container.querySelector(`[${this.getContainerAttribute()}]`)
  }

  /**
   * Sets up scroll and resize event handlers.
   */
  private setupScrollHandlers(): void {
    // Throttle handlers for better performance
    this.scrollHandler = throttle(() => this.handleScroll(), 16) // ~60fps
    this.resizeHandler = throttle(() => this.handleResize(), 100)

    const options = { passive: true }
    window.addEventListener("scroll", this.scrollHandler, options)
    window.addEventListener("resize", this.resizeHandler, options)

    if (this.state.scrollArea) {
      const maskClasses = this.getMaskClasses()
      const tocScrollHandler = throttle(() => this.tocScrollMask.update(maskClasses), 16)
      this.state.scrollArea.addEventListener("scroll", tocScrollHandler, options)
    }
  }

  /**
   * Handles scroll events by updating active headings.
   */
  private handleScroll(): void {
    const newActiveIds = this.headingRegions.getVisibleIds()

    if (!arraysEqual(newActiveIds, this.state.activeIds)) {
      this.state.activeIds = newActiveIds
      this.tocLinks.update(this.state.activeIds, this.getLinkSelector())
    }
  }

  /**
   * Handles resize events by rebuilding heading regions.
   */
  private handleResize(): void {
    // Clear cached links on resize as layout may have changed
    this.state.clearLinkCache()

    this.headingRegions.build()
    const newActiveIds = this.headingRegions.getVisibleIds()

    if (!arraysEqual(newActiveIds, this.state.activeIds)) {
      this.state.activeIds = newActiveIds
      this.tocLinks.update(this.state.activeIds, this.getLinkSelector())
    }

    const maskClasses = this.getMaskClasses()
    this.tocScrollMask.update(maskClasses)
  }

  /**
   * Cleans up event listeners and resets state.
   */
  cleanup(): void {
    if (this.scrollHandler) {
      window.removeEventListener("scroll", this.scrollHandler)
      this.scrollHandler = null
    }
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler)
      this.resizeHandler = null
    }

    this.state.reset()

    // Clean up debug tools in development
    if (import.meta.env.DEV && (window as any).__scrollDebug) {
      delete (window as any).__scrollDebug
    }
  }

  /**
   * Hook for subclass-specific behavior setup.
   *
   * Override in subclasses for custom initialization.
   */
  protected setupCustomBehavior(): void {
    // Override in subclasses for custom behavior
  }

  /**
   * Development-only debug tools for scroll state inspection.
   *
   * Available in browser console as window.__scrollDebug
   */
  private setupDebugTools(): void {
    const debugAPI = {
      // State inspection
      state: this.state,
      getVisibleIds: () => this.headingRegions.getVisibleIds(),
      getActiveIds: () => this.state.activeIds,

      // Manual controls for testing
      scrollToHeading: (id: string) => {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      },

      // Performance monitoring
      measureScrollPerformance: () => {
        let scrollCount = 0
        let startTime = performance.now()

        const originalHandler = this.scrollHandler
        if (originalHandler) {
          this.scrollHandler = () => {
            scrollCount++
            const currentTime = performance.now()
            if (currentTime - startTime >= 1000) {
              console.log(`Scroll performance: ${scrollCount} events/second`)
              scrollCount = 0
              startTime = currentTime
            }
            originalHandler()
          }
        }
      },

      // Visual debugging
      highlightActiveRegions: () => {
        // Remove existing highlights
        document.querySelectorAll('.scroll-debug-highlight').forEach(el => el.remove())

        // Highlight visible heading regions
        const visibleIds = this.headingRegions.getVisibleIds()
        visibleIds.forEach(id => {
          const element = document.getElementById(id)
          if (element) {
            const highlight = document.createElement('div')
            highlight.className = 'scroll-debug-highlight'
            highlight.style.cssText = `
              position: absolute;
              top: ${element.offsetTop}px;
              left: 0;
              width: 100%;
              height: ${element.offsetHeight}px;
              background: rgba(255, 0, 0, 0.2);
              border: 2px solid red;
              pointer-events: none;
              z-index: 9999;
            `
            document.body.appendChild(highlight)
          }
        })
      },

      // Configuration inspection
      getConfig: () => ({
        containerSelector: this.getContainerSelector(),
        linkSelector: this.getLinkSelector(),
        scrollAreaSelector: this.getScrollAreaSelector(),
        maskClasses: this.getMaskClasses()
      })
    }

      // Expose to global scope for dev tools
      ; (window as any).__scrollDebug = debugAPI

    console.log('📊 TOC Scroll Debug Tools Available:', {
      usage: 'window.__scrollDebug',
      methods: Object.keys(debugAPI)
    })
  }
}


/**
 * Mobile-specific TOC enhancements for progress tracking and current section display
 */
export interface MobileTOCElements {
  progressCircle: SVGCircleElement | null
  currentSectionText: HTMLElement | null
  detailsElement: HTMLDetailsElement | null
}

/**
 * Mobile TOC progress and interaction utilities
 */
export class MobileTOCUtils {
  private static readonly INITIAL_OVERVIEW_TEXT = 'Overview'
  private static readonly PROGRESS_CIRCLE_RADIUS = 10
  private static readonly PROGRESS_CIRCLE_CIRCUMFERENCE =
    2 * Math.PI * this.PROGRESS_CIRCLE_RADIUS

  /**
   * Initialize progress circle styling
   * @param progressCircle - The SVG circle element for progress indication
   */
  static initProgressCircle(progressCircle: SVGCircleElement | null): void {
    if (!progressCircle) return

    const { PROGRESS_CIRCLE_CIRCUMFERENCE: circ } = this
    Object.assign(progressCircle.style, {
      strokeDasharray: circ.toString(),
      strokeDashoffset: circ.toString()
    })
  }

  /**
   * Update progress circle based on scroll position
   * @param progressCircle - The SVG circle element
   */
  static updateProgress(progressCircle: SVGCircleElement | null): void {
    if (!progressCircle) return

    const { scrollY, innerHeight } = window
    const { scrollHeight } = document.documentElement
    const progress = Math.max(0, Math.min(1, scrollY / (scrollHeight - innerHeight)))

    const offset = this.PROGRESS_CIRCLE_CIRCUMFERENCE * (1 - progress)
    progressCircle.style.strokeDashoffset = offset.toString()
  }

  /**
   * Update current section text based on active headings
   * @param currentSectionText - The text element to update
   * @param activeIds - Currently active heading IDs
   * @param markdownHeadings - Array of markdown headings for text lookup
   */
  static updateCurrentSection(
    currentSectionText: HTMLElement | null,
    activeIds: string[],
    markdownHeadings: Array<{ slug: string; text: string }> | null
  ): void {
    if (!currentSectionText || !markdownHeadings) return

    const currentText =
      activeIds.length > 0
        ? markdownHeadings
          .filter((h) => activeIds.includes(h.slug))
          .map((h) => h.text.replace(/\s*🔗\s*$/, '').trim())
          .join(', ')
        : this.INITIAL_OVERVIEW_TEXT

    currentSectionText.textContent = currentText
  }

  /**
   * Extract markdown headings from DOM elements with depth filtering
   * @param containerSelector - CSS selector for the container with TOC items
   * @param maxDepth - Maximum heading depth to include
   * @returns Array of heading objects with slug, text, and depth
   */
  static extractMarkdownHeadings(
    containerSelector: string,
    tocMaxDepth: number = 6
  ): Array<{ slug: string; text: string; depth: number }> {
    return Array.from(document.querySelectorAll<HTMLElement>(`${containerSelector} .toc-item`))
      .map((el) => ({
        slug: el.getAttribute('data-heading-link') ?? '',
        text: el.textContent?.trim() ?? '',
        depth: parseInt(el.getAttribute('data-depth') ?? '1', 10)
      }))
      .filter((heading) => heading.depth <= tocMaxDepth)
  }

  /**
   * Setup interaction handlers for mobile TOC
   * @param containerSelector - CSS selector for the TOC container
   * @param detailsElement - The details element for open/close behavior
   * @param onItemClick - Callback when a TOC item is clicked
   */
  static setupInteractions(
    containerSelector: string,
    detailsElement: HTMLDetailsElement | null,
    onItemClick?: () => void
  ): void {
    // Close TOC when item is clicked
    document
      .querySelector(containerSelector)
      ?.querySelectorAll<HTMLElement>('.toc-item')
      .forEach((item) => {
        item.addEventListener('click', () => {
          if (detailsElement) detailsElement.open = false
          onItemClick?.()
        })
      })
  }
}

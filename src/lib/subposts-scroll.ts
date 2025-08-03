interface ScrollElements {
  scrollArea: HTMLElement | null
  container: HTMLElement | null
}

class ScrollState {
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

  reset(): void {
    this.elements = {
      scrollArea: null,
      container: null
    }
  }
}

export class ScrollMask {
  private state: ScrollState

  constructor(state: ScrollState) {
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

export class ScrollToActive {
  private state: ScrollState

  constructor(state: ScrollState) {
    this.state = state
  }

  scroll(activeItemSelector: string) {
    if (!this.state.scrollArea) return

    const activeItem = this.state.scrollArea.querySelector(activeItemSelector)
    if (!activeItem) return

    const { top: areaTop, height: areaHeight } = this.state.scrollArea.getBoundingClientRect()
    const { top: itemTop, height: itemHeight } = activeItem.getBoundingClientRect()

    const currentItemTop = itemTop - areaTop + this.state.scrollArea.scrollTop
    const targetScroll = Math.max(
      0,
      Math.min(
        currentItemTop - (areaHeight - itemHeight) / 2,
        this.state.scrollArea.scrollHeight - this.state.scrollArea.clientHeight
      )
    )

    this.state.scrollArea.scrollTop = targetScroll
  }
}

export abstract class BaseScrollController {
  protected state = new ScrollState()
  protected scrollMask = new ScrollMask(this.state)
  protected scrollToActive = new ScrollToActive(this.state)
  private scrollHandler: (() => void) | null = null

  abstract getContainerSelector(): string
  abstract getScrollAreaSelector(): string
  abstract getContainerAttribute(): string
  abstract getActiveItemSelector(): string
  abstract getMaskClasses(): { top: string; bottom: string }

  init() {
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

  cleanup() {
    if (this.state.scrollArea && this.scrollHandler) {
      this.state.scrollArea.removeEventListener("scroll", this.scrollHandler)
      this.scrollHandler = null
    }
    this.state.reset()
  }

  protected setupCustomBehavior() {
    // Override in subclasses for custom behavior
  }
}
/**
 * Generic single-value chip filter controller for client-side islands.
 *
 * Drives "click a chip to filter a list of cards, click again to clear" UX,
 * shared by the publication keyword filter and the project category filter.
 * Knows nothing about tags/keywords/categories specifically — only about
 * selectors and dataset attribute names, supplied by the caller.
 */

export interface ChipFilterConfig {
  /** Selector for the filterable items (e.g. cards), each carrying `itemAttr` as a comma-separated list */
  itemSelector: string
  /** Dataset key (camelCase) on each item holding its comma-separated values */
  itemAttr: string
  /** Selector for the filter-bar buttons */
  filterButtonSelector: string
  /** Dataset key (camelCase) on filter-bar buttons holding the value they filter by */
  filterButtonAttr: string
  /** Optional selector for clickable chips rendered on the items themselves */
  chipSelector?: string
  /** Dataset key (camelCase) on those chips holding the value they filter by */
  chipAttr?: string
  /** Optional selector for groups (e.g. sections) to hide when all their items are filtered out */
  groupSelector?: string
  /** Optional selector for a "clear filter" button */
  clearButtonSelector?: string
  /** Optional selector for an element toggled visible while a filter is active */
  activeIndicatorSelector?: string
  /** Scope to query items/groups within; defaults to the whole document */
  getScope?: () => HTMLElement | Document
}

export interface ChipFilterController {
  applyFilter: () => void
  setActive: (value: string | null) => void
  getActive: () => string | null
}

export function initChipFilter(config: ChipFilterConfig): ChipFilterController {
  const {
    itemSelector,
    itemAttr,
    filterButtonSelector,
    filterButtonAttr,
    chipSelector,
    chipAttr,
    groupSelector,
    clearButtonSelector,
    activeIndicatorSelector,
    getScope = () => document
  } = config

  let active: string | null = null

  function applyFilter() {
    const scope = getScope()
    const items = scope.querySelectorAll<HTMLElement>(itemSelector)

    items.forEach((item) => {
      if (!active) {
        item.style.display = ""
        return
      }
      const values = (item.dataset[itemAttr] || "").split(",").map((v) => v.trim())
      item.style.display = values.includes(active) ? "" : "none"
    })

    if (groupSelector) {
      scope.querySelectorAll<HTMLElement>(groupSelector).forEach((group) => {
        const visibleItems = group.querySelectorAll<HTMLElement>(
          `${itemSelector}:not([style*="display: none"])`
        )
        group.style.display = visibleItems.length === 0 ? "none" : ""
      })
    }

    if (activeIndicatorSelector) {
      document
        .querySelector<HTMLElement>(activeIndicatorSelector)
        ?.classList.toggle("hidden", !active)
    }

    document.querySelectorAll<HTMLButtonElement>(filterButtonSelector).forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.dataset[filterButtonAttr] === active ? "true" : "false")
    })

    if (chipSelector && chipAttr) {
      document.querySelectorAll<HTMLButtonElement>(chipSelector).forEach((chip) => {
        chip.setAttribute("aria-pressed", chip.dataset[chipAttr] === active ? "true" : "false")
      })
    }
  }

  function setActive(value: string | null) {
    active = active === value ? null : value
    applyFilter()
  }

  document.querySelectorAll<HTMLButtonElement>(filterButtonSelector).forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.dataset[filterButtonAttr]
      if (value) setActive(value)
    })
  })

  if (chipSelector && chipAttr) {
    document.addEventListener("click", (e) => {
      const chip = (e.target as Element).closest<HTMLButtonElement>(chipSelector)
      if (chip?.dataset[chipAttr]) setActive(chip.dataset[chipAttr])
    })
  }

  if (clearButtonSelector) {
    document
      .querySelector<HTMLButtonElement>(clearButtonSelector)
      ?.addEventListener("click", () => setActive(null))
  }

  return { applyFilter, setActive, getActive: () => active }
}

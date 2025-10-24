;(function () {
  // Check if this script has already been initialized
  if (document.body.dataset.relativeDateUpdaterInitialized) {
    return
  }
  document.body.dataset.relativeDateUpdaterInitialized = "true"

  const updateRelativeDates = () => {
    const relativeTimeElements = document.querySelectorAll('time[data-relative="true"]')
    const now = new Date()

    relativeTimeElements.forEach((timeEl) => {
      const datetime = timeEl.getAttribute("datetime")
      if (!datetime) return

      // The default threshold can be set here or on the element
      const defaultThreshold = 30
      const thresholdAttr = timeEl.getAttribute("data-threshold")
      const threshold = thresholdAttr ? parseInt(thresholdAttr, 10) : defaultThreshold

      const date = new Date(datetime)
      const diffInDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)

      if (diffInDays <= threshold) {
        // Dynamically import date-fns only when needed
        import("date-fns/intlFormatDistance").then(({ intlFormatDistance }) => {
          try {
            // Determine locale from the <html> tag
            const locale = document.documentElement.lang || "en-US"
            const relativeText = intlFormatDistance(date, now, { locale })
            if (timeEl.textContent !== relativeText) {
              timeEl.textContent = relativeText
            }
          } catch (error) {
            console.warn("Failed to format relative date.", error)
          }
        })
      }
      // If outside the threshold, the server-rendered absolute date remains.
    })
  }

  // Initial update
  updateRelativeDates()

  // Update every 24 hours
  setInterval(updateRelativeDates, 86400000)
})()

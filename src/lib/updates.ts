import type { AstroComponentFactory } from "astro/runtime/server/index.js"
import { render, getCollection } from "astro:content"
import { createLocalDate } from "./utils"

export interface RenderedUpdate {
  date: Date // from update id
  Content: AstroComponentFactory
}

/**
 * Get the latest N updates and process them efficiently
 * If count is not passed, render all updates
 */
export async function getLatestUpdates(count?: number): Promise<RenderedUpdate[]> {
  const allUpdates = await getCollection("updates", ({ id }) => {
    const date = new Date(id)
    return !isNaN(date.getTime()) // Filter out invalid dates at query time
  })

  // Sort and slice
  const sortedUpdates = allUpdates.sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime())
  const latestUpdates = count && count > 0 ? sortedUpdates.slice(0, count) : sortedUpdates

  // Process only the latest updates
  const renderedUpdates = await Promise.all(
    latestUpdates.map(async (update) => {
      const { Content } = await render(update)
      const date = createLocalDate(update.id)
      return { Content, date }
    })
  )

  return renderedUpdates
}

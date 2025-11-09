import { defineCollection, reference, z } from "astro:content"
import { file, glob } from "astro/loaders"

import { ProfileLinkConfigSchema } from "@/schemas"

import { createLocalDate } from "@/lib/date-utils"
import { dedupLowerCase, dedupPreserveCase, slugify } from "@/lib/string-manipulation"

/**
 * @input string YYYY-MM
 * @returns Date object with year and month (defaults to first day of month)
 */
const yearMonthDateSchema = z
  .union([z.date(), z.coerce.date()])
  .describe("Should be valid YYYY-MM format.")

/** Accepts YYYY-MM-DD and ISO datetime formats */
const dateSchema = z
  .union([z.date(), z.string().transform(createLocalDate)])
  .refine((date) => !Number.isNaN(date.getTime()), {
    message:
      "Invalid date format. Must be YYYY-MM-DD or ISO datetime format.\n For more, see https://zod.dev/api#datetimes"
  })

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        description: z.string().max(200).optional(),
        createdAt: dateSchema,
        updatedAt: dateSchema.optional(),
        order: z.number().optional(),
        image: image().optional(),
        tags: z
          .array(z.string())
          .default([])
          .transform((arr) => dedupLowerCase(arr).map((tag) => slugify(tag))),
        authors: z.array(reference("authors")).default([]),
        draft: z.boolean().default(false)
      })
      .refine(
        (data) => {
          if (!data.createdAt || !data.updatedAt) return true
          return data.updatedAt > data.createdAt
        },
        {
          message: "Modified date must be after published date"
        }
      )
})

const authors = defineCollection({
  loader: file("./src/content/authors.toml"),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    pronouns: z.string().optional(),
    /**
     * Optional URL path to avatar, or /public/path/to/image.jpg.
     * The latter renders to /path/to/image.jpg, which you should use
     */
    avatar: z
      .string()
      .url()
      .or(z.string().startsWith("/"))
      .optional()
      .describe(
        "This author's avatar field only deal with image under /public/ directory or a remote image"
      ),
    bio: z.string().max(200).optional(),
    affiliation: z.string().max(100).optional(),
    links: ProfileLinkConfigSchema
  })
})

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/!(*README).{md,mdx}" }),
  schema: z
    .object({
      title: z.string(),
      isHighlighted: z.boolean().default(false),
      fromDate: yearMonthDateSchema.optional(),
      toDate: yearMonthDateSchema.optional(),
      repo: z.string().url().optional(),
      doc: z.string().url().optional(),
      url: z.string().url().optional(),
      release: z.string().url().optional(),
      context: z.enum(["school", "personal", "work", "community"]).optional(),
      description: z.string().max(150).optional(),
      tags: z
        .array(z.string())
        .default([])
        .transform((arr) => dedupPreserveCase(arr))
    })
    .refine(
      // Validate that toDate is after fromDate
      (data) => {
        if (!data.fromDate || !data.toDate) return true
        return data.toDate > data.fromDate
      },
      {
        message: "End date must be after start date"
      }
    )
})

const updates = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/updates" }),
  schema: z.object({})
})

export const collections = { blog, authors, projects, updates }

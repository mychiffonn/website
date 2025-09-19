import { defineCollection, reference, z } from "astro:content"
import { file, glob } from "astro/loaders"

import { ProfileLinkConfigSchema } from "@/lib/schemas"
import { dedupLowerCase, dedupPreserveCase, slugify } from "@/lib/string-manipulation"

/** Accepts both YYYY-MM and YYYY-MM-DD formats */
const dateSchema = z
  .union([
    // Accept ISO date strings (YYYY-MM-DD)
    z.coerce.date(),
    // Accept YYYY-MM format
    z
      .string()
      .regex(/^\d{4}-(?:0[1-9]|1[0-2])$/, "Invalid month format")
      .transform((val) => new Date(`${val}-01`))
  ])
  .refine((date) => !Number.isNaN(date.getTime()), {
    message: "Invalid date format. Must be YYYY-MM-DD or YYYY-MM"
  })

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        description: z.string().max(200).optional(),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date().optional(),
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
    links: ProfileLinkConfigSchema
  })
})

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/!(*README).{md,mdx}" }),
  schema: z
    .object({
      title: z.string(),
      isHighlighted: z.boolean().default(false),
      fromDate: dateSchema.optional(),
      toDate: dateSchema.optional(),
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

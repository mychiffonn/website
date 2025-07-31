import { defineCollection, reference, z } from "astro:content"
import { file, glob } from "astro/loaders"

import { ProfileLinkConfigSchema } from "@/lib/schemas"
import { dedupLowerCase, dedupPreserveCase } from "@/lib/string-manipulation"

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
        description: z.string(),
        publishDate: z.coerce.date(),
        modifiedDate: z.coerce.date().optional(),
        order: z.number().optional(),
        image: image().optional(),
        tags: z.array(z.string()).default([]).transform(dedupLowerCase),
        authors: z.array(reference("authors")).optional(),
        draft: z.boolean().default(false)
      })
      .refine(
        (data) => {
          if (!data.publishDate || !data.modifiedDate) return true
          return data.modifiedDate >= data.publishDate
        },
        {
          message: "Modified date must be after or equal to published date"
        }
      )
})

const authors = defineCollection({
  loader: file("./src/content/authors.toml"),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    pronouns: z.string().optional(),
    /** URL path to avatar, or /public/path/to/image.jpg.
     * The latter renders to /path/to/image.jpg, which you should use
     */
    avatar: z.string().url().or(z.string().startsWith("/")),
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
      context: z.enum(["school", "personal", "work", "collab"]).optional(),
      description: z.string().max(150).optional(),
      tags: z.array(z.string()).default([]).transform(dedupPreserveCase)
    })
    .refine(
      // Validate that toDate is after fromDate
      (data) => {
        if (!data.fromDate || !data.toDate) return true
        return data.toDate >= data.fromDate
      },
      {
        message: "End date must be after or equal to start date"
      }
    )
})

export const collections = { blog, authors, projects }

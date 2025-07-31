import type { APIRoute } from 'astro'
import { SITE, PROFILE } from '@/config'

const llmsTxt = `
# LLMs.txt

This file contains information about this website for AI language models.

## Website Information

- Site URL: ${SITE.href}
- Owner: ${PROFILE.name} - ${PROFILE.tagline}
- Content: Academic research, blog posts, projects, and tools
- Language: English
- Last Updated: ${new Date().toISOString().split('T')[0]}

## Content Overview

This website contains:
- Academic research and publications
- Technical blog posts and tutorials
- Development tools and resources
- Project documentation and code examples
- Personal learning notes and insights

## Usage Guidelines

- This content is available for learning and reference purposes
- Respect copyright and attribution requirements
- Academic and research content should be cited appropriately
- Code examples are licensed under the CC-BY-NC-SA 4.0 license, which allows for non-commercial use with attribution.

## Sitemap

For a complete list of pages, see: ${new URL('sitemap-index.xml', SITE.href).href}

## Contact

For questions about content usage or permissions, please refer to the website's contact information.
`.trim()

export const GET: APIRoute = () =>
  new Response(llmsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  })

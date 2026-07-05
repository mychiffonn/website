# Migration

For all coding tasks use your judgement to decide an appropriate lower power model and run that in a subagent. When a task in this project is primarily writing/editing code, drawing up a self-contained plan prompt and delegate to /codex CLI, gpt-5.5; review the result in the main loop before committing. Design, auditing, data synthesis, and anything judgment-heavy stays in the main model.

This project is built on astro-erudite v1.3.0 (remote upstream). However, currently it has a major updates, and is updated to v2.0.1. I want to migrate the base code to astro-erudite v2.0.1 (remote upstream) while still maintaining unique styling and features (remote origin). The latest remote origin is currently deployed at https://mychiffonn.com/, and the local code is messy since we're migrating.

Given this big goal, explore two codebases and make migration decisions. When in doubt & cannot resolve, ask me. If you feel like wiping out is better than this current mess, ask for my permission + show a better plan.

Here are some non-exhaustive examples of what to preserve from each version:

Astro-erudite v2.0.1: Read this blog very closely https://astro-erudite.vercel.app/blog/introducing-v2

- Satteri markdown engine & custom plugins
- Blog post & subpost architecture, except: Table of Contents (left slide out) and Po
- Removal of MDX & TailwindCSS
- Native CSS (extensive use of custom, semantic HTML element built from pure CSS) & Utopia for styling. Instead of compatibility with TailwindCSS, think about elegant usage of the new things mentioned in the blog post.
- For icon, don't use astro-icon, but maybe still use iconify to load

My version (remote origin):

- All of src/content/ (you can test blog post if needed, but others may stay)
- /public/ assets, which includes fonts and favicons
- Most of my website UI feel, from color scheme & typography, down to all hovering effect styling & button size. However, you need to recreate them with native CSS
- Publication
- Projects
- Obsidian-style callouts
- Sidenotes for showing footnotes

## When working with Codex

/codex CLI should be used for substantial implementation with clear plans. You can tweak the effort to "high" if you think the task is very hard.

You verify codex's work to the detail and confirm with the plan. Feel free to use skills, playwright, examine code, etc

# TODOs

- [x] Simplify Project Card (maybe no card or collapse), so a project only shows name, url, and short description by default. Minimalist but compatible design so it's easier for ppl to scroll — now `ProjectRow.astro`, borderless rows
- [x] Since projects are shorter, redesign other projects — one flat list, featured first, disclosure removed
- [x] Expose max number of experience to be displayed. 0 or none remove the section from index.astro — also `home.updateCount`, `home.publicationCount`, `blog.featuredPostCount`
- [x] Smooth transform animation for link underlines — wipe from the inline start, opt-in via `--underline-wipe`
- [x] Limit number of lines displayed (line clamp) for experience description, just like update description, both shown in index.astro — 2 lines
- [x] Celestial backgrounds barely visible on light theme — light-mode token overrides plus `--celestial-opacity` / `--celestial-column-alpha`
- [x] Move location from profile to footer instead
- [ ] Do UI changes for minimalism, accessibility, but still with some whims like celestrial. For example, check for optical alignment
- [x] Are all index.ts needed or even helping with build? — component barrels removed; `lib/blog`, `lib/expressive-code`, `lib/publications/data` kept (real modules, not re-export shims)

# Plans

## Celestial visual direction

Add a dreamy, celestial atmosphere inspired by the Astro Scholar 2.1 release
artwork without changing the theme's core color, typography, spacing, or shape
tokens.

### Design principles

- Derive every effect from the existing `--background`, `--foreground`,
  `--primary`, `--accent`, `--muted`, and `--border` tokens.
- Keep approximately 80% of the interface plain, 15% atmospheric, and 5%
  explicitly celestial so the site remains scholarly and readable.
- Use celestial motifs behind or around content, not inside prose, tables,
  filters, or other dense interfaces.
- Preserve the static-first implementation. Prefer CSS and decorative inline SVG
  over client-side JavaScript or a motion dependency.
- Support light and dark modes and disable decorative motion under
  `prefers-reduced-motion`.

### Proposed implementation

1. Add `src/styles/celestial.css` with derived effect tokens for translucent
   surfaces, lavender and mint glows, constellation lines, and layered shadows.
2. Create an accessible, non-interactive `CelestialBackdrop.astro` using sparse
   inline SVG orbits, constellation nodes, fine connecting lines, and one
   signature starburst.
3. Place the backdrop behind the home profile and selected page headers rather
   than applying it globally to every section.
4. Give selected publication and project cards a subtle translucent gradient,
   neutral image outline, and layered shadow using existing radii and spacing.
5. Add a small celestial detail to section headings while retaining the current
   primary-colored underline.
6. Reserve the full light/dark diagonal composition for hero and social-preview
   artwork.
7. Verify desktop and mobile layouts, keyboard and hover states, both color
   modes, contrast, and reduced-motion behavior.

### Suggested derived tokens

```css
:root {
  --celestial-accent-soft: color-mix(
    in oklab,
    var(--accent) 16%,
    transparent
  );
  --celestial-primary-soft: color-mix(
    in oklab,
    var(--primary) 14%,
    transparent
  );
  --celestial-line: color-mix(
    in oklab,
    var(--accent) 34%,
    transparent
  );
  --celestial-surface: color-mix(
    in oklab,
    var(--background) 82%,
    transparent
  );
  --celestial-shadow:
    0 0 0 1px color-mix(in oklab, var(--accent) 10%, transparent),
    0 1rem 3rem -1.5rem color-mix(in oklab, var(--accent) 30%, transparent);
}
```

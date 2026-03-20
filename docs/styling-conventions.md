# CSS Design Tokens & Styling Conventions

> Consult this file when adding or modifying any visual styles, colors, spacing, or typography.

## CSS File Organization

Styles are split across files in `src/styles/`, imported via `src/styles/index.css`:

| File             | Contents                                          |
| ---------------- | ------------------------------------------------- |
| `fonts.css`      | `@font-face` declarations (base64 Inter woff2)    |
| `tokens.css`     | `:root` primitives, semantic tokens, palette      |
| `layout.css`     | Slide, viewport, sidebar, main layout rules       |
| `components.css` | Item bars, headers, legend, context menus, modals |
| `ribbon.css`     | Control ribbon toolbar                            |
| `calendar.css`   | Calendar view styles                              |
| `animations.css` | `@keyframes` and transitions                      |

When adding new styles, place them in the appropriate file by category. Import order matters — `fonts.css` and `tokens.css` must come first.

## Token Architecture (three layers)

### 1. Primitive palette (`--_X###`)

Raw color values in the `:root` block (in `tokens.css`). Named by hue initial + shade number.

| Prefix | Hue          |
| ------ | ------------ |
| `--_N` | Neutral/grey |
| `--_B` | Blue         |
| `--_R` | Red          |
| `--_O` | Orange       |
| `--_L` | Lime/green   |
| `--_P` | Purple       |
| `--_T` | Teal         |
| `--_Y` | Yellow       |
| `--_M` | Magenta      |

**Never reference primitives directly in component CSS.** They exist only to feed the semantic layer.

### 2. Semantic tokens (`--color-*`, `--eq-*`)

Purpose-driven aliases that map primitives to UI roles:

- `--color-text`, `--color-text-subtle`, `--color-text-disabled`
- `--color-icon`, `--color-icon-danger`, `--color-icon-success`
- `--color-border`, `--color-border-focused`, `--color-border-danger`
- `--color-bg-neutral`, `--color-bg-neutral-hovered`, `--color-bg-neutral-pressed`
- `--eq-purple`, `--eq-text-primary`, `--eq-text-secondary` (brand tokens)

Use these in component styles.

### 3. Timeline palette (`--palette-0` through `--palette-7`)

Eight bar colors for timeline items. Items store `var(--palette-N)` as their `color` value. The palette is defined in `tokens.css` and referenced via the JS `PALETTE` array in `constants.js`.

## Key Conventions

- **All colors via tokens** — never hard-code `#hex` or `rgb()` in new rules. Find or create the appropriate semantic token.
- **`rgba()` for overlays/states** — hover/pressed states use `rgba(9, 30, 66, 0.06/0.14/0.23)` patterns for neutral backgrounds.
- **Font stack** — Inter (embedded as base64 woff2 in `fonts.css`) for UI; system fallback for non-Latin.
- **Spacing** — no formal spacing scale; use existing values as reference. Common gaps: `4px`, `6px`, `8px`, `10px`, `12px`, `16px`, `20px`.
- **Border radius** — `4px` for small elements, `8px` for cards/modals, `12px` for the slide container.
- **Shadows** — use `box-shadow` with `rgba(0,0,0,0.15–0.25)` for elevation. Modals use a larger spread.
- **Z-index ranges** — context menus and modals use `z-index: 999` / `1000`.

## html2canvas Compatibility

When adding CSS, verify it renders correctly in the PNG export. Known limitations:

- `backdrop-filter` is not supported
- Complex `clip-path` may not render
- CSS `filter` has partial support
- Inline SVG renders; external SVG references may not

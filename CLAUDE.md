# Timeline Template

Interactive browser-based timeline/Gantt-chart tool for planning and visualizing project schedules.

## Tech Stack

- **Single-file app**: Everything lives in `index.html` (HTML + CSS + JS)
- **Vanilla JS**: No frameworks — plain DOM manipulation with a custom `setState`/`render` cycle
- **CSS custom properties**: Atlassian-inspired design-token system (palette, semantic, component layers)
- **html2canvas**: PNG export; bundled inline as a minified IIFE
- **Deployment**: Static site on Vercel (`vercel.json` → `@vercel/static`)

## Critical Rules (apply to every change)

1. **Single-file constraint** — all application code stays in `index.html`. Do not split into separate `.js` or `.css` files.
2. **No frameworks** — do not introduce React, Vue, Preact, or any UI library. Use vanilla DOM APIs only.
3. **State via `setState()`** — all data mutations go through `setState(mutator)`, which deep-clones, applies the mutator, saves to localStorage, pushes undo history, and calls `render()`. Never mutate `STATE` directly.
4. **`render()` is the single source of DOM truth** — after any state change, `render()` rebuilds the timeline. Keep it idempotent.
5. **Design tokens over raw values** — use `var(--token-name)` for all colors, spacing, and typography. Never hard-code hex/rgb values in new code.
6. **Preserve export fidelity** — any visual change must look correct in both the live view and the html2canvas PNG export.
7. **localStorage contract** — the storage key is `timeline_tmpl_v1`. Do not change the schema without migration logic.

## Docs (consult when working in these areas)

| Area | File |
|------|------|
| Architecture & data model | [docs/architecture.md](docs/architecture.md) |
| CSS design tokens & styling | [docs/styling-conventions.md](docs/styling-conventions.md) |
| JS patterns & state management | [docs/vanilla-js-patterns.md](docs/vanilla-js-patterns.md) |
| Deployment & workflow | [docs/workflow.md](docs/workflow.md) |

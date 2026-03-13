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

## Agent behavior

1. **Visual verification** — After completing any UI task, take a screenshot or render preview and visually confirm the output looks correct. Check alignment, spacing, overflow, responsive behavior, and empty/loading states. Do not mark a task as done based on code correctness alone. If you cannot visually verify, flag it explicitly.
2. **Root cause discipline** — When a bug is reported or a change is requested, diagnose before acting. Determine whether the issue is a symptom of a deeper structural problem. If yes, propose fixing the root cause and explain the tradeoff. Do not patch symptoms silently — a senior engineer fixes the system, not the screenshot.

## Session Check

Before finishing any multi-file task, run `npm run session-check` to verify the entire repo passes ESLint and Prettier. Fix any errors before committing.

## Reference Docs

- When adding features, changing the state shape, or modifying swimlane/item data structures → read [docs/architecture.md](docs/architecture.md) first.
- When adding or changing colors, spacing, borders, fonts, or any CSS rule → read [docs/styling-conventions.md](docs/styling-conventions.md) first.
- When writing event handlers, modifying drag/drop, editing the render loop, or adding date logic → read [docs/vanilla-js-patterns.md](docs/vanilla-js-patterns.md) first.
- When deploying, updating bundled dependencies, or running the app locally → read [docs/workflow.md](docs/workflow.md) first.

# Timeline Template

Interactive browser-based timeline/Gantt-chart tool for planning and visualizing project schedules.

## Tech Stack

- **Vite** — dev server with HMR and production bundler
- **ES modules** — ~23 focused JS modules in `src/`
- **Vanilla JS** — no frameworks — plain DOM manipulation with a custom `setState`/`render` cycle
- **CSS custom properties** — Atlassian-inspired design-token system (palette, semantic, component layers)
- **html2canvas** — PNG export; installed from npm
- **Deployment** — Vite build to `dist/`, static hosting on Vercel

## File Structure

```
index.html                    — minimal HTML shell (~280 lines)
src/
  main.js                     — entry point: init, event wiring, toasts
  state.js                    — STATE holder, setState, undo/redo, persistence
  constants.js                — PALETTE, STORAGE_KEY, ZOOM_CONFIG, sizing constants
  controls.js                 — toolbar actions, navigation, UI updaters
  utils/
    date.js                   — fmt, parseDate, daysBetween, fiscal helpers
    dom.js                    — uid, cssVar, measureLabelText, makeCheckmark
    layout.js                 — getSidebarWidth, dateToX, xToDate, scale helpers
    tracks.js                 — assignTracks, findFreeTrack, getTrackCount
  render/
    render.js                 — main render() function
    header.js                 — buildHeader, buildHeaderRow
    sidebar.js                — buildSidebar, buildSidebarRow
    grid.js                   — buildGrid, buildTimelineArea
    item-bar.js               — buildItemBar
    legend.js                 — buildLegend
    calendar.js               — buildCalendarView
    logo.js                   — base64 SVG logo export
  interactions/
    drag.js                   — drag state, startMove, startResize, handlers
    menus.js                  — showMenu, dismissMenu, calendar popover
    dialogs.js                — showConfirm, showInfo
    inline-edit.js            — inline rename functions
    dropdowns.js              — ribbon dropdown builders
  io/
    csv.js                    — exportCSV, importCSV, parseCSVRow
    png.js                    — exportPNG (uses html2canvas)
  styles/
    index.css                 — imports all CSS files
    fonts.css                 — @font-face (base64 Inter)
    tokens.css                — design tokens + palette
    layout.css                — slide, viewport, sidebar layout
    components.css            — item bars, headers, legend, menus, modals
    ribbon.css                — control ribbon toolbar
    calendar.css              — calendar view styles
    animations.css            — keyframes, transitions
```

## Critical Rules (apply to every change)

1. **No frameworks** — do not introduce React, Vue, Preact, or any UI library. Use vanilla DOM APIs only.
2. **State via `setState()`** — all data mutations go through `setState(mutator)`, which deep-clones, applies the mutator, saves to localStorage, pushes undo history, and calls `render()`. Never mutate `STATE` directly.
3. **`render()` is the single source of DOM truth** — after any state change, `render()` rebuilds the timeline. Keep it idempotent.
4. **Design tokens over raw values** — use `var(--token-name)` for all colors, spacing, and typography. Never hard-code hex/rgb values in new code.
5. **Preserve export fidelity** — any visual change must look correct in both the live view and the html2canvas PNG export.
6. **localStorage contract** — the storage key is `timeline_tmpl_v1`. Do not change the schema without migration logic.
7. **Module boundaries** — keep modules focused. State access goes through `getState()`/`setState()` from `state.js`. The render callback is registered via `registerRenderFn()` to avoid circular imports.

## Agent behavior

1. **Visual verification** — After completing any UI task, take a screenshot or render preview and visually confirm the output looks correct. Check alignment, spacing, overflow, responsive behavior, and empty/loading states. Do not mark a task as done based on code correctness alone. If you cannot visually verify, flag it explicitly.
2. **Root cause discipline** — When a bug is reported or a change is requested, diagnose before acting. Determine whether the issue is a symptom of a deeper structural problem. If yes, propose fixing the root cause and explain the tradeoff. Do not patch symptoms silently — a senior engineer fixes the system, not the screenshot.

## Session Check

Before finishing any multi-file task, run `npm run session-check` to verify the entire repo passes ESLint and Prettier. Fix any errors before committing.

## Reference Docs

- When starting any task → read [docs/agent-engineering-standards.md](docs/agent-engineering-standards.md) first.
- When adding features, changing the state shape, or modifying swimlane/item data structures → read [docs/architecture.md](docs/architecture.md) first.
- When adding or changing colors, spacing, borders, fonts, or any CSS rule → read [docs/styling-conventions.md](docs/styling-conventions.md) first.
- When writing event handlers, modifying drag/drop, editing the render loop, or adding date logic → read [docs/vanilla-js-patterns.md](docs/vanilla-js-patterns.md) first.
- When deploying, updating bundled dependencies, or running the app locally → read [docs/workflow.md](docs/workflow.md) first.

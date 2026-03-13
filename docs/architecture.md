# Architecture & Data Model

> Consult this file when you need to understand how the app is structured, what the state shape looks like, or how major features connect.

## File Structure

```
index.html          — entire application (HTML + <style> + <script>)
vercel.json         — static deployment config
```

Everything is in one file. The `<style>` block holds all CSS (design tokens + component styles). The `<script>` block contains a bundled `html2canvas` IIFE followed by the application IIFE.

## Application IIFE Layout (inside `<script>`)

1. **Constants** — `PALETTE`, `STORAGE_KEY`, `MONTH_NAMES`, sizing constants (`MIN_BAR_WIDTH`, `DRAG_THRESHOLD`, etc.)
2. **Utility functions** — `uid()`, date helpers (`parseDate`, `fmt`, `addDays`, `daysBetween`), `fiscalQuarterRange()`
3. **State management** — `defaultState()`, `exampleState()`, `setState()`, `pushHistory()`, `undo()`, `redo()`
4. **Rendering** — `render()` rebuilds the entire timeline DOM; `updateSlideScale()` handles responsive fit
5. **Interactions** — drag-to-move (`startMove`), drag-to-resize (`startResize`), context menus, inline editing
6. **Import/Export** — `exportCSV()`, `importCSV()`, `exportPNG()` (via html2canvas)
7. **Init** — `loadState()`, event listener wiring, welcome/tip toasts

## State Shape (`STATE`)

```js
{
  timeline: {
    startDate: "YYYY-MM-DD",   // left edge of the visible range
    endDate: "YYYY-MM-DD",     // computed from startDate + monthCount
    monthCount: 12,             // how many months to display (1–24)
    title: "string",
    legendOrientation: "vertical" | "horizontal",
    legendAlign: "left" | "center" | "right",
    sidebarWidth: 180           // px width of the group-name sidebar
  },
  swimlanes: [
    { id, name, order, minRows: 1 }
  ],
  items: [
    { id, swimlaneId, name, startDate, endDate, color, track }
  ],
  legendLabels: {
    "var(--palette-N)": "Label text"  // maps palette color to legend label
  },
  isExample: true | false
}
```

### Key relationships

- Each **item** belongs to a **swimlane** via `swimlaneId`.
- `track` is the row within a swimlane (0-indexed) for stacking overlapping bars.
- `color` stores a CSS custom-property reference like `var(--palette-0)`, not a raw color.
- `legendLabels` maps palette colors to user-defined legend text.

## Persistence

- State is serialized to `localStorage` under key `timeline_tmpl_v1`.
- Writes are debounced (500 ms) via `saveState()`.
- On first visit, `exampleState()` loads sample data; the "Get Started" button resets to `defaultState()`.

## Undo/Redo

- `stateHistory[]` holds up to `MAX_HISTORY` (50) deep-cloned snapshots.
- `pushHistory()` appends after every `setState()` call.
- `undo()` / `redo()` move `historyIndex` and restore from the array.

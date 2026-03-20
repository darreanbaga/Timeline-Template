# Architecture & Data Model

> Consult this file when you need to understand how the app is structured, what the state shape looks like, or how major features connect.

## File Structure

```
index.html              — minimal HTML shell (control ribbon markup + <script type="module" src="/src/main.js">)
src/
  main.js               — entry point: imports, init, event wiring, toasts
  state.js              — STATE, setState, undo/redo, save/load, history
  constants.js          — PALETTE, STORAGE_KEY, ZOOM_CONFIG, sizing constants
  controls.js           — toolbar actions (zoom, navigate, add/delete, display mode)
  utils/                — pure utility functions
  render/               — DOM builder modules (render, header, sidebar, grid, item-bar, legend, calendar)
  interactions/         — user interaction handlers (drag, menus, dialogs, inline-edit, dropdowns)
  io/                   — import/export (csv, png)
  styles/               — CSS split into tokens, layout, components, ribbon, calendar, animations, fonts
```

## Module Dependency Overview

```
main.js
  ├── state.js          (registerRenderFn, loadState, setState, undo, redo)
  ├── controls.js       (shiftStartDate, setZoomLevel, addItem, deleteItem, ...)
  ├── render/render.js  (render)
  ├── interactions/*    (menus, dropdowns, dialogs)
  └── io/*              (csv, png)

state.js
  ├── constants.js
  ├── utils/tracks.js   (assignTracks — called inside setState)
  └── interactions/dialogs.js (dynamic import for showInfo)
  NOTE: does NOT import render.js — uses registerRenderFn callback

render/render.js
  ├── render/header.js, sidebar.js, grid.js, item-bar.js, legend.js, calendar.js
  ├── state.js          (getState, getSelectedItemId)
  └── utils/*           (layout, date, dom)
```

### Circular Dependency Resolution

The main cycle is `setState → render → builders → setState` (via callbacks). It's broken by:

- `state.js` exports `registerRenderFn(fn)` instead of importing `render.js`
- `main.js` calls `registerRenderFn(render)` at startup
- Similarly, `registerAssignTracksFn` and `registerShowInfoFn` break other cycles

## State Shape (`STATE`)

```js
{
  timeline: {
    startDate: "YYYY-MM-DD",   // left edge of the visible range
    endDate: "YYYY-MM-DD",     // computed from startDate + zoom config
    title: "string",
    zoomLevel: "day" | "week" | "month" | "quarter",
    displayMode: "timeline" | "calendar",
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

## State Access Pattern

Shared mutable state lives in `state.js` with getter/setter exports:

```js
import { getState, setState, getSelectedItemId, setSelectedItemId } from './state.js';

// Read state
const STATE = getState();

// Mutate state (triggers save + render)
setState(s => {
  s.items.push({ ... });
});
```

## Persistence

- State is serialized to `localStorage` under key `timeline_tmpl_v1`.
- Writes are debounced (500 ms) via `saveState()`.
- On first visit, `exampleState()` loads sample data; the "Get Started" button resets to `defaultState()`.

## Undo/Redo

- `stateHistory[]` holds up to `MAX_HISTORY` (50) deep-cloned snapshots.
- `pushHistory()` appends after every `setState()` call.
- `undo()` / `redo()` move `historyIndex` and restore from the array.

# Vanilla JS Patterns & State Management

> Consult this file when writing or modifying JavaScript logic, adding features, or working with the state/render cycle.

## Module Structure

The app is split into ~23 ES modules under `src/`. Each module has a single responsibility:

- **`state.js`** — owns all mutable shared state, exports accessor functions
- **`render/*.js`** — DOM builder modules, each building one section of the timeline
- **`interactions/*.js`** — user interaction handlers (drag, menus, editing)
- **`utils/*.js`** — pure utility functions (date math, layout measurement, DOM helpers)
- **`io/*.js`** — import/export (CSV, PNG)
- **`controls.js`** — toolbar action handlers
- **`main.js`** — init-only entry point, wires everything together

### State Access Pattern

Shared mutable state lives in `state.js` with getter/setter exports:

```js
import { getState, setState } from '../state.js';

// Read
const STATE = getState();

// Mutate (triggers save + render)
setState(s => {
  s.items.push({ id: uid(), ... });
});
```

Other shared state: `getSelectedItemId()` / `setSelectedItemId()` in `state.js`, `getDragState()` / `setDragState()` in `interactions/drag.js`.

### Avoiding Circular Imports

The `setState → render → builders → setState` cycle is broken with callback registration:

```js
// state.js — does NOT import render.js
let _renderFn = null;
export function registerRenderFn(fn) {
  _renderFn = fn;
}

// main.js — registers at startup
import { registerRenderFn } from './state.js';
import { render } from './render/render.js';
registerRenderFn(render);
```

Follow the same pattern (`registerXFn`) if you need to break new circular dependencies.

## State Management Pattern

```
User action → setState(mutator) → deep clone → apply mutator → assignTracks() → saveState() → pushHistory() → render()
```

### `setState(mutatorFn)`

```js
setState(s => {
  s.items.push({ id: uid(), swimlaneId: lane.id, name: 'New', ... });
});
```

- Receives a function that mutates a deep clone of `STATE`.
- After the mutator runs, the clone replaces `STATE`, then `assignTracks()`, `saveState()`, `pushHistory()`, and `render()` are called.
- **Never mutate `STATE` directly** outside of `setState`.

### `render()`

- Fully rebuilds the timeline DOM on every call (not diffing).
- Must be idempotent — calling it twice with the same state produces the same DOM.
- Located in `src/render/render.js`, delegates to `buildHeader`, `buildSidebar`, `buildGrid`, `buildItemBar`, `buildLegend`, etc.

## ID Generation

`uid()` (from `utils/dom.js`) uses `crypto.randomUUID()` when available, falling back to `Date.now().toString(36) + Math.random().toString(36).slice(2, 10)`. Used for swimlane and item IDs.

## Date Handling

All dates are stored as `"YYYY-MM-DD"` strings in state. Helper functions in `utils/date.js`:

| Function                   | Purpose                                                         |
| -------------------------- | --------------------------------------------------------------- |
| `parseDate(str)`           | String → `Date` object                                          |
| `fmt(date)`                | `Date` → `"YYYY-MM-DD"` string                                  |
| `addDays(date, n)`         | Returns new `Date` offset by `n` days                           |
| `daysBetween(a, b)`        | Integer day count between two dates                             |
| `fiscalQuarterRange(date)` | Returns `{start, end}` for the fiscal quarter containing `date` |

Fiscal year starts November 1 (`FY_START_MONTH = 10`, 0-indexed).

## Drag & Drop

Located in `src/interactions/drag.js`. Two drag modes:

1. **Move** (`startMove`) — drags an item bar horizontally (and across swimlanes). Snaps to day boundaries based on pixel-to-date math.
2. **Resize** (`startResize`) — drags the left or right edge of a bar. Type is `"left"` or `"right"`.

Both use `pointermove`/`pointerup` on `document` for tracking. A `DRAG_THRESHOLD` (5px) distinguishes clicks from drags.

Drag state is managed via `getDragState()` / `setDragState()` exported from `drag.js`.

## Track Assignment

`findFreeTrack(swimlaneId, startDate, endDate)` (in `utils/tracks.js`) returns the lowest `track` index where the new item doesn't overlap existing items in the same swimlane.

## Context Menus

`showMenu(menuItems, anchorEl)` (in `interactions/menus.js`) creates a positioned `.ctx-menu` div. Each menu item is `{ label, onClick }`. Dismissed on outside click or Escape.

## Modals / Dialogs

In `interactions/dialogs.js`:

- `showConfirm(message, onConfirm)` — confirmation dialog with Cancel/Confirm buttons.
- `showInfo(message)` — informational alert with a single OK button.
- Both create modal overlays dynamically and remove them on close.

## Event Listener Conventions

- Listeners are attached imperatively after DOM creation (in `render()` or at init time in `main.js`).
- Use `addEventListener`, not inline `onclick` attributes.
- Delegated listeners on `document` handle global concerns (click-outside, Escape key).

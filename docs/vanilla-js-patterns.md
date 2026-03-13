# Vanilla JS Patterns & State Management

> Consult this file when writing or modifying JavaScript logic, adding features, or working with the state/render cycle.

## State Management Pattern

The app uses an immutable-style state cycle inspired by React, but implemented in vanilla JS:

```
User action → setState(mutator) → deep clone → apply mutator → saveState() → pushHistory() → render()
```

### `setState(mutatorFn)`

```js
setState(s => {
  s.items.push({ id: uid(), swimlaneId: lane.id, name: 'New', ... });
});
```

- Receives a function that mutates a deep clone of `STATE`.
- After the mutator runs, the clone replaces `STATE`, then `saveState()` and `render()` are called.
- **Never mutate `STATE` directly** outside of `setState`.

### `render()`

- Fully rebuilds the timeline DOM on every call (not diffing).
- Must be idempotent — calling it twice with the same state produces the same DOM.
- Handles: month columns, gridlines, swimlane rows, item bars, sidebar labels, legend, title.

## ID Generation

`uid()` returns a short random string (`Math.random().toString(36).slice(2, 10)`). Used for swimlane and item IDs. Not cryptographically secure — fine for local state.

## Date Handling

All dates are stored as `"YYYY-MM-DD"` strings in state. Helper functions:

| Function                   | Purpose                                                         |
| -------------------------- | --------------------------------------------------------------- |
| `parseDate(str)`           | String → `Date` object                                          |
| `fmt(date)`                | `Date` → `"YYYY-MM-DD"` string                                  |
| `addDays(date, n)`         | Returns new `Date` offset by `n` days                           |
| `daysBetween(a, b)`        | Integer day count between two dates                             |
| `fiscalQuarterRange(date)` | Returns `{start, end}` for the fiscal quarter containing `date` |

Fiscal year starts November 1 (`FY_START_MONTH = 10`, 0-indexed).

## Drag & Drop

Two drag modes, both operating on the timeline grid:

1. **Move** (`startMove`) — drags an item bar horizontally (and across swimlanes). Snaps to day boundaries based on pixel-to-date math.
2. **Resize** (`startResize`) — drags the left or right edge of a bar. Type is `"left"` or `"right"`.

Both use `pointermove`/`pointerup` on `document` for tracking. A `DRAG_THRESHOLD` (5px) distinguishes clicks from drags.

## Track Assignment

`findFreeTrack(swimlaneId, startDate, endDate)` returns the lowest `track` index where the new item doesn't overlap existing items in the same swimlane.

## Context Menus

`showMenu(x, y, menuItems)` creates a positioned `.ctx-menu` div. Each menu item is `{ label, action }`. Dismissed on outside click or Escape.

## Modals / Dialogs

- `showConfirm(message, onConfirm)` — confirmation dialog with Cancel/Confirm buttons.
- `showInfo(message)` — informational alert with a single OK button.
- Both create modal overlays dynamically and remove them on close.

## Event Listener Conventions

- Listeners are attached imperatively after DOM creation (in `render()` or at init time).
- Use `addEventListener`, not inline `onclick` attributes.
- Delegated listeners on `document` handle global concerns (click-outside, Escape key).

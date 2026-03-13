# Tabled Items

> Things we've identified but deferred. Check items off as they're resolved.

## Conventions requiring manual review

These cannot be enforced by ESLint and need human review when working in the relevant area.

- [ ] CSS design tokens over raw `#hex`/`rgb()` values — verify no hard-coded colors in `<style>`
- [ ] html2canvas PNG export fidelity — manually verify after any CSS or DOM change
- [ ] localStorage schema migration — any STATE shape change needs migration logic in `loadState()`
- [ ] `render()` idempotency — must produce identical DOM when called twice with same state
- [ ] Primitive tokens (`--_X###`) only in the semantic layer, never in component CSS
- [ ] `findFreeTrack()` used for all new item track assignment

## Deferred lint warnings

Existing warnings in `index.html` to clean up when touching nearby code.

### Unused variables

- [ ] Line 2061 — `getTotalGridHeight` defined but never used
- [ ] Line 2070 — `getColWidth` defined but never used
- [ ] Line 2471 — `totalDays` assigned but never read
- [ ] Line 2538 — `totalWidth` assigned but never read
- [ ] Line 2596 — `labelName` assigned but never read
- [ ] Line 3056 — callback param `e` unused (rename to `_e`)

### Direct STATE mutation

- [ ] Line 1797 — `STATE.legendLabels = {}` in `loadState()` migration logic. Add `eslint-disable-next-line` comment.

### `.onclick` assignment → `addEventListener`

- [ ] Line 2924 — `showInfo()` OK button
- [ ] Lines 2943–2944 — `showConfirm()` Cancel/Delete buttons
- [ ] Line 3367 — CSV file input `onload` handler
- [ ] Line 3555 — Welcome toast "Get Started" button
- [ ] Line 3583 — Save-tip toast "Got it" button

### Function complexity

- [ ] Line 3180 — `startResize` has 6 params (max 5). Bundle into options object.

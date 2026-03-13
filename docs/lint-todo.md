# Lint Fix To-Do

> Existing lint warnings to clean up. Check items off as they're resolved.

## Unused variables (`no-unused-vars`)

- [ ] **Line 2061** — `getTotalGridHeight` is defined but never used. Remove or use it.
- [ ] **Line 2070** — `getColWidth` is defined but never used. Remove or use it.
- [ ] **Line 2471** — `totalDays` is assigned but never read. Remove the assignment.
- [ ] **Line 2538** — `totalWidth` is assigned but never read. Remove the assignment.
- [ ] **Line 2596** — `labelName` is assigned but never read. Remove the assignment.
- [ ] **Line 3056** — callback parameter `e` is unused. Rename to `_e`.

## Direct STATE mutation (`no-restricted-syntax`)

- [ ] **Line 1797** — `STATE.legendLabels = {}` in `loadState()`. This is migration logic and intentional. Add `// eslint-disable-next-line no-restricted-syntax` above it.

## `.onclick` assignment (`no-restricted-syntax`)

- [ ] **Line 2924** — `showInfo()` OK button: refactor to `addEventListener('click', ...)`.
- [ ] **Lines 2943–2944** — `showConfirm()` Cancel/Delete buttons: refactor to `addEventListener`.
- [ ] **Line 3367** — CSV file input `onload` handler: refactor to `addEventListener`.
- [ ] **Line 3555** — Welcome toast "Get Started" button: refactor to `addEventListener`.
- [ ] **Line 3583** — Save-tip toast "Got it" button: refactor to `addEventListener`.

## Function complexity (`max-params`)

- [ ] **Line 3180** — `startResize(e, item, type, tlStart, totalDays, totalWidth)` has 6 params (max 5). Bundle related args into an options object, e.g. `startResize(e, item, type, { tlStart, totalDays, totalWidth })`.

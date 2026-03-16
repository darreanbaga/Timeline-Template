# PRD: Calendar View Enhancements

**Status:** Final
**Date:** 2026-03-16
**Author:** AI-assisted

---

## 1. Overview

The Timeline Template app currently has a basic calendar view that displays timeline items on a month-by-month grid. This PRD defines the requirements to bring the calendar view to feature parity with the timeline view and make it a fully interactive, first-class display mode.

### Current State

The existing calendar view (`buildCalendarView()`) provides:
- Month-by-month grid layout with horizontally-scrollable slides
- Day number display with today highlighting
- Item bars rendered across week rows with multi-week continuation
- Track assignment to avoid vertical overlaps (capped at 4 visible tracks)
- Overflow indicator ("+N more") for weeks with many items
- Prev/next navigation between months
- Legend display
- Title display with rename support

### What's Missing

The calendar view is **read-only** — users cannot create, edit, move, resize, or delete items. All data manipulation requires switching back to the timeline view. This creates friction and breaks the user's flow.

---

## 2. Goals

1. **Interactive editing** — Users can create, move, resize, and delete items directly from the calendar view.
2. **Visual consistency** — Calendar interactions feel consistent with the timeline view (same context menus, same edit patterns).
3. **Information density** — Users can see enough detail about each item without leaving the calendar.
4. **Export support** — Calendar view renders correctly in PNG export via html2canvas.
5. **No regressions** — All existing timeline view functionality remains intact.

### Non-Goals

- Weekly or daily calendar views (out of scope; the calendar remains month-grid only)
- Recurring event support
- External calendar integration (iCal, Google Calendar)
- Drag-and-drop between swimlanes (calendar has no swimlane axis)
- Swimlane selection or assignment UI in calendar view (new items silently use the first swimlane)
- Multi-month side-by-side layout (one month per slide, always)
- Configurable week start day (Sunday is fixed)
- Hourly granularity (daily only)
- Click-to-open edit popovers (interactions use click-and-drag like the timeline view)

---

## 3. Requirements

### 3.1 Item Creation

| ID | Requirement | Priority |
|----|-------------|----------|
| CR-1 | Click on an empty day cell to create a new item starting and ending on that date | P0 |
| CR-2 | Click-and-drag across multiple day cells to create an item spanning that date range | P1 |
| CR-3 | New items use the next available palette color and are assigned to the first swimlane | P0 |
| CR-4 | After creation, immediately enter inline name editing on the new bar | P1 |

**Behavior details:**
- Dragging across week boundaries should work seamlessly — the item spans the full date range.
- If no swimlanes exist, one is created automatically (matching timeline view behavior).

### 3.2 Item Editing

| ID | Requirement | Priority |
|----|-------------|----------|
| ED-1 | Click on an item bar to select it (visual highlight with outline or glow) | P0 |
| ED-2 | Double-click on an item bar to inline-edit its name | P0 |
| ED-3 | Right-click / long-press on an item bar to open a context menu | P0 |
| ED-4 | Context menu options: Rename, Change Color, Delete | P0 |
| ED-5 | Color picker submenu shows the 8 palette colors (same as timeline view) | P0 |

### 3.3 Item Moving (Drag & Drop)

| ID | Requirement | Priority |
|----|-------------|----------|
| MV-1 | Drag an item bar horizontally to move it to different dates within the same week row | P1 |
| MV-2 | Drag an item bar to a different week to shift its date range | P1 |
| MV-3 | Visual feedback during drag: ghost bar at original position, active bar following cursor | P2 |
| MV-4 | Snap to day boundaries (same pixel-to-date math pattern as timeline view) | P1 |
| MV-5 | Moving an item across month boundaries updates the item dates and re-renders both months | P1 |

### 3.4 Item Resizing

| ID | Requirement | Priority |
|----|-------------|----------|
| RS-1 | Hover on the left/right edge of an item bar shows a resize cursor | P1 |
| RS-2 | Drag the edge to extend or shorten the item's date range | P1 |
| RS-3 | Minimum item duration is 1 day | P1 |
| RS-4 | Resizing across week/month boundaries works correctly | P1 |

### 3.5 Item Deletion

| ID | Requirement | Priority |
|----|-------------|----------|
| DL-1 | Delete via context menu (with confirmation dialog) | P0 |
| DL-2 | Delete via keyboard shortcut (Backspace/Delete) when item is selected | P1 |

### 3.6 Visual & UX Enhancements

| ID | Requirement | Priority |
|----|-------------|----------|
| UX-1 | Hover state on item bars (subtle brightness/elevation change) | P0 |
| UX-2 | Tooltip on hover showing: item name, date range, duration in days | P0 |
| UX-3 | "Today" button in nav row to quickly scroll to the current month | P1 |
| UX-4 | Show all item tracks (remove the 4-track cap) with scrollable week rows if needed | P2 |
| UX-5 | Click on "+N more" overflow indicator to expand and show all items for that week | P1 |
| UX-6 | Keyboard navigation: arrow keys to move between months when calendar is focused | P2 |

### 3.7 Data Consistency

| ID | Requirement | Priority |
|----|-------------|----------|
| DC-1 | All mutations go through `setState()` — calendar view never mutates STATE directly | P0 |
| DC-2 | Undo/redo works for all calendar-initiated edits | P0 |
| DC-3 | Switching between timeline and calendar views preserves all state | P0 |
| DC-4 | Track assignment (`findFreeTrack`) is called after calendar-initiated creates/moves | P0 |

### 3.8 Export

| ID | Requirement | Priority |
|----|-------------|----------|
| EX-1 | PNG export of calendar view renders correctly via html2canvas | P1 |
| EX-2 | CSV export includes all items regardless of current display mode | P0 |
| EX-3 | Calendar CSS avoids html2canvas-incompatible properties (no `backdrop-filter`, complex `clip-path`) | P1 |

---

## 4. Technical Design Constraints

These constraints derive from the existing architecture (see `docs/architecture.md`):

1. **Single-file constraint** — All new code goes in `index.html`. No separate JS/CSS files.
2. **No frameworks** — Vanilla DOM APIs only. No React, no Preact, no lit-html.
3. **State via `setState()`** — All data mutations use the existing `setState(mutator)` pattern with deep-clone, save, push-history, render.
4. **`render()` idempotency** — The `buildCalendarView()` function must remain a pure function of `STATE`. No side effects beyond DOM construction.
5. **Design tokens** — All new colors, spacing, and typography use `var(--token-name)`. No hard-coded hex values.
6. **Date helpers** — Use existing `parseDate()`, `fmt()`, `addDays()`, `daysBetween()`. Do not create duplicate helpers.
7. **Context menus** — Use existing `showMenu(menuItems, anchorEl)` pattern.
8. **Modals** — Use existing `showConfirm()` / `showInfo()` for confirmations.

---

## 5. Phased Implementation Plan

### Phase 1: Core Interactions (P0)
- Item selection (click to select, visual highlight)
- Context menu on right-click (rename, change color, delete)
- Inline name editing (double-click)
- Click-to-create on empty day cells
- Hover states on item bars
- Tooltip on hover
- All mutations through `setState()` with undo/redo

### Phase 2: Drag Operations (P1)
- Drag-to-create across day cells
- Drag-to-move items
- Drag-to-resize items (left/right edges)
- Cross-week and cross-month drag support
- "Today" nav button
- "+N more" expand behavior

### Phase 3: Polish (P2)
- Drag ghost/preview visuals
- Remove 4-track cap (scrollable week rows)
- Keyboard navigation between months
- PNG export verification and fixes

---

## 6. Success Metrics

- Users can perform all common item operations (create, rename, recolor, move, delete) without switching to timeline view.
- Undo/redo works correctly for every calendar-initiated mutation.
- No visual regressions in timeline view or PNG export.
- Calendar view renders correctly at viewport widths from 375px to 1440px.

---

## 7. Resolved Decisions

1. **Swimlane assignment** — Ignored in calendar view. New items silently use the first swimlane. No swimlane picker UI.
2. **Multi-month view** — No. One month per slide, always.
3. **Week start day** — No. Sunday is fixed (not configurable).
4. **Interaction model** — Click-and-drag like the timeline view. No edit popovers or hourly granularity — daily only.

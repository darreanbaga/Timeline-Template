# Agent Engineering Standards

These are working instructions. Follow them on every task, not selectively.

## Visual verification protocol

After any UI change, render the result and review it before reporting completion.
Review means: check spacing against the design-token grid (`--space-*` values), confirm text does not overflow its container at any reasonable content length, and verify all interactive states — hover, focus, disabled, empty, loading, and error.
Test at both mobile (~375px) and desktop (~1280px) widths. If only one breakpoint is relevant, state which and why.
If something looks off — misaligned elements, clipped text, inconsistent padding — fix it before telling the user the task is done.
If you cannot visually verify (e.g., no screenshot capability in the current environment), say so explicitly. Do not silently skip this step.
Example: after adding a new modal, render it with zero items, one item, and many items. Check that the close button is reachable, the overlay covers the viewport, and focus is trapped.

## Root cause analysis

When a bug is reported — e.g., "this button is misaligned" — do not immediately add `margin-left` to that button.
Diagnostic process:
1. Reproduce the issue and confirm the exact symptoms.
2. Identify the layer where it originates: data (wrong value), logic (wrong branch), layout (wrong flex/grid setup), or styling (wrong token or override).
3. Trace upward: is the parent container's layout wrong? Is a standard wrapper missing? Is the spacing system being bypassed with a hardcoded value?
4. Fix at the originating layer, not at the symptom.
5. After fixing, verify siblings and related components were not broken by the change.
Example: a misaligned button may be caused by the parent using `align-items: baseline` instead of `center`. Fixing the parent fixes all children; patching one button hides the problem for the rest.

## Defensive implementation

Before writing new code, search the codebase for existing utilities, helpers, or patterns that already handle the case.
Duplication is a root cause of future bugs. If you find a similar pattern used inconsistently (e.g., two different date-formatting approaches), flag it and propose consolidation rather than adding a third variant.
When extending an existing pattern, follow the established conventions exactly — same naming, same parameter order, same error handling.
If no existing pattern fits, implement the minimal version. Do not build abstractions for a single use case.
Example: before writing a new `formatDate()` helper, search for existing date formatting in the codebase. If one exists, use it. If two exist and they differ, flag the inconsistency to the user before proceeding.

## Completion checklist

Before reporting any task as done, confirm every item:
- [ ] Linter passes (`npm run session-check` or equivalent).
- [ ] Visual review done (see protocol above). If skipped, state why.
- [ ] No hardcoded color, spacing, or font values — use design tokens (`var(--*)`).
- [ ] No commented-out code left behind. Delete it or restore it; do not leave it in limbo.
- [ ] No `console.log` statements unless they are intentional debug utilities.
- [ ] The change does not break adjacent functionality — test the surrounding UI, not just the changed element.
- [ ] If state shape changed, localStorage migration logic is in place.
Do not skip items because the task felt small. Small changes break things too.

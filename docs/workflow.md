# Deployment & Workflow

> Consult this file when deploying, testing changes locally, or modifying the build/deploy pipeline.

## Deployment

- **Platform**: Vercel (static hosting)
- **Config**: `vercel.json` uses `@vercel/static` for all files
- **No build step** — the repo is served as-is. `index.html` is the entry point.
- Pushing to the main branch triggers a Vercel deployment automatically.

## Local Development

1. Serve the project root with any static server:
   ```bash
   npx serve .
   # or
   python3 -m http.server 8000
   ```
2. Open `http://localhost:<port>/` in a browser.
3. There is no hot-reload — refresh the page after editing `index.html`.

## Linting & Formatting

Run `npm install` once to set up dev dependencies, then:

| Command | What it does |
|---------|-------------|
| `npm run lint` | Check JS for errors and convention violations |
| `npm run lint:fix` | Auto-fix what ESLint can (e.g. `var` → `const`) |
| `npm run format` | Run Prettier on all HTML, CSS, JS, JSON, and MD files |

ESLint extracts `<script>` blocks from `index.html` via `eslint-plugin-html`. The vendored html2canvas block is skipped with `/* eslint-disable */`.

**Baseline**: 0 errors, warnings only. Keep it that way — do not merge new errors.

### Convention rules enforced by ESLint

- **`no-restricted-syntax`**: warns on direct `STATE.x =` mutation (use `setState`) and `.onclick =` assignment (use `addEventListener`)
- **`no-restricted-globals`**: errors on `React`, `ReactDOM`, `Vue`, `Alpine` — no frameworks allowed
- **`no-eval` / `no-implied-eval` / `no-new-func`**: errors on eval-family calls
- **`max-depth: 6` / `max-params: 5`**: warns on overly nested or parameter-heavy functions

See `eslint.config.js` for the full rule set.

## Testing Changes

No automated test suite exists. Manual verification checklist:

- [ ] Timeline renders with example data on fresh load (clear localStorage first)
- [ ] Add/edit/delete swimlanes and items
- [ ] Drag to move and resize items
- [ ] Undo/redo works correctly
- [ ] CSV export → re-import round-trips without data loss
- [ ] PNG export captures the full timeline accurately
- [ ] Legend labels display and persist
- [ ] Responsive: slide scales to fit the viewport

## Git Conventions

- All application changes are to `index.html` — keep diffs focused.
- Commit messages should describe the user-visible change (e.g., "Add legend alignment toggle" not "Update index.html").

## Dependencies

| Dependency | Version | How included |
|------------|---------|--------------|
| html2canvas | 1.4.1 | Inline minified IIFE in `<script>` |
| Inter font | — | Base64-encoded woff2 in `<style>` `@font-face` |

Dev tooling (ESLint, Prettier) is in `package.json` — these are dev-only and not shipped. To update html2canvas, replace the minified block between the `html2canvas` comment markers.

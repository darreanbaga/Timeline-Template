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

No `package.json`, no `node_modules`, no npm dependencies. To update html2canvas, replace the minified block between the `html2canvas` comment markers.

# Deployment & Workflow

> Consult this file when deploying, testing changes locally, or modifying the build/deploy pipeline.

## Deployment

- **Platform**: Vercel (static hosting)
- **Config**: `vercel.json` — `buildCommand: "npm run build"`, `outputDirectory: "dist"`
- **Build tool**: Vite bundles `src/` modules + CSS into optimized output in `dist/`
- Pushing to the main branch triggers a Vercel deployment automatically.

## Local Development

```bash
npm install          # install dependencies (first time)
npm run dev          # start Vite dev server with HMR
```

Open the URL shown by Vite (usually `http://localhost:5173/`). Changes to JS and CSS files hot-reload automatically.

Other commands:

| Command                 | What it does                                          |
| ----------------------- | ----------------------------------------------------- |
| `npm run dev`           | Start Vite dev server with hot module replacement     |
| `npm run build`         | Production build to `dist/`                           |
| `npm run preview`       | Serve the production build locally                    |
| `npm run lint`          | Check JS for errors and convention violations         |
| `npm run lint:fix`      | Auto-fix what ESLint can                              |
| `npm run format`        | Run Prettier on all HTML, CSS, JS, JSON, and MD files |
| `npm run session-check` | ESLint + Prettier check (used before committing)      |

## Linting & Formatting

ESLint is configured in `eslint.config.js` targeting `src/**/*.js` files as ES modules.

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

- Commit messages should describe the user-visible change (e.g., "Add legend alignment toggle" not "Update main.js").
- Keep modules focused — each file should have a single responsibility.

## Dependencies

| Dependency  | Version | How included                                   |
| ----------- | ------- | ---------------------------------------------- |
| html2canvas | 1.4.1   | npm package, imported in `src/io/png.js`       |
| Inter font  | —       | Base64-encoded woff2 in `src/styles/fonts.css` |
| Vite        | 8.x     | Dev dependency, bundler                        |

Dev tooling (ESLint, Prettier, Husky) is in `package.json` — these are dev-only and not shipped.

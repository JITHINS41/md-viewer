# Changelog

All notable changes to the ARS Markdown Viewer are documented in this file.

## [Unreleased] - 2026-07-02

### Added
- **In-document search** — a search bar (input, previous/next, match counter, clear) appears once a file is loaded and lets you find text within the rendered document. Matches are highlighted, the current match is scrolled into view, and Enter/Shift+Enter or the arrow buttons cycle through results.

### Changed
- **Layout overhaul to maximize reading space**:
  - Header collapsed from a two-row, heavily padded block into a single compact row (title + file controls).
  - Removed redundant double-padding between the preview pane and the inner document card.
  - Widened the content container and reduced the side gutters on large screens.
  - The document pane now scrolls independently while the header stays fixed in place (rather than the whole page scrolling).
- **Color theme** — replaced the purple/indigo palette with a green and red theme matching the ARS logo, applied to the header, headings, links, blockquotes, inline code, and table headers.

### Rollout Plan
- This is a static, single-file app (`index.html`, no build step, no dependencies) — rollout is a direct file replace/redeploy.
- No backend, database, or API involved — no data migration required.
- **Verification performed**: headless-browser checks at desktop (1920px, 1400px) and mobile (600px) widths covering the empty state, a loaded document, and the search flow (bar hidden pre-load, appears post-load, highlighting, next/prev navigation, clear).
- **Post-deploy smoke test**: open the app, upload `sample.md`, confirm it renders with the new theme, run one search query and confirm highlighting/navigation, resize the window to confirm the layout holds up on a narrow screen.
- **Rollback**: restore the previous `index.html` — no state or schema to revert.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

ARS Markdown Viewer — a React + TypeScript + Vite app that renders `.md`/`.markdown`/`.txt` files in the browser. Client-side only, no backend.

This was migrated from an earlier single-file vanilla HTML/CSS/JS version (see git history prior to this branch's root commit if you need to compare behavior).

## Commands

- `npm run dev` — Vite dev server with HMR
- `npm run build` — `tsc -b && vite build`; run this to catch type errors before considering a change done
- `npm run lint` — oxlint
- `npm run preview` — serve the production build locally

There is no test suite.

## Architecture

- `src/lib/markdownParser.ts` — `MarkdownParser` class, a hand-rolled line-based Markdown-to-HTML parser (not a spec-compliant parser, not using any markdown library). `highlightCode()` does its own crude regex-based keyword/string/comment/number coloring per language (javascript/python/java/html keyword lists are hardcoded) — not a real syntax highlighter. Ported behavior-for-behavior from the original vanilla implementation; avoid "fixing" its regex quirks unless asked, since parity with existing rendered output matters.
- `src/lib/highlightTextNodes.ts` — DOM utility used by search: walks text nodes under a given element and wraps matches in `<mark class="search-highlight">`, leaving existing HTML structure untouched.
- `src/hooks/useSearch.ts` — search state (`query`/`activeIndex`) plus a derived `displayHtml`/`matchCount` computed via `useMemo` from `(html, query, activeIndex)`. Highlighting is done by parsing `html` into a **detached** scratch `<div>` (never attached to the document), running `highlightTextNodes` on that, then reading back `.innerHTML` as a plain string — React then renders `displayHtml` normally via `dangerouslySetInnerHTML`. Do not mutate the live preview container's DOM directly (e.g. `outputRef.current.innerHTML = ...`) to inject highlights — that was tried and is a real bug: React resets `dangerouslySetInnerHTML` back to the last-rendered `html` prop on the next render regardless of whether the string is unchanged, silently wiping any highlights injected outside of React's own render. `containerRef` is only used to `scrollIntoView` the active match after commit — never to write to the DOM.
- `src/App.tsx` — owns `tabs` (array of `{ id, name, html }`) and `activeTabId`; each tab stores its already-rendered HTML string (parsed once on file open, not re-parsed on tab switch). Passes `search.displayHtml` (not the raw tab `html`) to `PreviewPane` so highlights actually render. Handles the hidden file `<input>`, drag-and-drop, and wires `TabsBar` / `SearchBar` / `PreviewPane`.
- `src/components/PreviewPane.tsx` — renders either the empty-state prompt (with the primary "Choose File" upload button) or the given `html` via `dangerouslySetInnerHTML`. Purely presentational — it doesn't know about search; the forwarded ref is read-only for `useSearch`'s scroll-into-view.
- `src/components/TabsBar.tsx` — renders open tabs plus a trailing "+" button (opens the same file dialog as the empty state) so files can be added after the first is loaded.

## Things to know when editing

- Markdown content is rendered via `dangerouslySetInnerHTML` without sanitization — this is a local single-user file viewer, not something that should be pointed at untrusted remote content without adding sanitization.
- Closing the last tab must restore the empty state (`activeTabId = null`, `tabs = []`); `PreviewPane` renders the empty-state JSX directly when `html` is `null`, so there's no separate HTML-string constant to keep in sync.
- Search state resets whenever the active tab's `html` changes (new tab opened or switched) — see the `useEffect` keyed on `html` in `useSearch.ts`. Don't reintroduce a global/shared search state across tabs.

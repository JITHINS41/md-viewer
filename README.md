# ARS Markdown Viewer

A React + TypeScript app to view `.md` / `.markdown` / `.txt` files in the browser, entirely client-side.

## Features

- Open one or more files via the file picker or drag-and-drop, each in its own closable tab
- In-document search with match highlighting and next/previous navigation
- Hand-rolled Markdown-to-HTML parser (headings, lists, tables, code blocks with basic keyword highlighting, blockquotes, links, images, bold/italic)

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL in a browser.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc -b`) and produce a production build in `dist/`
- `npm run preview` — preview the production build locally
- `npm run lint` — run oxlint

## Project structure

```
src/
  components/   Header, TabsBar, SearchBar, PreviewPane
  hooks/        useSearch — in-document search state/highlighting
  lib/          markdownParser (parser), highlightTextNodes (search DOM utility)
  App.tsx       wires tabs, file open/drag-drop, and search together
```

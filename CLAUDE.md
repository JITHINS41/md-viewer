# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

ARS Markdown Viewer — a single-file, zero-dependency web app that renders `.md`/`.markdown`/`.txt` files in the browser. Everything (HTML structure, CSS, and JS) lives in `index.html`. There is no build step, no package manager, and no test suite.

## Running it

Just open `index.html` directly in a browser (double-click, or `start index.html` on Windows). No server, install, or build command is needed or exists.

## Architecture

All logic is inline in `index.html`, in one `<script>` block, structured as:

- **`MarkdownParser` class** — a hand-rolled Markdown-to-HTML parser (line-based, walks an index `i` through `lines` array). It is NOT using Marked.js or Highlight.js despite what `README.md` claims — those libraries are not actually loaded anywhere in the file. Treat the README's "External Libraries" section as aspirational/stale, not accurate.
  - `parse()` is the main dispatch loop: checks each line for code fences, hr, headings, blockquotes, lists, tables, then falls back to paragraphs.
  - `parseInline()` handles inline formatting (bold/italic/code/links/images) via sequential regex replacements — order matters (e.g. `***bold italic***` must be matched before `**bold**`/`*italic*`).
  - `parseList()` and `parseTable()` consume multiple lines starting at an index and report back the index they stopped at (`this.listEndIndex` / returned `endIndex`) so the outer `parse()` loop can skip past the consumed block.
  - `highlightCode()` does its own crude keyword/string/comment/number highlighting per language (javascript/python/java/html keyword lists are hardcoded in the constructor) — this is not a real syntax highlighter, just regex-based coloring.
- **File loading**: a hidden `<input type="file">` plus drag-and-drop on `.container`, both funnel into `FileReader.readAsText`, which then calls `parser.parse()` and injects the resulting HTML into `#output` via `innerHTML`.

## Things to know when editing

- Since markdown content is rendered via `innerHTML` without sanitization, any change here should keep in mind this is a local single-user file viewer, not something that should be pointed at untrusted remote content without adding sanitization.
- `sample.md` is a demo file exercising most supported syntax (headings, lists, tables, code blocks, blockquotes, links) — use it to manually smoke-test parser changes by loading it in the browser.
- Because everything is in one file, prefer targeted edits over restructuring; there's no module system to split concerns across files unless you deliberately introduce one.

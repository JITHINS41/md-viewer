import { useEffect, useMemo, useState, type RefObject } from 'react';
import { highlightTextNodes } from '../lib/highlightTextNodes';

// Builds the highlighted HTML as a plain string, using a detached (unattached
// to the document) scratch element so the highlighting logic can reuse the
// same DOM TreeWalker approach without touching what React actually renders.
// React then owns the real DOM update via dangerouslySetInnerHTML as normal —
// no imperative mutation of the live container, so nothing fights React's
// reconciliation.
function buildHighlightedHtml(html: string, query: string, activeIndex: number) {
  if (!query) return { html, matchCount: 0 };

  const scratch = document.createElement('div');
  scratch.innerHTML = html;

  const root = scratch.querySelector('.markdown-content') ?? scratch;
  highlightTextNodes(root, query);

  const marks = scratch.querySelectorAll('mark.search-highlight');
  const matchCount = marks.length;
  if (matchCount > 0) {
    const normalized = ((activeIndex % matchCount) + matchCount) % matchCount;
    marks[normalized].classList.add('active');
  }

  return { html: scratch.innerHTML, matchCount };
}

export function useSearch(containerRef: RefObject<HTMLDivElement | null>, html: string) {
  const [query, setQueryState] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset search whenever the active document's content changes (tab switch
  // or newly opened file).
  useEffect(() => {
    setQueryState('');
    setActiveIndex(0);
  }, [html]);

  const { html: displayHtml, matchCount } = useMemo(
    () => buildHighlightedHtml(html, query, activeIndex),
    [html, query, activeIndex],
  );

  const currentIndex = matchCount > 0 ? ((activeIndex % matchCount) + matchCount) % matchCount : -1;

  // Scroll the active match into view once React has committed it.
  useEffect(() => {
    if (currentIndex === -1) return;
    containerRef.current?.querySelector('mark.search-highlight.active')?.scrollIntoView({
      block: 'center',
      behavior: 'smooth',
    });
  }, [displayHtml, currentIndex, containerRef]);

  const setQuery = (q: string) => {
    setQueryState(q);
    setActiveIndex(0);
  };

  return {
    query,
    matchCount,
    currentIndex,
    displayHtml,
    setQuery,
    goNext: () => setActiveIndex((i) => i + 1),
    goPrev: () => setActiveIndex((i) => i - 1),
    clear: () => setQuery(''),
  };
}

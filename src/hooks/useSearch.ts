import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { highlightTextNodes } from '../lib/highlightTextNodes';

// Highlights matches by mutating the DOM directly inside `containerRef`
// (mirroring the original vanilla-JS approach) rather than modeling matches
// in an AST — React only re-renders the container's innerHTML when `html`
// itself changes, so these imperative highlights survive unrelated re-renders.
export function useSearch(containerRef: RefObject<HTMLDivElement | null>, html: string) {
  const [query, setQueryState] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const matchesRef = useRef<HTMLElement[]>([]);

  const highlightActive = useCallback((index: number) => {
    matchesRef.current.forEach((m) => m.classList.remove('active'));
    const match = matchesRef.current[index];
    if (match) {
      match.classList.add('active');
      match.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, []);

  const runSearch = useCallback((q: string) => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = html;
    matchesRef.current = [];

    const contentEl = container.querySelector('.markdown-content');
    if (q && contentEl) {
      highlightTextNodes(contentEl, q);
      matchesRef.current = Array.from(container.querySelectorAll('mark.search-highlight'));
    }

    setMatchCount(matchesRef.current.length);
    if (matchesRef.current.length > 0) {
      setCurrentIndex(0);
      highlightActive(0);
    } else {
      setCurrentIndex(-1);
    }
  }, [containerRef, html, highlightActive]);

  const setQuery = useCallback((q: string) => {
    setQueryState(q);
    runSearch(q.trim());
  }, [runSearch]);

  const goTo = useCallback((index: number) => {
    if (matchesRef.current.length === 0) return;
    const next = ((index % matchesRef.current.length) + matchesRef.current.length) % matchesRef.current.length;
    setCurrentIndex(next);
    highlightActive(next);
  }, [highlightActive]);

  // Reset search state whenever the active document's content changes
  // (tab switch or newly opened file) — React resets the DOM itself.
  useEffect(() => {
    setQueryState('');
    setMatchCount(0);
    setCurrentIndex(-1);
    matchesRef.current = [];
  }, [html]);

  return {
    query,
    matchCount,
    currentIndex,
    setQuery,
    goNext: () => goTo(currentIndex + 1),
    goPrev: () => goTo(currentIndex - 1),
    clear: () => setQuery(''),
  };
}

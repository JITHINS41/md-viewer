interface SearchBarProps {
  visible: boolean;
  query: string;
  matchCount: number;
  currentIndex: number;
  onQueryChange: (query: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onClear: () => void;
}

export function SearchBar({
  visible,
  query,
  matchCount,
  currentIndex,
  onQueryChange,
  onNext,
  onPrev,
  onClear,
}: SearchBarProps) {
  const countText = !query ? '' : matchCount === 0 ? '0/0' : `${currentIndex + 1}/${matchCount}`;

  return (
    <div className={'search-bar' + (visible ? ' active' : '')}>
      <input
        type="text"
        className="search-input"
        placeholder="Search in document..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (e.shiftKey) onPrev();
            else onNext();
          } else if (e.key === 'Escape') {
            onClear();
          }
        }}
      />
      <span className="search-count">{countText}</span>
      <button type="button" className="search-btn" title="Previous match" onClick={onPrev}>
        ↑
      </button>
      <button type="button" className="search-btn" title="Next match" onClick={onNext}>
        ↓
      </button>
      <button type="button" className="search-btn" title="Clear search" onClick={onClear}>
        ✕
      </button>
    </div>
  );
}

import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Header } from './components/Header';
import { TabsBar } from './components/TabsBar';
import { SearchBar } from './components/SearchBar';
import { PreviewPane } from './components/PreviewPane';
import { MarkdownParser } from './lib/markdownParser';
import { useSearch } from './hooks/useSearch';
import type { Tab } from './types';
import './App.css';

const parser = new MarkdownParser();

const isSupportedFile = (file: File) =>
  file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.markdown') || file.name.endsWith('.txt');

function App() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const nextIdRef = useRef(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? null;
  const search = useSearch(outputRef, activeTab?.html ?? '');

  function openFile(file: File) {
    const reader = new FileReader();

    reader.onload = (event) => {
      const id = nextIdRef.current++;
      let html: string;
      try {
        const markdown = event.target?.result as string;
        html = `<div class="markdown-content">${parser.parse(markdown)}</div>`;
      } catch (error) {
        html = `<div class="error">Error parsing markdown: ${(error as Error).message}</div>`;
      }
      setTabs((prev) => [...prev, { id, name: file.name, html }]);
      setActiveTabId(id);
    };

    reader.onerror = () => {
      const id = nextIdRef.current++;
      setTabs((prev) => [
        ...prev,
        { id, name: file.name, html: '<div class="error">Error reading file. Please try again.</div>' },
      ]);
      setActiveTabId(id);
    };

    reader.readAsText(file);
  }

  function closeTab(id: number) {
    const idx = tabs.findIndex((t) => t.id === id);
    if (idx === -1) return;

    const nextTabs = tabs.filter((t) => t.id !== id);
    setTabs(nextTabs);

    if (activeTabId !== id) return;
    if (nextTabs.length === 0) {
      setActiveTabId(null);
    } else {
      setActiveTabId(nextTabs[Math.min(idx, nextTabs.length - 1)].id);
    }
  }

  const triggerFileDialog = () => fileInputRef.current?.click();

  function handleFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    Array.from(e.target.files ?? []).forEach(openFile);
    e.target.value = '';
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(isSupportedFile);

    if (validFiles.length === 0 && files.length > 0) {
      alert('Please drop a markdown or text file');
      return;
    }

    validFiles.forEach(openFile);
  }

  return (
    <div
      className={'container' + (isDragging ? ' dragging' : '')}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
      }}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        id="mdFile"
        accept=".md,.markdown,.txt"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      <Header />

      <TabsBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelect={setActiveTabId}
        onClose={closeTab}
        onAddClick={triggerFileDialog}
      />

      <SearchBar
        visible={tabs.length > 0}
        query={search.query}
        matchCount={search.matchCount}
        currentIndex={search.currentIndex}
        onQueryChange={search.setQuery}
        onNext={search.goNext}
        onPrev={search.goPrev}
        onClear={search.clear}
      />

      <div className="content">
        <PreviewPane ref={outputRef} html={activeTab?.html ?? null} onUploadClick={triggerFileDialog} />
      </div>
    </div>
  );
}

export default App;

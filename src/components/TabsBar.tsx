import type { Tab } from '../types';

interface TabsBarProps {
  tabs: Tab[];
  activeTabId: number | null;
  onSelect: (id: number) => void;
  onClose: (id: number) => void;
  onAddClick: () => void;
}

export function TabsBar({ tabs, activeTabId, onSelect, onClose, onAddClick }: TabsBarProps) {
  if (tabs.length === 0) return <div className="tabs-bar" />;

  return (
    <div className="tabs-bar active">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={'tab' + (tab.id === activeTabId ? ' active' : '')}
          title={tab.name}
          onClick={() => onSelect(tab.id)}
        >
          <span className="tab-name">{tab.name}</span>
          <span
            className="tab-close"
            title="Close tab"
            onClick={(e) => {
              e.stopPropagation();
              onClose(tab.id);
            }}
          >
            ✕
          </span>
        </div>
      ))}
      <button type="button" className="tab-add" title="Open another file" onClick={onAddClick}>
        +
      </button>
    </div>
  );
}

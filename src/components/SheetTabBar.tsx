interface SheetTab {
  name: string;
  isActive: boolean;
}

interface SheetTabBarProps {
  tabs: SheetTab[];
  onTabClick: (name: string) => void;
  onTabClose: (name: string) => void;
  align?: 'left' | 'right';
}

export function SheetTabBar({ tabs, onTabClick, onTabClose, align = 'left' }: SheetTabBarProps) {
  // 최대 3개까지만 표시
  const visibleTabs = tabs.slice(0, 3);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '0 8px',
        justifyContent: align === 'right' ? 'flex-start' : 'flex-start',
      }}
    >
      {visibleTabs.map((tab) => (
        <button
          key={tab.name}
          onClick={() => onTabClick(tab.name)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Pretendard, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            color: tab.isActive ? '#5d5957' : '#7c7875',
            backgroundColor: tab.isActive ? '#e2e0dd' : 'transparent',
            transition: 'background-color 0.15s',
            whiteSpace: 'nowrap',
            height: '32px',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (!tab.isActive) e.currentTarget.style.backgroundColor = '#f0efed';
          }}
          onMouseLeave={(e) => {
            if (!tab.isActive) e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <span>{tab.name}</span>
          {tab.isActive && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.name);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#7c7875',
                fontSize: '14px',
                lineHeight: 1,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              &times;
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

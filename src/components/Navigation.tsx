import { Plus, ChevronLeft, ChevronRight, BookOpen, PanelLeft } from 'lucide-react';

interface AppSheet {
  id: string;
  name: string;
  isNew: boolean;
}

interface NavigationProps {
  isExpanded: boolean;
  onToggle: () => void;
  appSheets: AppSheet[];
  selectedSheets: {
    left: string | null;
    right: string | null;
  };
  onSheetSelect: (sheetName: string, position: 'left' | 'right') => void;
  focusedSheet: 'left' | 'right';
}

export function Navigation({ 
  isExpanded, 
  onToggle, 
  appSheets, 
  selectedSheets,
  onSheetSelect,
  focusedSheet
}: NavigationProps) {
  const handleSheetClick = (sheetName: string) => {
    // 현재 포커스된 화면에 해당 시트를 설정 (교체)
    onSheetSelect(sheetName, focusedSheet);
  };

  if (!isExpanded) {
    // 완전히 접힌 상태 - 토글 버튼만 표시
    return (
      <div className="absolute left-[16px] top-[16px] z-50">
        <button
          onClick={onToggle}
          className="w-[44px] h-[44px] flex items-center justify-center rounded-[8px] bg-background border border-border hover:bg-accent transition-colors shadow-lg"
        >
          <PanelLeft className="w-[20px] h-[20px]" />
        </button>
      </div>
    );
  }

  return (
    <div 
      className="absolute left-0 top-0 h-full bg-background border-r border-border flex flex-col z-50 shadow-xl"
      style={{ width: '240px' }}
    >
      {/* Profile & Toggle */}
      <div className="p-[16px] flex items-center justify-between">
        {/* Profile Image */}
        <div 
          className="rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium cursor-pointer"
          style={{ width: '44px', height: '44px', fontSize: '16px' }}
        >
          U
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="w-[44px] h-[44px] flex items-center justify-center rounded-[8px] hover:bg-accent transition-colors"
        >
          <ChevronLeft className="w-[20px] h-[20px]" />
        </button>
      </div>

      {/* App Sheets Section */}
      <>
        {/* Header */}
        <div className="px-[16px] py-[12px] flex items-center justify-between">
          <h3 className="font-medium" style={{ fontSize: '16px' }}>앱시트</h3>
          <button className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] hover:bg-accent transition-colors">
            <Plus className="w-[16px] h-[16px]" />
          </button>
        </div>

        {/* Sheet List */}
        <div className="flex-1 overflow-y-auto px-[8px] flex flex-col gap-[4px]">
          {appSheets.map((sheet) => {
            const isLeftSelected = selectedSheets.left === sheet.name;
            const isRightSelected = selectedSheets.right === sheet.name;
            const isAnySelected = isLeftSelected || isRightSelected;
            const isFocused = (isLeftSelected && focusedSheet === 'left') || (isRightSelected && focusedSheet === 'right');
            
            return (
              <div
                key={sheet.id}
                onClick={() => handleSheetClick(sheet.name)}
                className={`flex items-center justify-between px-[16px] rounded-[12px] cursor-pointer transition-colors ${
                  isFocused ? 'bg-primary/10' : 'hover:bg-accent'
                }`}
                style={{ height: '48px', minHeight: '48px' }}
              >
                {/* Left: Sheet Name + Badge */}
                <div className="flex items-center gap-[8px] flex-1 min-w-0">
                  <span className="font-medium" style={{ fontSize: '15px' }}>
                    {sheet.name}
                  </span>
                  {sheet.isNew && (
                    <span 
                      className="px-[6px] py-[2px] bg-primary text-primary-foreground rounded-[4px] flex-shrink-0"
                      style={{ fontSize: '11px' }}
                    >
                      NEW
                    </span>
                  )}
                </div>

                {/* Right: Position Indicators - Fixed width to prevent layout shift */}
                <div className="flex items-center justify-end flex-shrink-0" style={{ width: '24px', height: '24px' }}>
                  {isAnySelected && (
                    <svg 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none"
                      className="text-primary"
                    >
                      {/* 왼쪽 화면 */}
                      <rect 
                        x="3" 
                        y="5" 
                        width="8" 
                        height="14" 
                        rx="2"
                        stroke="currentColor" 
                        strokeWidth="2"
                        strokeDasharray={isLeftSelected ? '0' : '3 3'}
                        fill={isLeftSelected ? 'currentColor' : 'none'}
                        fillOpacity={isLeftSelected ? '0.3' : '0'}
                      />
                      {/* 오른쪽 화면 */}
                      <rect 
                        x="13" 
                        y="5" 
                        width="8" 
                        height="14" 
                        rx="2"
                        stroke="currentColor" 
                        strokeWidth="2"
                        strokeDasharray={isRightSelected ? '0' : '3 3'}
                        fill={isRightSelected ? 'currentColor' : 'none'}
                        fillOpacity={isRightSelected ? '0.3' : '0'}
                      />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </>
    </div>
  );
}
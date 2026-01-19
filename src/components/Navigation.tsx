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
}

export function Navigation({ 
  isExpanded, 
  onToggle, 
  appSheets, 
  selectedSheets,
  onSheetSelect 
}: NavigationProps) {
  const handleSheetClick = (sheetName: string) => {
    // 이미 선택된 시트인지 확인
    const isLeftSelected = selectedSheets.left === sheetName;
    const isRightSelected = selectedSheets.right === sheetName;

    // 빈 자리에 먼저 추가
    if (!isLeftSelected && !selectedSheets.left) {
      onSheetSelect(sheetName, 'left');
    } else if (!isRightSelected && !selectedSheets.right) {
      onSheetSelect(sheetName, 'right');
    } else if (isLeftSelected && isRightSelected) {
      // 양쪽 다 선택되어 있으면 오른쪽만 해제
      onSheetSelect(sheetName, 'right');
    } else if (isLeftSelected) {
      // 왼쪽만 선택되어 있으면 오른쪽에 추가 또는 왼쪽 해제
      if (!selectedSheets.right) {
        onSheetSelect(sheetName, 'right');
      } else {
        onSheetSelect(sheetName, 'left');
      }
    } else if (isRightSelected) {
      // 오른쪽만 선택되어 있으면 왼쪽에 추가 또는 오른쪽 해제
      if (!selectedSheets.left) {
        onSheetSelect(sheetName, 'left');
      } else {
        onSheetSelect(sheetName, 'right');
      }
    } else {
      // 둘 다 다른 시트로 차있으면 오른쪽 교체
      onSheetSelect(sheetName, 'right');
    }
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
        <div className="flex-1 overflow-y-auto px-[8px]">
          {appSheets.map((sheet) => {
            const isLeftSelected = selectedSheets.left === sheet.name;
            const isRightSelected = selectedSheets.right === sheet.name;
            const isSelected = isLeftSelected || isRightSelected;

            return (
              <div
                key={sheet.id}
                onClick={() => handleSheetClick(sheet.name)}
                className={`
                  px-[12px] py-[12px] mb-[4px] rounded-[8px] cursor-pointer
                  transition-colors relative
                  ${isSelected ? 'bg-accent border border-primary' : 'hover:bg-accent/50'}
                `}
                style={{ minHeight: '44px' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-[8px]">
                    <span style={{ fontSize: '14px' }}>{sheet.name}</span>
                    {sheet.isNew && (
                      <span 
                        className="bg-primary text-primary-foreground px-[6px] py-[2px] rounded-[4px]"
                        style={{ fontSize: '10px' }}
                      >
                        NEW
                      </span>
                    )}
                  </div>
                  
                  {/* Position Indicators - Book Icons */}
                  <div className="flex">
                    {isLeftSelected && (
                      <div 
                        className="text-primary flex items-center justify-center"
                        title="왼쪽 화면"
                      >
                        <svg 
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H12v20H6.5a2.5 2.5 0 0 1 0-5H12" />
                        </svg>
                      </div>
                    )}
                    {isRightSelected && (
                      <div 
                        className="text-primary flex items-center justify-center"
                        title="오른쪽 화면"
                      >
                        <svg 
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M12 2h5.5A2.5 2.5 0 0 1 20 4.5v15a2.5 2.5 0 0 1-2.5 2.5H12V2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>
    </div>
  );
}
import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { SheetView } from './components/SheetView';
import { AddAppSheetPage } from './components/AddAppSheetPage';

export default function App() {
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [focusedSheet, setFocusedSheet] = useState<'left' | 'right'>('right'); // 디폴트: 오른쪽
  const [showAddSheet, setShowAddSheet] = useState(false); // 앱시트 추가 페이지 표시 여부
  const [selectedSheets, setSelectedSheets] = useState<{
    left: string | null;
    right: string | null;
  }>({
    left: null,
    right: null // 디폴트도 null로 변경
  });

  // 앱시트 목록 (빈 배열로 시작)
  const [appSheets, setAppSheets] = useState<Array<{ id: string; name: string; isNew: boolean }>>([]);

  const handleSheetSelect = (sheetName: string, position: 'left' | 'right') => {
    setSelectedSheets(prev => ({
      ...prev,
      [position]: prev[position] === sheetName ? null : sheetName
    }));
    
    // 클릭한 시트가 표시되는 화면으로 포커스 전환
    if (selectedSheets[position] === sheetName) {
      // 해제하는 경우, 반대쪽으로 포커스 이동
      setFocusedSheet(position === 'left' ? 'right' : 'left');
    } else {
      // 추가/변경하는 경우, 해당 포지션으로 포커스
      setFocusedSheet(position);
    }
  };

  const handleNavToggle = () => {
    setIsNavExpanded(!isNavExpanded);
    // 네비게이션 열 때 오른쪽 화면을 디폴트 포커스로
    if (!isNavExpanded) {
      setFocusedSheet('right');
    }
  };

  const handleSheetClick = (position: 'left' | 'right') => {
    if (isNavExpanded) {
      setFocusedSheet(position);
    }
  };

  const handleCloseAddSheet = () => {
    setShowAddSheet(false);
  };

  const handleSelectTemplate = (templateName: string) => {
    // 현재 포커스된 화면에 선택한 템플릿 설정
    setSelectedSheets(prev => ({
      ...prev,
      [focusedSheet]: templateName
    }));
    
    // 앱시트 목록에 추가 (중복 체크)
    const templateExists = appSheets.some(sheet => sheet.name === templateName);
    if (!templateExists) {
      setAppSheets(prev => [
        ...prev,
        { id: Date.now().toString(), name: templateName, isNew: false }
      ]);
    }
    
    setShowAddSheet(false);
  };

  const handleDeleteSheet = (sheetId: string) => {
    // 앱시트 삭제
    const sheetToDelete = appSheets.find(sheet => sheet.id === sheetId);
    if (sheetToDelete) {
      // 선택된 화면에서도 제거
      setSelectedSheets(prev => ({
        left: prev.left === sheetToDelete.name ? null : prev.left,
        right: prev.right === sheetToDelete.name ? null : prev.right
      }));
    }
    setAppSheets(prev => prev.filter(sheet => sheet.id !== sheetId));
  };

  const handleRenameSheet = (sheetId: string, newName: string) => {
    // 앱시트 이름 변경
    const oldSheet = appSheets.find(sheet => sheet.id === sheetId);
    if (oldSheet) {
      setAppSheets(prev => 
        prev.map(sheet => 
          sheet.id === sheetId ? { ...sheet, name: newName } : sheet
        )
      );
      // 선택된 화면도 업데이트
      setSelectedSheets(prev => ({
        left: prev.left === oldSheet.name ? newName : prev.left,
        right: prev.right === oldSheet.name ? newName : prev.right
      }));
    }
  };

  const handleReorderSheets = (newOrder: Array<{ id: string; name: string; isNew: boolean }>) => {
    setAppSheets(newOrder);
  };

  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center p-8">
      {/* iPad Pro 11" Frame - Landscape - 1194 × 834 px */}
      <div 
        className="bg-black rounded-[40px] shadow-2xl relative overflow-hidden"
        style={{ 
          width: '1194px', 
          height: '834px',
          padding: '20px'
        }}
      >
        {/* Screen Area */}
        <div 
          className="bg-background rounded-[24px] w-full h-full overflow-hidden relative"
          style={{
            width: '1154px',
            height: '794px'
          }}
        >
          {/* App Content */}
          <div className="w-full h-full relative">
            {/* Navigation Bar - Overlay */}
            <Navigation 
              isExpanded={isNavExpanded}
              onToggle={handleNavToggle}
              appSheets={appSheets}
              selectedSheets={selectedSheets}
              onSheetSelect={handleSheetSelect}
              focusedSheet={focusedSheet}
              showAddSheet={showAddSheet}
              setShowAddSheet={setShowAddSheet}
              onDeleteSheet={handleDeleteSheet}
              onRenameSheet={handleRenameSheet}
              onReorderSheets={handleReorderSheets}
            />

            {/* Main Content Area - Fixed Size */}
            <div className="w-full h-full flex">
              {/* Left Sheet */}
              <div 
                onClick={() => handleSheetClick('left')}
                className={`h-full bg-card border-r border-border transition-all duration-200 relative ${
                  isNavExpanded && focusedSheet === 'left' ? 'ring-2 ring-primary ring-inset' : ''
                }`}
                style={{ width: '577px' }}
              >
                {selectedSheets.left && (
                  <>
                    {/* Sheet Title - Only show when nav is expanded */}
                    {isNavExpanded && (
                      <div className="absolute top-[16px] right-[16px] z-40">
                        <div className="px-[16px] py-[8px] rounded-[8px] bg-background/80 backdrop-blur-sm border border-border">
                          <span className="font-medium" style={{ fontSize: '14px' }}>
                            {selectedSheets.left}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Divider (if both sheets selected) */}
              {selectedSheets.left && selectedSheets.right && (
                <div className="w-[1px] bg-border"></div>
              )}

              {/* Right Sheet */}
              <div 
                onClick={() => handleSheetClick('right')}
                className={`h-full bg-card transition-all duration-200 relative ${
                  isNavExpanded && focusedSheet === 'right' ? 'ring-2 ring-primary ring-inset' : ''
                }`}
                style={{ width: '577px' }}
              >
                {selectedSheets.right && (
                  <>
                    {/* Sheet Title - Only show when nav is expanded */}
                    {isNavExpanded && (
                      <div className="absolute top-[16px] left-[16px] z-40">
                        <div className="px-[16px] py-[8px] rounded-[8px] bg-background/80 backdrop-blur-sm border border-border">
                          <span className="font-medium" style={{ fontSize: '14px' }}>
                            {selectedSheets.right}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Add Sheet Page - Fullscreen Modal */}
            <AddAppSheetPage 
              onClose={handleCloseAddSheet}
              onSelectTemplate={handleSelectTemplate}
              isOpen={showAddSheet}
              existingSheets={appSheets}
            />
          </div>
        </div>

        {/* Home Indicator */}
        <div 
          className="absolute bottom-[8px] left-1/2 transform -translate-x-1/2 bg-white/30 rounded-full"
          style={{ width: '140px', height: '4px' }}
        ></div>
      </div>
    </div>
  );
}
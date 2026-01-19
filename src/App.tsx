import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { SheetView } from './components/SheetView';

export default function App() {
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [focusedSheet, setFocusedSheet] = useState<'left' | 'right'>('right'); // 디폴트: 오른쪽
  const [selectedSheets, setSelectedSheets] = useState<{
    left: string | null;
    right: string | null;
  }>({
    left: null,
    right: '하루 계획' // 디폴트는 오른쪽
  });

  // 앱시트 목록 (임시 데이터)
  const [appSheets] = useState([
    { id: '1', name: '하루 계획', isNew: false },
    { id: '2', name: '시험 관리', isNew: true },
    { id: '3', name: '캘린더', isNew: false },
  ]);

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
            />

            {/* Main Content Area - Fixed Size */}
            <div className="w-full h-full flex">
              {/* Left Sheet - Fixed Half */}
              <SheetView 
                sheetName={selectedSheets.left}
                position="left"
                isVisible={!!selectedSheets.left}
                isNavExpanded={isNavExpanded}
                isFocused={focusedSheet === 'left'}
              />

              {/* Divider (if both sheets selected) */}
              {selectedSheets.left && selectedSheets.right && (
                <div className="w-[1px] bg-border"></div>
              )}

              {/* Right Sheet - Fixed Half */}
              <SheetView 
                sheetName={selectedSheets.right}
                position="right"
                isVisible={!!selectedSheets.right}
                isNavExpanded={isNavExpanded}
                isFocused={focusedSheet === 'right'}
              />
            </div>
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
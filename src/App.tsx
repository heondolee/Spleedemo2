import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { AddAppSheetPage } from './components/AddAppSheetPage';
import { DailyPlannerSheet } from './components/daily-planner';

// localStorage 키 상수
const STORAGE_KEYS = {
  NAV_EXPANDED: 'splee_navExpanded',
  FOCUSED_SHEET: 'splee_focusedSheet',
  SELECTED_SHEETS: 'splee_selectedSheets',
  APP_SHEETS: 'splee_appSheets',
  SAVED_TEMPLATES: 'splee_savedTemplates',
} as const;

// localStorage 헬퍼 함수
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('localStorage 저장 실패:', error);
  }
}

export default function App() {
  // localStorage에서 초기값 로드
  const [isNavExpanded, setIsNavExpanded] = useState(() =>
    getFromStorage(STORAGE_KEYS.NAV_EXPANDED, true)
  );
  const [focusedSheet, setFocusedSheet] = useState<'left' | 'right'>(() =>
    getFromStorage(STORAGE_KEYS.FOCUSED_SHEET, 'right')
  );
  const [showAddSheet, setShowAddSheet] = useState(false); // 이건 저장하지 않음 (임시 UI 상태)
  const [editingSheet, setEditingSheet] = useState<string | null>(null); // 현재 편집 중인 앱시트 이름
  const [selectedSheets, setSelectedSheets] = useState<{
    left: string | null;
    right: string | null;
  }>(() => getFromStorage(STORAGE_KEYS.SELECTED_SHEETS, { left: null, right: null }));

  // 앱시트 목록
  const [appSheets, setAppSheets] = useState<Array<{ id: string; name: string; isNew: boolean }>>(() =>
    getFromStorage(STORAGE_KEYS.APP_SHEETS, [])
  );

  // 저장된 템플릿 (카테고리별)
  const [savedTemplates, setSavedTemplates] = useState<{
    [categoryId: string]: Array<{
      id: string;
      name: string;
      description: string;
      color: string;
      category: string;
    }>;
  }>(() => getFromStorage(STORAGE_KEYS.SAVED_TEMPLATES, { daily: [], exam: [], calendar: [] }));

  // 상태 변경 시 localStorage에 저장
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.NAV_EXPANDED, isNavExpanded);
  }, [isNavExpanded]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FOCUSED_SHEET, focusedSheet);
  }, [focusedSheet]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SELECTED_SHEETS, selectedSheets);
  }, [selectedSheets]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.APP_SHEETS, appSheets);
  }, [appSheets]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SAVED_TEMPLATES, savedTemplates);
  }, [savedTemplates]);

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
      const newSheet = { id: Date.now().toString(), name: templateName, isNew: false };
      setAppSheets(prev => [...prev, newSheet]);
      
      // 선택한 템플릿을 자동으로 "내 템플릿"에 저장
      const categories = {
        daily: ['하루 계획'],
        exam: ['시험 관리'],
        calendar: ['캘린더']
      };

      // 카테고리 찾기
      let categoryId = '';
      for (const [catId, templates] of Object.entries(categories)) {
        if (templates.includes(templateName)) {
          categoryId = catId;
          break;
        }
      }

      if (categoryId) {
        const templateColors: { [key: string]: string } = {
          '하루 계획': 'bg-blue-500',
          '시험 관리': 'bg-red-500',
          '캘린더': 'bg-green-500',
        };

        const templateDescriptions: { [key: string]: string } = {
          '하루 계획': '하루 일정과 목표를 관리합니다',
          '시험 관리': '시험 일정과 준비 현황을 관리합니다',
          '캘린더': '일정을 캘린더로 관리합니다',
        };

        handleSaveTemplate(categoryId, templateName, {
          description: templateDescriptions[templateName] || '',
          color: templateColors[templateName] || 'bg-gray-500',
        });
      }
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

  const handleSaveTemplate = (categoryId: string, templateName: string, baseTemplate: any) => {
    // 템플릿 저장
    const newTemplate = {
      id: Date.now().toString(),
      name: templateName,
      description: baseTemplate.description,
      color: baseTemplate.color,
      category: categoryId,
    };
    
    setSavedTemplates(prev => ({
      ...prev,
      [categoryId]: [...prev[categoryId], newTemplate],
    }));
  };

  const handleDeleteTemplate = (categoryId: string, templateId: string) => {
    // 템플릿 삭제
    setSavedTemplates(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].filter(t => t.id !== templateId),
    }));
  };

  const handleApplyTemplate = (categoryId: string, templateName: string) => {
    // 해당 카테고리의 기존 앱시트를 찾아서 템플릿 변경
    const categories = {
      daily: ['하루 계획'],
      exam: ['시험 관리'],
      calendar: ['캘린더']
    };

    // 해당 카테고리에 속한 기존 앱시트 찾기
    const existingSheet = appSheets.find(sheet => 
      categories[categoryId as keyof typeof categories]?.includes(sheet.name)
    );

    if (existingSheet) {
      const oldName = existingSheet.name;
      // 앱시트 이름 변경
      setAppSheets(prev => 
        prev.map(sheet => 
          sheet.id === existingSheet.id ? { ...sheet, name: templateName } : sheet
        )
      );
      // 선택된 화면도 업데이트
      setSelectedSheets(prev => ({
        left: prev.left === oldName ? templateName : prev.left,
        right: prev.right === oldName ? templateName : prev.right
      }));
    }

    setShowAddSheet(false);
  };

  const handleEditSheet = (sheetName: string) => {
    // 1. 네비게이션 닫기
    setIsNavExpanded(false);

    // 2. 해당 시트가 오른쪽에 있으면 왼쪽으로 이동
    if (selectedSheets.right === sheetName && selectedSheets.left !== sheetName) {
      setSelectedSheets(prev => ({
        left: sheetName,
        right: null
      }));
    } else if (selectedSheets.left !== sheetName) {
      // 어디에도 없으면 왼쪽에 배치
      setSelectedSheets(prev => ({
        left: sheetName,
        right: null
      }));
    } else {
      // 이미 왼쪽에 있으면 오른쪽만 비우기
      setSelectedSheets(prev => ({
        ...prev,
        right: null
      }));
    }

    // 3. 편집 모드 활성화
    setEditingSheet(sheetName);
  };

  const handleCloseEditor = () => {
    setEditingSheet(null);
  };

  const handleClearLocalStorage = () => {
    // 모든 splee 관련 localStorage 삭제
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    // 페이지 새로고침하여 초기 상태로 복원
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col items-center justify-center p-8 gap-[16px]">
      {/* iPad Pro 11" Frame - Landscape - 내부 화면 1194 × 834 px */}
      <div
        className="bg-black rounded-[40px] shadow-2xl relative overflow-hidden"
        style={{
          width: '1234px',
          height: '874px',
          padding: '20px'
        }}
      >
        {/* Screen Area - 1194 × 834 px */}
        <div
          className="bg-background rounded-[24px] w-full h-full overflow-hidden relative"
          style={{
            width: '1194px',
            height: '834px'
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
              onEditSheet={handleEditSheet}
            />

            {/* Main Content Area - Fixed Size */}
            <div className="w-full h-full flex">
              {/* Left Sheet */}
              <div
                onClick={() => handleSheetClick('left')}
                className={`h-full bg-card border-r border-border transition-all duration-200 relative ${
                  isNavExpanded && focusedSheet === 'left' ? 'ring-2 ring-primary ring-inset' : ''
                }`}
                style={{ width: '597px' }}
              >
                {selectedSheets.left && isNavExpanded && (
                  <div className="absolute top-[16px] right-[16px] z-40">
                    <div className="px-[16px] py-[8px] rounded-[8px] bg-background/80 backdrop-blur-sm border border-border">
                      <span className="font-medium" style={{ fontSize: '14px' }}>
                        {selectedSheets.left}
                      </span>
                    </div>
                  </div>
                )}
                {/* Sheet Content */}
                {selectedSheets.left === '하루 계획' && (
                  <DailyPlannerSheet />
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
                style={{ width: '597px' }}
              >
                {/* 편집 모드일 때 편집기 표시 */}
                {editingSheet ? (
                  <div className="w-full h-full flex flex-col">
                    {/* 편집기 헤더 */}
                    <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-border">
                      <h2 className="font-medium" style={{ fontSize: '18px' }}>
                        {editingSheet} 수정
                      </h2>
                      <button
                        onClick={handleCloseEditor}
                        className="px-[16px] py-[8px] rounded-[8px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        style={{ fontSize: '14px' }}
                      >
                        완료
                      </button>
                    </div>
                    {/* 편집기 내용 - 빈 화면 */}
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-muted-foreground" style={{ fontSize: '16px' }}>
                        앱시트 편집 화면
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {selectedSheets.right && isNavExpanded && (
                      <div className="absolute top-[16px] left-[16px] z-40">
                        <div className="px-[16px] py-[8px] rounded-[8px] bg-background/80 backdrop-blur-sm border border-border">
                          <span className="font-medium" style={{ fontSize: '14px' }}>
                            {selectedSheets.right}
                          </span>
                        </div>
                      </div>
                    )}
                    {/* Sheet Content */}
                    {selectedSheets.right === '하루 계획' && (
                      <DailyPlannerSheet />
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
              savedTemplates={savedTemplates}
              onSaveTemplate={handleSaveTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onApplyTemplate={handleApplyTemplate}
            />
          </div>
        </div>

        {/* Home Indicator */}
        <div
          className="absolute bottom-[8px] left-1/2 transform -translate-x-1/2 bg-white/30 rounded-full"
          style={{ width: '140px', height: '4px' }}
        ></div>
      </div>

      {/* localStorage 초기화 버튼 - iPad 프레임 아래 */}
      <button
        onClick={handleClearLocalStorage}
        className="px-[16px] py-[8px] rounded-[8px] bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors shadow-sm"
        style={{ fontSize: '14px' }}
      >
        localStorage 초기화
      </button>
    </div>
  );
}
import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { SheetView } from './components/SheetView';
import { AddAppSheetPage } from './components/AddAppSheetPage';
import { SheetLayoutEditor } from './components/SheetLayoutEditor';
import { ProfileView } from './components/ProfileView';

export default function App() {
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [focusedSheet, setFocusedSheet] = useState<'left' | 'right'>('right'); // 디폴트: 오른쪽
  const [showAddSheet, setShowAddSheet] = useState(false); // 앱시트 추가 페이지 표시 여부
  const [editingLayout, setEditingLayout] = useState<{ sheetId: string; sheetName: string } | null>(null); // 레이아웃 편집 상태
  const [showProfile, setShowProfile] = useState(false); // 프로필 뷰 표시 여부
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date>(new Date(2026, 0, 24)); // 캘린더에서 선택한 날짜
  const [selectedSheets, setSelectedSheets] = useState<{
    left: string | null;
    right: string | null;
  }>({
    left: null,
    right: null // 디폴트도 null로 변경
  });

  // 앱시트 목록 (빈 배열로 시작)
  const [appSheets, setAppSheets] = useState<Array<{ id: string; name: string; isNew: boolean }>>([]);

  // 저장된 템플릿 (카테고리별)
  const [savedTemplates, setSavedTemplates] = useState<{
    [categoryId: string]: Array<{
      id: string;
      name: string;
      description: string;
      color: string;
      category: string;
    }>;
  }>({
    daily: [],
    exam: [],
    calendar: [],
  });

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
        daily: ['기본 일일 플래너', '시간표형 플래너', '목표 중심 플래너', '루틴 트래커', '집중 모드', 
                '스터디 루틴', '수능 D-100', '완벽한 하루', '미라클 모닝', '밸런스 라이프'],
        exam: ['기본 시험 관리', '과목별 준비도', '오답노트 연계', '모의고사 분석', 'D-Day 카운터',
               '중간고사 대비', '수능 전략', '내신 관리', '약점 공략', '기출 분석'],
        calendar: ['기본 월간 캘린더', '학사 일정', 'D-Day 캘린더', '주간 뷰', '연간 플래너',
                   '학기 플래너', '방학 계획표', '100일 챌린지', '시험 일정표', '목표 달성기']
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
        // 템플릿 정보 찾기 (더미 데이터)
        const templateColors: { [key: string]: string } = {
          // daily
          '기본 일일 플래너': 'bg-blue-500',
          '시간표형 플래너': 'bg-indigo-500',
          '목표 중심 플래너': 'bg-purple-500',
          '루틴 트래커': 'bg-violet-500',
          '집중 모드': 'bg-blue-600',
          '스터디 루틴': 'bg-cyan-500',
          '수능 D-100': 'bg-teal-500',
          '완벽한 하루': 'bg-sky-500',
          '미라클 모닝': 'bg-blue-400',
          '밸런스 라이프': 'bg-indigo-400',
          // exam
          '기본 시험 관리': 'bg-red-500',
          '과목별 준비도': 'bg-orange-500',
          '오답노트 연계': 'bg-amber-500',
          '모의고사 분석': 'bg-yellow-500',
          'D-Day 카운터': 'bg-red-600',
          '중간고사 대비': 'bg-rose-500',
          '수능 전략': 'bg-pink-500',
          '내신 관리': 'bg-fuchsia-500',
          '약점 공략': 'bg-rose-600',
          '기출 분석': 'bg-red-400',
          // calendar
          '기본 월간 캘린더': 'bg-green-500',
          '학사 일정': 'bg-emerald-500',
          'D-Day 캘린더': 'bg-lime-500',
          '주간 뷰': 'bg-green-600',
          '연간 플래너': 'bg-teal-600',
          '학기 플래너': 'bg-teal-500',
          '방학 계획표': 'bg-cyan-500',
          '100일 챌린지': 'bg-sky-500',
          '시험 일정표': 'bg-emerald-600',
          '목표 달성기': 'bg-green-400',
        };
        
        const templateDescriptions: { [key: string]: string } = {
          // daily
          '기본 일일 플래너': '간단한 하루 일정 관리',
          '시간표형 플래너': '시간대별 상세 계획',
          '목표 중심 플래너': '일일 목표 달성 추적',
          '루틴 트래커': '습관 형성 및 루틴 관리',
          '집중 모드': '포모도로 기반 플래너',
          '스터디 루틴': '완벽한 학습 루틴 관리',
          '수능 D-100': '수능 카운트다운과 일일 계획',
          '완벽한 하루': '생산성 극대화 플래너',
          '미라클 모닝': '새벽 루틴 최적화',
          '밸런스 라이프': '공부와 휴식의 균형',
          // exam
          '기본 시험 관리': '시험 일정과 준비 현황',
          '과목별 준비도': '과목별 학습 진도 추적',
          '오답노트 연계': '시험과 오답 통합 관리',
          '모의고사 분석': '성적 추이 및 분석',
          'D-Day 카운터': '시험일 카운트다운',
          '중간고사 대비': '중간고사 완벽 준비',
          '수능 전략': '수능 시험 전략 관리',
          '내신 관리': '내신 성적 관리',
          '약점 공략': '취약 과목 집중 관리',
          '기출 분석': '기출문제 패턴 분석',
          // calendar
          '기본 월간 캘린더': '월 단위 일정 관리',
          '학사 일정': '학교 일정 중심 캘린더',
          'D-Day 캘린더': '중요 날짜 카운트다운',
          '주간 뷰': '주 단위 상세 일정',
          '연간 플래너': '1년 전체 계획 관리',
          '학기 플래너': '학기별 일정 관리',
          '방학 계획표': '방학 계획 수립',
          '100일 챌린지': '100일 목표 달성',
          '시험 일정표': '시험 중심 캘린더',
          '목표 달성기': '월별 목표 추적',
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
      daily: ['기본 일일 플래너', '시간표형 플래너', '목표 중심 플래너', '루틴 트래커', '집중 모드', 
              '스터디 루틴', '수능 D-100', '완벽한 하루', '미라클 모닝', '밸런스 라이프'],
      exam: ['기본 시험 관리', '과목별 준비도', '오답노트 연계', '모의고사 분석', 'D-Day 카운터',
             '중간고사 대비', '수능 전략', '내신 관리', '약점 공략', '기출 분석'],
      calendar: ['기본 월간 캘린더', '학사 일정', 'D-Day 캘린더', '주간 뷰', '연간 플래너',
                 '학기 플래너', '방학 계획표', '100일 챌린지', '시험 일정표', '목표 달성기']
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

  const handleCalendarDateClick = (date: Date, currentPosition: 'left' | 'right') => {
    setCalendarSelectedDate(date);
    
    // 반대편 화면 위치 결정
    const oppositePosition = currentPosition === 'left' ? 'right' : 'left';
    
    // 반대편에 하루계획 앱시트가 없으면 추가
    const dailyPlanExists = appSheets.some(sheet => sheet.name === '하루계획');
    if (!dailyPlanExists) {
      const newSheet = { id: Date.now().toString(), name: '하루계획', isNew: false };
      setAppSheets(prev => [...prev, newSheet]);
    }
    
    // 반대편 화면에 하루계획 앱시트 표시
    setSelectedSheets(prev => ({
      ...prev,
      [oppositePosition]: '하루계획'
    }));
    
    // 포커스를 반대편으로 이동
    setFocusedSheet(oppositePosition);
  };

  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center p-8">
      {/* iPad Pro 11" Frame - Landscape - 1194 × 834 px (베젤 제외) */}
      <div 
        className="bg-black shadow-2xl relative overflow-hidden"
        style={{ 
          width: '1194px', 
          height: '834px',
        }}
      >
        {/* Screen Area */}
        <div 
          className="bg-background w-full h-full overflow-hidden relative"
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
              onEditLayout={(sheetId, sheetName) => setEditingLayout({ sheetId, sheetName })}
              onOpenProfile={() => setShowProfile(true)}
            />

            {/* Main Content Area - Fixed Size */}
            <div className="w-full h-full flex">
              {/* Left Sheet */}
              <SheetView
                sheetName={selectedSheets.left}
                position="left"
                isVisible={true}
                isNavExpanded={isNavExpanded}
                isFocused={focusedSheet === 'left'}
                onClick={() => handleSheetClick('left')}
                onCalendarDateSelect={(date) => handleCalendarDateClick(date, 'left')}
                selectedDate={calendarSelectedDate}
              />

              {/* Divider (if both sheets selected) */}
              {selectedSheets.left && selectedSheets.right && (
                <div className="w-[1px] bg-border"></div>
              )}

              {/* Right Sheet */}
              <SheetView
                sheetName={selectedSheets.right}
                position="right"
                isVisible={true}
                isNavExpanded={isNavExpanded}
                isFocused={focusedSheet === 'right'}
                onClick={() => handleSheetClick('right')}
                onCalendarDateSelect={(date) => handleCalendarDateClick(date, 'right')}
                selectedDate={calendarSelectedDate}
              />
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

            {/* Sheet Layout Editor - Fullscreen Modal */}
            <SheetLayoutEditor
              onClose={() => setEditingLayout(null)}
              isOpen={editingLayout !== null}
              sheetId={editingLayout?.sheetId || ''}
              sheetName={editingLayout?.sheetName || ''}
            />

            {/* Profile View - Fullscreen Modal */}
            <ProfileView
              onClose={() => setShowProfile(false)}
              isOpen={showProfile}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
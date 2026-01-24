import { DailyPlannerSheet } from './sheets/DailyPlannerSheet';
import { ExamManagementSheet } from './sheets/ExamManagementSheet';
import { CalendarSheet } from './sheets/CalendarSheet';
import { DailyPlanSheet } from './sheets/DailyPlanSheet';

interface SheetViewProps {
  sheetName: string | null;
  position: 'left' | 'right';
  isVisible: boolean;
  isNavExpanded: boolean;
  isFocused: boolean;
  onClick: () => void;
  onCalendarDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

export function SheetView({ sheetName, position, isVisible, isNavExpanded, isFocused, onClick, onCalendarDateSelect, selectedDate }: SheetViewProps) {
  if (!isVisible || !sheetName) {
    return <div className="flex-1"></div>;
  }

  // 시트 이름에 따라 적절한 컴포넌트 렌더링
  const renderSheetContent = () => {
    // "하루 계획" 카테고리의 모든 템플릿
    const dailyTemplates = [
      '기본 일일 플래너', '시간표형 플래너', '목표 중심 플래너', 
      '루틴 트래커', '집중 모드', '스터디 루틴', '수능 D-100', 
      '완벽한 하루', '미라클 모닝', '밸런스 라이프'
    ];

    // "시험 관리" 카테고리의 모든 템플릿
    const examTemplates = [
      '기본 시험 관리', '과목별 준비도', '오답노트 연계', 
      '모의고사 분석', 'D-Day 카운터', '중간고사 대비', 
      '수능 전략', '내신 관리', '약점 공략', '기출 분석'
    ];

    // "캘린더" 카테고리의 모든 템플릿
    const calendarTemplates = [
      '기본 월간 캘린더', '학사 일정', 'D-Day 캘린더', '주간 뷰', '연간 플래너',
      '학기 플래너', '방학 계획표', '100일 챌린지', '시험 일정표', '목표 달성기'
    ];

    if (dailyTemplates.includes(sheetName)) {
      return <DailyPlannerSheet />;
    }

    if (examTemplates.includes(sheetName)) {
      return <ExamManagementSheet />;
    }

    if (calendarTemplates.includes(sheetName)) {
      return (
        <CalendarSheet 
          onDateSelect={(date) => onCalendarDateSelect && onCalendarDateSelect(date)}
          selectedDate={selectedDate}
        />
      );
    }

    if (sheetName === '하루계획') {
      return <DailyPlanSheet selectedDate={selectedDate || new Date()} />;
    }

    // 기본 placeholder
    return (
      <div className="flex-1 border border-dashed border-border rounded-[12px] flex items-center justify-center">
        <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
          {sheetName} 내용이 여기에 표시됩니다
        </p>
      </div>
    );
  };

  return (
    <div 
      className={`bg-card relative transition-all ${
        isFocused && isNavExpanded 
          ? 'ring-2 ring-primary ring-inset' 
          : ''
      } ${isNavExpanded ? 'cursor-pointer' : ''}`}
      style={{ width: '597px' }}
      onClick={onClick}
    >
      {/* Sheet Content */}
      {renderSheetContent()}
    </div>
  );
}
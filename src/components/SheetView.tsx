import { DailyPlannerSheet } from './sheets/DailyPlannerSheet';
import { ExamManagementSheet } from './sheets/ExamManagementSheet';

interface SheetViewProps {
  sheetName: string | null;
  position: 'left' | 'right';
  isVisible: boolean;
  isNavExpanded: boolean;
  isFocused: boolean;
  onClick: () => void;
}

export function SheetView({ sheetName, position, isVisible, isNavExpanded, isFocused, onClick }: SheetViewProps) {
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

    if (dailyTemplates.includes(sheetName)) {
      return <DailyPlannerSheet />;
    }

    if (examTemplates.includes(sheetName)) {
      return <ExamManagementSheet />;
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
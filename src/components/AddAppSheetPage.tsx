import { X, BookOpen, Calendar, Target, Clock, FileText, Grid } from 'lucide-react';

interface AddAppSheetPageProps {
  onClose: () => void;
  onSelectTemplate: (templateName: string) => void;
  isOpen: boolean;
}

export function AddAppSheetPage({ onClose, onSelectTemplate, isOpen }: AddAppSheetPageProps) {
  const categories = [
    {
      id: 'daily',
      name: '하루 계획',
      icon: BookOpen,
      basicTemplates: [
        { id: '1', name: '기본 일일 플래너', description: '간단한 하루 일정 관리', color: 'bg-blue-500' },
        { id: '2', name: '시간표형 플래너', description: '시간대별 상세 계획', color: 'bg-indigo-500' },
        { id: '3', name: '목표 중심 플래너', description: '일일 목표 달성 추적', color: 'bg-purple-500' },
      ],
      popularTemplates: [
        { id: '4', name: '스터디 루틴', author: '@학습왕', likes: 234, color: 'bg-cyan-500' },
        { id: '5', name: '수능 D-100', author: '@고3선배', likes: 189, color: 'bg-teal-500' },
        { id: '6', name: '완벽한 하루', author: '@플래너덕후', likes: 156, color: 'bg-sky-500' },
      ],
    },
    {
      id: 'exam',
      name: '시험 관리',
      icon: Target,
      basicTemplates: [
        { id: '7', name: '기본 시험 관리', description: '시험 일정과 준비 현황', color: 'bg-red-500' },
        { id: '8', name: '과목별 준비도', description: '과목별 학습 진도 추적', color: 'bg-orange-500' },
        { id: '9', name: '오답노트 연계', description: '시험과 오답 통합 관리', color: 'bg-amber-500' },
      ],
      popularTemplates: [
        { id: '10', name: '중간고사 대비', author: '@시험만점', likes: 312, color: 'bg-rose-500' },
        { id: '11', name: '수능 전략', author: '@N수생', likes: 278, color: 'bg-pink-500' },
        { id: '12', name: '내신 관리', author: '@1등급', likes: 201, color: 'bg-fuchsia-500' },
      ],
    },
    {
      id: 'calendar',
      name: '캘린더',
      icon: Calendar,
      basicTemplates: [
        { id: '13', name: '기본 월간 캘린더', description: '월 단위 일정 관리', color: 'bg-green-500' },
        { id: '14', name: '학사 일정', description: '학교 일정 중심 캘린더', color: 'bg-emerald-500' },
        { id: '15', name: 'D-Day 캘린더', description: '중요 날짜 카운트다운', color: 'bg-lime-500' },
      ],
      popularTemplates: [
        { id: '16', name: '학기 플래너', author: '@모범생', likes: 267, color: 'bg-teal-500' },
        { id: '17', name: '방학 계획표', author: '@계획왕', likes: 198, color: 'bg-cyan-500' },
        { id: '18', name: '100일 챌린지', author: '@꾸준러', likes: 175, color: 'bg-sky-500' },
      ],
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div 
        className={`absolute left-0 right-0 bottom-0 bg-background rounded-t-[24px] z-[70] transition-transform duration-500 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: '794px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[20px] border-b border-border">
          <button
            onClick={onClose}
            className="px-[16px] py-[8px] rounded-[8px] hover:bg-accent transition-colors"
          >
            <span className="font-medium" style={{ fontSize: '16px' }}>취소</span>
          </button>
          
          <h2 className="font-semibold" style={{ fontSize: '20px' }}>새 앱시트 추가</h2>
          
          <button
            className="px-[16px] py-[8px] rounded-[8px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <span className="font-medium" style={{ fontSize: '16px' }}>추가</span>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto" style={{ height: 'calc(794px - 68px)' }}>
          <div className="px-[24px] py-[24px] flex flex-col gap-[32px]">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.id}>
                  {/* Category Header */}
                  <div className="flex items-center gap-[12px] mb-[16px]">
                    <div className="w-[32px] h-[32px] rounded-[8px] bg-primary/10 flex items-center justify-center">
                      <Icon className="w-[18px] h-[18px] text-primary" />
                    </div>
                    <h3 className="font-semibold" style={{ fontSize: '18px' }}>
                      {category.name}
                    </h3>
                  </div>

                  {/* Basic Templates */}
                  <div className="mb-[20px]">
                    <h4 className="font-medium mb-[12px] text-muted-foreground" style={{ fontSize: '14px' }}>
                      기본 템플릿
                    </h4>
                    <div className="flex gap-[12px] overflow-x-auto pb-[8px] scrollbar-hide">
                      {category.basicTemplates.map((template) => (
                        <div
                          key={template.id}
                          onClick={() => onSelectTemplate(template.name)}
                          className="flex-shrink-0 p-[16px] rounded-[12px] border-2 border-border hover:border-primary hover:bg-primary/5 cursor-pointer transition-all"
                          style={{ width: '200px' }}
                        >
                          <div className={`w-full h-[100px] rounded-[8px] ${template.color} mb-[12px]`}></div>
                          <h5 className="font-semibold mb-[4px]" style={{ fontSize: '15px' }}>
                            {template.name}
                          </h5>
                          <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                            {template.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Popular Templates */}
                  <div>
                    <h4 className="font-medium mb-[12px] text-muted-foreground" style={{ fontSize: '14px' }}>
                      친구 인기 템플릿
                    </h4>
                    <div className="flex gap-[12px] overflow-x-auto pb-[8px] scrollbar-hide">
                      {category.popularTemplates.map((template) => (
                        <div
                          key={template.id}
                          onClick={() => onSelectTemplate(template.name)}
                          className="flex-shrink-0 p-[16px] rounded-[12px] border-2 border-border hover:border-primary hover:bg-primary/5 cursor-pointer transition-all"
                          style={{ width: '200px' }}
                        >
                          <div className={`w-full h-[100px] rounded-[8px] ${template.color} mb-[12px]`}></div>
                          <h5 className="font-semibold mb-[4px]" style={{ fontSize: '15px' }}>
                            {template.name}
                          </h5>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                              {template.author}
                            </span>
                            <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                              ♥ {template.likes}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
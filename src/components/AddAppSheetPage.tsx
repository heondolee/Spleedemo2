import { X, BookOpen, Calendar, Target, Clock, FileText, Grid } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Template {
  id: string;
  name: string;
  description: string;
  color: string;
  category: string;
  author?: string;
  likes?: number;
}

interface AddAppSheetPageProps {
  onClose: () => void;
  onSelectTemplate: (templateName: string) => void;
  isOpen: boolean;
  existingSheets: Array<{ id: string; name: string; isNew: boolean }>;
}

export function AddAppSheetPage({ onClose, onSelectTemplate, isOpen, existingSheets }: AddAppSheetPageProps) {
  const categories = [
    {
      id: 'daily',
      name: '하루 계획',
      icon: BookOpen,
      basicTemplates: [
        { id: '1', name: '기본 일일 플래너', description: '간단한 하루 일정 관리', color: 'bg-blue-500', category: 'daily' },
        { id: '2', name: '시간표형 플래너', description: '시간대별 상세 계획', color: 'bg-indigo-500', category: 'daily' },
        { id: '3', name: '목표 중심 플래너', description: '일일 목표 달성 추적', color: 'bg-purple-500', category: 'daily' },
      ],
      popularTemplates: [
        { id: '4', name: '스터디 루틴', author: '@학습왕', likes: 234, color: 'bg-cyan-500', category: 'daily', description: '완벽한 학습 루틴 관리' },
        { id: '5', name: '수능 D-100', author: '@고3선배', likes: 189, color: 'bg-teal-500', category: 'daily', description: '수능 카운트다운과 일일 계획' },
        { id: '6', name: '완벽한 하루', author: '@플래너덕후', likes: 156, color: 'bg-sky-500', category: 'daily', description: '생산성 극대화 플래너' },
      ],
    },
    {
      id: 'exam',
      name: '시험 관리',
      icon: Target,
      basicTemplates: [
        { id: '7', name: '기본 시험 관리', description: '시험 일정과 준비 현황', color: 'bg-red-500', category: 'exam' },
        { id: '8', name: '과목별 준비도', description: '과목별 학습 진도 추적', color: 'bg-orange-500', category: 'exam' },
        { id: '9', name: '오답노트 연계', description: '시험과 오답 통합 관리', color: 'bg-amber-500', category: 'exam' },
      ],
      popularTemplates: [
        { id: '10', name: '중간고사 대비', author: '@시험만점', likes: 312, color: 'bg-rose-500', category: 'exam', description: '중간고사 완벽 준비' },
        { id: '11', name: '수능 전략', author: '@N수생', likes: 278, color: 'bg-pink-500', category: 'exam', description: '수능 시험 전략 관리' },
        { id: '12', name: '내신 관리', author: '@1등급', likes: 201, color: 'bg-fuchsia-500', category: 'exam', description: '내신 성적 관리' },
      ],
    },
    {
      id: 'calendar',
      name: '캘린더',
      icon: Calendar,
      basicTemplates: [
        { id: '13', name: '기본 월간 캘린더', description: '월 단위 일정 관리', color: 'bg-green-500', category: 'calendar' },
        { id: '14', name: '학사 일정', description: '학교 일정 중심 캘린더', color: 'bg-emerald-500', category: 'calendar' },
        { id: '15', name: 'D-Day 캘린더', description: '중요 날짜 카운트다운', color: 'bg-lime-500', category: 'calendar' },
      ],
      popularTemplates: [
        { id: '16', name: '학기 플래너', author: '@모범생', likes: 267, color: 'bg-teal-500', category: 'calendar', description: '학기별 일정 관리' },
        { id: '17', name: '방학 계획표', author: '@계획왕', likes: 198, color: 'bg-cyan-500', category: 'calendar', description: '방학 계획 수립' },
        { id: '18', name: '100일 챌린지', author: '@꾸준러', likes: 175, color: 'bg-sky-500', category: 'calendar', description: '100일 목표 달성' },
      ],
    },
  ];

  // 디폴트 선택: 첫 번째 기본 템플릿
  const defaultTemplate = categories[0].basicTemplates[0];
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(defaultTemplate);
  const [selectedCategory, setSelectedCategory] = useState<string>('daily');

  // isOpen이 true가 될 때마다 디폴트 선택 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedTemplate(defaultTemplate);
      setSelectedCategory('daily');
    }
  }, [isOpen]);

  // 카테고리별 이미 추가된 시트 확인
  const getCategoryFromSheetName = (sheetName: string): string | null => {
    for (const cat of categories) {
      const allTemplates = [...cat.basicTemplates, ...cat.popularTemplates];
      if (allTemplates.some(t => t.name === sheetName)) {
        return cat.id;
      }
    }
    return null;
  };

  const existingCategories = new Set(
    existingSheets.map(sheet => getCategoryFromSheetName(sheet.name)).filter(Boolean)
  );

  const isCategoryDisabled = (categoryId: string) => {
    return existingCategories.has(categoryId);
  };

  const isTemplateDisabled = (template: Template) => {
    return isCategoryDisabled(template.category);
  };

  const handleTemplateClick = (template: Template) => {
    if (!isTemplateDisabled(template)) {
      setSelectedTemplate(template);
    }
  };

  const handleAdd = () => {
    if (selectedTemplate && !isTemplateDisabled(selectedTemplate)) {
      onSelectTemplate(selectedTemplate.name);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // 카테고리 변경 시 해당 카테고리의 첫 번째 템플릿 선택
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      setSelectedTemplate(category.basicTemplates[0]);
    }
  };

  // 선택된 카테고리의 모든 템플릿
  const currentCategory = categories.find(cat => cat.id === selectedCategory);
  const allTemplates = currentCategory 
    ? [...currentCategory.basicTemplates, ...currentCategory.popularTemplates]
    : [];

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
        <div className="flex items-center justify-between px-[24px] border-b border-border" style={{ height: '56px' }}>
          <button
            onClick={onClose}
            className="px-[12px] py-[6px] rounded-[8px] hover:bg-accent transition-colors"
          >
            <span className="font-medium" style={{ fontSize: '15px' }}>취소</span>
          </button>
          
          <h2 className="font-semibold" style={{ fontSize: '18px' }}>새 앱시트 추가</h2>
          
          <button
            className="px-[12px] py-[6px] rounded-[8px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAdd}
            disabled={isTemplateDisabled(selectedTemplate)}
          >
            <span className="font-medium" style={{ fontSize: '15px' }}>추가</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="border-b border-border px-[24px]" style={{ height: '52px' }}>
          <div className="flex gap-[8px] h-full items-center">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              const isDisabled = isCategoryDisabled(category.id);
              
              return (
                <button
                  key={category.id}
                  onClick={() => !isDisabled && handleCategoryChange(category.id)}
                  className={`flex items-center gap-[8px] px-[16px] py-[8px] rounded-[8px] transition-all ${
                    isDisabled 
                      ? 'opacity-40 cursor-not-allowed'
                      : isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                  disabled={isDisabled}
                >
                  <Icon className="w-[16px] h-[16px]" />
                  <span className="font-medium" style={{ fontSize: '14px' }}>
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content - Split View */}
        <div className="flex" style={{ height: 'calc(794px - 56px - 52px)' }}>
          {/* Left Side - Horizontal Scroll Template List */}
          <div className="border-r border-border" style={{ width: '577px' }}>
            {/* Basic Templates Section */}
            <div className="p-[20px] border-b border-border">
              <h4 className="font-medium mb-[12px] text-muted-foreground" style={{ fontSize: '13px' }}>
                기본 템플릿
              </h4>
              <div className="flex gap-[12px] overflow-x-auto pb-[8px] scrollbar-hide">
                {currentCategory?.basicTemplates.map((template) => {
                  const isSelected = selectedTemplate.id === template.id;
                  const disabled = isTemplateDisabled(template);
                  
                  return (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateClick(template)}
                      className={`flex-shrink-0 rounded-[12px] border-2 transition-all ${
                        disabled 
                          ? 'border-border cursor-not-allowed opacity-50' 
                          : isSelected
                          ? 'border-primary'
                          : 'border-border hover:border-primary/50 cursor-pointer'
                      }`}
                      style={{ width: '160px' }}
                    >
                      {/* Thumbnail - 2:3 ratio (width:height) */}
                      <div 
                        className={`w-full rounded-t-[10px] ${template.color}`}
                        style={{ height: '240px' }}
                      ></div>
                      {/* Info */}
                      <div className="p-[12px]">
                        <h5 className="font-semibold mb-[4px]" style={{ fontSize: '13px' }}>
                          {template.name}
                        </h5>
                        <p className="text-muted-foreground line-clamp-2" style={{ fontSize: '11px' }}>
                          {template.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Popular Templates Section */}
            <div className="p-[20px]">
              <h4 className="font-medium mb-[12px] text-muted-foreground" style={{ fontSize: '13px' }}>
                친구 인기 템플릿
              </h4>
              <div className="flex gap-[12px] overflow-x-auto pb-[8px] scrollbar-hide">
                {currentCategory?.popularTemplates.map((template) => {
                  const isSelected = selectedTemplate.id === template.id;
                  const disabled = isTemplateDisabled(template);
                  
                  return (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateClick(template)}
                      className={`flex-shrink-0 rounded-[12px] border-2 transition-all ${
                        disabled 
                          ? 'border-border cursor-not-allowed opacity-50' 
                          : isSelected
                          ? 'border-primary'
                          : 'border-border hover:border-primary/50 cursor-pointer'
                      }`}
                      style={{ width: '160px' }}
                    >
                      {/* Thumbnail - 2:3 ratio */}
                      <div 
                        className={`w-full rounded-t-[10px] ${template.color}`}
                        style={{ height: '240px' }}
                      ></div>
                      {/* Info */}
                      <div className="p-[12px]">
                        <h5 className="font-semibold mb-[4px]" style={{ fontSize: '13px' }}>
                          {template.name}
                        </h5>
                        <div className="flex items-center gap-[8px] text-muted-foreground">
                          <span style={{ fontSize: '11px' }}>{template.author}</span>
                          <span style={{ fontSize: '11px' }}>♥ {template.likes}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side - Preview */}
          <div className="flex-1 bg-card p-[24px] flex flex-col items-center justify-center">
            <div className="text-center max-w-[400px]">
              {/* Preview Area */}
              <div className={`w-full h-[400px] rounded-[16px] ${selectedTemplate.color} mb-[24px]`}></div>
              
              {/* Template Info */}
              <h3 className="font-bold mb-[8px]" style={{ fontSize: '24px' }}>
                {selectedTemplate.name}
              </h3>
              <p className="text-muted-foreground mb-[16px]" style={{ fontSize: '15px' }}>
                {selectedTemplate.description}
              </p>
              
              {/* Author info for popular templates */}
              {selectedTemplate.author && (
                <div className="flex items-center justify-center gap-[12px] text-muted-foreground">
                  <span style={{ fontSize: '14px' }}>{selectedTemplate.author}</span>
                  <span style={{ fontSize: '14px' }}>♥ {selectedTemplate.likes}</span>
                </div>
              )}

              {/* Disabled notice */}
              {isTemplateDisabled(selectedTemplate) && (
                <div className="mt-[16px] p-[12px] rounded-[8px] bg-muted">
                  <p className="text-muted-foreground" style={{ fontSize: '13px' }}>
                    이 카테고리의 앱시트는 이미 추가되었습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

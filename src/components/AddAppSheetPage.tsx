import { X, BookOpen, Calendar, Target, Clock, FileText, Grid, ArrowLeft, Save, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { ScrollableContainer } from './ScrollableContainer';

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
  savedTemplates: {
    [categoryId: string]: Array<{
      id: string;
      name: string;
      description: string;
      color: string;
      category: string;
    }>;
  };
  onSaveTemplate: (categoryId: string, templateName: string, baseTemplate: any) => void;
  onDeleteTemplate: (categoryId: string, templateId: string) => void;
  onApplyTemplate: (categoryId: string, templateName: string) => void;
}

export function AddAppSheetPage({ 
  onClose, 
  onSelectTemplate, 
  isOpen, 
  existingSheets,
  savedTemplates,
  onSaveTemplate,
  onDeleteTemplate,
  onApplyTemplate
}: AddAppSheetPageProps) {
  const categories = [
    {
      id: 'daily',
      name: '하루 계획',
      icon: BookOpen,
      basicTemplates: [
        { id: '1', name: '하루 계획', description: '하루 일정과 목표를 관리합니다', color: 'bg-blue-500', category: 'daily' },
      ],
      popularTemplates: [],
    },
    {
      id: 'exam',
      name: '시험 관리',
      icon: Target,
      basicTemplates: [
        { id: '2', name: '시험 관리', description: '시험 일정과 준비 현황을 관리합니다', color: 'bg-red-500', category: 'exam' },
      ],
      popularTemplates: [],
    },
    {
      id: 'calendar',
      name: '캘린더',
      icon: Calendar,
      basicTemplates: [
        { id: '3', name: '캘린더', description: '일정을 캘린더로 관리합니다', color: 'bg-green-500', category: 'calendar' },
      ],
      popularTemplates: [],
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

  // 현재 적용된 템플릿 찾기 (해당 카테고리의 existingSheet)
  const getCurrentTemplateForCategory = (categoryId: string): Template | null => {
    const sheet = existingSheets.find(
      (s) => getCategoryFromSheetName(s.name) === categoryId
    );
    if (!sheet) return null;

    // 모든 템플릿 중에서 찾기
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return null;

    const allTemplates = [
      ...category.basicTemplates,
      ...category.popularTemplates,
    ];
    return allTemplates.find((t) => t.name === sheet.name) || null;
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
    // 미리보기는 항상 가능하도록 변경
    setSelectedTemplate(template);
  };

  const handleAdd = () => {
    if (selectedTemplate && !isTemplateDisabled(selectedTemplate)) {
      onSelectTemplate(selectedTemplate.name);
    }
  };

  // 템플릿이 이미 저장되어 있는지 확인하는 함수
  const isTemplateSaved = (template: Template): boolean => {
    if (!savedTemplates[selectedCategory]) return false;
    return savedTemplates[selectedCategory].some(saved => saved.name === template.name);
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
        style={{ height: '834px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] border-b border-border" style={{ height: '56px' }}>
          <button
            onClick={onClose}
            className="p-[8px] rounded-[8px] hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-[20px] h-[20px]" />
          </button>
          
          <h2 className="font-semibold" style={{ fontSize: '18px' }}>새 앱시트 추가</h2>
          
          {/* Show button based on state */}
          <div style={{ width: '80px' }} className="flex justify-end">
            {!isCategoryDisabled(selectedCategory) ? (
              <button
                className="px-[12px] py-[6px] rounded-[8px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                onClick={handleAdd}
              >
                <span className="font-medium" style={{ fontSize: '15px' }}>추가</span>
              </button>
            ) : (
              // For categories with existing sheets, show "적용" only when selecting a different template from "내 템플릿"
              getCurrentTemplateForCategory(selectedCategory)?.name !== selectedTemplate.name &&
              savedTemplates[selectedCategory]?.some(t => t.id === selectedTemplate.id) && (
                <button
                  className="px-[12px] py-[6px] rounded-[8px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  onClick={() => onApplyTemplate(selectedCategory, selectedTemplate.name)}
                >
                  <span className="font-medium" style={{ fontSize: '15px' }}>적용</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="border-b border-border px-[24px]" style={{ height: '52px' }}>
          <div className="flex gap-[8px] h-full items-center">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`flex items-center gap-[8px] px-[16px] py-[8px] rounded-[8px] transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
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
        <div className="flex" style={{ height: 'calc(834px - 56px - 52px)' }}>
          {/* Left Side - Horizontal Scroll Template List */}
          <div className="border-r border-border overflow-y-auto" style={{ width: '597px' }}>
            {/* My Templates Section - Shown at top (if category exists) */}
            {isCategoryDisabled(selectedCategory) && (
              <div className="p-[20px] border-b border-border">
                <h4 className="font-medium mb-[12px] text-muted-foreground" style={{ fontSize: '13px' }}>
                  내 템플릿
                </h4>
                <ScrollableContainer className="flex gap-[12px] overflow-x-auto pb-[8px] scrollbar-hide">
                  {/* Current Applied Template */}
                  {(() => {
                    const currentTemplate = getCurrentTemplateForCategory(selectedCategory);
                    if (currentTemplate) {
                      const isSelected = selectedTemplate.id === currentTemplate.id;
                      return (
                        <div
                          key={`current-${currentTemplate.id}`}
                          onClick={() => setSelectedTemplate(currentTemplate)}
                          className={`flex-shrink-0 rounded-[12px] border-2 transition-all cursor-pointer relative ${
                            isSelected
                              ? 'border-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                          style={{ width: '120px' }}
                        >
                          {/* "현재" Badge */}
                          <div className="absolute top-[8px] right-[8px] z-10 px-[8px] py-[2px] rounded-[4px] bg-primary text-primary-foreground">
                            <span className="font-medium" style={{ fontSize: '10px' }}>현재</span>
                          </div>
                          {/* Thumbnail - 2:3 ratio (120px:180px) */}
                          <div 
                            className={`w-full rounded-t-[10px] ${currentTemplate.color}`}
                            style={{ height: '180px' }}
                          ></div>
                          {/* Info */}
                          <div className="p-[10px]">
                            <h5 className="font-semibold mb-[4px] line-clamp-1" style={{ fontSize: '12px' }}>
                              {currentTemplate.name}
                            </h5>
                            <p className="text-muted-foreground line-clamp-2" style={{ fontSize: '10px' }}>
                              {currentTemplate.description}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                  {/* Saved Templates */}
                  {savedTemplates[selectedCategory]
                    ?.filter((template) => {
                      // 현재 적용된 템플릿은 제외 (중복 방지)
                      const currentTemplate = getCurrentTemplateForCategory(selectedCategory);
                      return currentTemplate?.name !== template.name;
                    })
                    .map((template) => {
                      const isSelected = selectedTemplate.id === template.id;
                      
                      return (
                        <div
                          key={template.id}
                          className="flex-shrink-0 relative"
                          style={{ width: '120px' }}
                        >
                          <div
                            onClick={() => setSelectedTemplate(template as Template)}
                            className={`rounded-[12px] border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-primary'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            {/* Thumbnail - 2:3 ratio (120px:180px) */}
                            <div 
                              className={`w-full rounded-t-[10px] ${template.color}`}
                              style={{ height: '180px' }}
                            ></div>
                            {/* Info */}
                            <div className="p-[10px]">
                              <h5 className="font-semibold mb-[4px] line-clamp-1" style={{ fontSize: '12px' }}>
                                {template.name}
                              </h5>
                              <p className="text-muted-foreground line-clamp-2" style={{ fontSize: '10px' }}>
                                {template.description}
                              </p>
                            </div>
                          </div>

                          {/* Delete Button - Show only when selected */}
                          {isSelected && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTemplate(selectedCategory, template.id);
                                // 삭제 후 현재 템플릿으로 선택 변경
                                const currentTemplate = getCurrentTemplateForCategory(selectedCategory);
                                if (currentTemplate) {
                                  setSelectedTemplate(currentTemplate);
                                }
                              }}
                              className="absolute top-[8px] right-[8px] p-[6px] rounded-[6px] bg-destructive/90 backdrop-blur-sm text-destructive-foreground hover:bg-destructive transition-colors z-10"
                              title="템플릿 삭제"
                            >
                              <X className="w-[14px] h-[14px]" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                </ScrollableContainer>
              </div>
            )}
            
            {/* Basic Templates Section */}
            <div className="p-[20px] border-b border-border">
              <h4 className="font-medium mb-[12px] text-muted-foreground" style={{ fontSize: '13px' }}>
                기본 템플릿
              </h4>
              <ScrollableContainer className="flex gap-[12px] overflow-x-auto pb-[8px] scrollbar-hide">
                {currentCategory?.basicTemplates.map((template) => {
                  const isSelected = selectedTemplate.id === template.id;
                  
                  return (
                    <div
                      key={template.id}
                      className="flex-shrink-0 relative"
                      style={{ width: '120px' }}
                    >
                      <div
                        onClick={() => handleTemplateClick(template)}
                        className={`rounded-[12px] border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {/* Thumbnail - 2:3 ratio (120px:180px) */}
                        <div 
                          className={`w-full rounded-t-[10px] ${template.color}`}
                          style={{ height: '180px' }}
                        ></div>
                        {/* Info */}
                        <div className="p-[10px]">
                          <h5 className="font-semibold mb-[4px] line-clamp-1" style={{ fontSize: '12px' }}>
                            {template.name}
                          </h5>
                          <p className="text-muted-foreground line-clamp-2" style={{ fontSize: '10px' }}>
                            {template.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Save Button - Show only for categories with existing sheets */}
                      {isCategoryDisabled(selectedCategory) && (
                        isTemplateSaved(template) ? (
                          <div
                            className="absolute bottom-[10px] right-[10px] p-[6px] rounded-[6px] bg-primary/90 backdrop-blur-sm text-primary-foreground z-10"
                            title="저장됨"
                          >
                            <Check className="w-[14px] h-[14px]" />
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSaveTemplate(selectedCategory, template.name, template);
                            }}
                            className="absolute bottom-[10px] right-[10px] p-[6px] rounded-[6px] bg-background/90 backdrop-blur-sm border border-border hover:bg-accent transition-colors z-10"
                            title="템플릿 저장"
                          >
                            <Save className="w-[14px] h-[14px]" />
                          </button>
                        )
                      )}
                    </div>
                  );
                })}
              </ScrollableContainer>
            </div>

            {/* Popular Templates Section - Only show if there are templates */}
            {currentCategory?.popularTemplates && currentCategory.popularTemplates.length > 0 && (
              <div className="p-[20px] border-b border-border">
                <h4 className="font-medium mb-[12px] text-muted-foreground" style={{ fontSize: '13px' }}>
                  친구 인기 템플릿
                </h4>
                <ScrollableContainer className="flex gap-[12px] overflow-x-auto pb-[8px] scrollbar-hide">
                  {currentCategory.popularTemplates.map((template) => {
                    const isSelected = selectedTemplate.id === template.id;

                    return (
                      <div
                        key={template.id}
                        className="flex-shrink-0 relative"
                        style={{ width: '120px' }}
                      >
                        <div
                          onClick={() => handleTemplateClick(template)}
                          className={`rounded-[12px] border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {/* Thumbnail - 2:3 ratio (120px:180px) */}
                          <div
                            className={`w-full rounded-t-[10px] ${template.color}`}
                            style={{ height: '180px' }}
                          ></div>
                          {/* Info */}
                          <div className="p-[10px]">
                            <h5 className="font-semibold mb-[4px] line-clamp-1" style={{ fontSize: '12px' }}>
                              {template.name}
                            </h5>
                            <div className="flex items-center gap-[6px] text-muted-foreground">
                              <span className="truncate" style={{ fontSize: '10px' }}>{template.author}</span>
                              <span className="flex-shrink-0" style={{ fontSize: '10px' }}>♥ {template.likes}</span>
                            </div>
                          </div>
                        </div>

                        {/* Save Button - Show only for categories with existing sheets */}
                        {isCategoryDisabled(selectedCategory) && (
                          isTemplateSaved(template) ? (
                            <div
                              className="absolute bottom-[10px] right-[10px] p-[6px] rounded-[6px] bg-primary/90 backdrop-blur-sm text-primary-foreground z-10"
                              title="저장됨"
                            >
                              <Check className="w-[14px] h-[14px]" />
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSaveTemplate(selectedCategory, template.name, template);
                              }}
                              className="absolute bottom-[10px] right-[10px] p-[6px] rounded-[6px] bg-background/90 backdrop-blur-sm border border-border hover:bg-accent transition-colors z-10"
                              title="템플릿 저장"
                            >
                              <Save className="w-[14px] h-[14px]" />
                            </button>
                          )
                        )}
                      </div>
                    );
                  })}
                </ScrollableContainer>
              </div>
            )}
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
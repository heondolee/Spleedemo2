import { useState } from 'react';
import { X, GripVertical, Minus, Plus, Save, Eye, Download } from 'lucide-react';

interface LayoutComponent {
  id: string;
  type: 'progress' | 'strategy' | 'memo' | 'ranges' | 'header';
  label: string;
  order: number;
}

interface Template {
  id: string;
  name: string;
  description: string;
  components: LayoutComponent[];
  isDefault?: boolean;
}

interface SheetLayoutEditorProps {
  sheetName: string;
  sheetId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SheetLayoutEditor({ sheetName, sheetId, isOpen, onClose }: SheetLayoutEditorProps) {
  if (!isOpen) return null;

  const [components, setComponents] = useState<LayoutComponent[]>([
    { id: '1', type: 'header', label: '과목 헤더', order: 0 },
    { id: '2', type: 'progress', label: '진행도', order: 1 },
    { id: '3', type: 'strategy', label: '전략', order: 2 },
    { id: '4', type: 'memo', label: '메모', order: 3 },
    { id: '5', type: 'ranges', label: '학습 범위', order: 4 },
  ]);
  
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [draggedComponentId, setDraggedComponentId] = useState<string | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<Template[]>([
    {
      id: 't1',
      name: '내 시험 템플릿',
      description: '커스텀 레이아웃',
      components: [],
    },
  ]);

  const defaultTemplates: Template[] = [
    {
      id: 'default1',
      name: '기본 시험 관리',
      description: '진행도, 전략, 메모, 학습 범위',
      components: [
        { id: 'd1', type: 'header', label: '과목 헤더', order: 0 },
        { id: 'd2', type: 'progress', label: '진행도', order: 1 },
        { id: 'd3', type: 'strategy', label: '전략', order: 2 },
        { id: 'd4', type: 'memo', label: '메모', order: 3 },
        { id: 'd5', type: 'ranges', label: '학습 범위', order: 4 },
      ],
      isDefault: true,
    },
    {
      id: 'default2',
      name: '집중 학습',
      description: '학습 범위와 진행도 중심',
      components: [
        { id: 'd6', type: 'header', label: '과목 헤더', order: 0 },
        { id: 'd7', type: 'progress', label: '진행도', order: 1 },
        { id: 'd8', type: 'ranges', label: '학습 범위', order: 2 },
      ],
      isDefault: true,
    },
    {
      id: 'default3',
      name: '전략 중심',
      description: '전략과 메모 위주',
      components: [
        { id: 'd9', type: 'header', label: '과목 헤더', order: 0 },
        { id: 'd10', type: 'strategy', label: '전략', order: 1 },
        { id: 'd11', type: 'memo', label: '메모', order: 2 },
        { id: 'd12', type: 'ranges', label: '학습 범위', order: 3 },
      ],
      isDefault: true,
    },
  ];

  const availableComponents = [
    { type: 'progress', label: '진행도', description: '학습 진행 상태를 표시합니다' },
    { type: 'strategy', label: '전략', description: '학습 전략을 입력합니다' },
    { type: 'memo', label: '메모', description: '메모를 작성합니다' },
    { type: 'ranges', label: '학습 범위', description: '체크리스트 형태로 관리합니다' },
  ];

  const handleComponentClick = (id: string) => {
    setSelectedComponentId(selectedComponentId === id ? null : id);
  };

  const handleDeleteComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id));
    setSelectedComponentId(null);
  };

  const handleAddComponent = (type: string) => {
    const newComponent: LayoutComponent = {
      id: Date.now().toString(),
      type: type as LayoutComponent['type'],
      label: availableComponents.find(c => c.type === type)?.label || '',
      order: components.length,
    };
    setComponents([...components, newComponent]);
  };

  const handleDragStart = (id: string) => {
    setDraggedComponentId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedComponentId || draggedComponentId === targetId) return;

    const draggedIndex = components.findIndex(c => c.id === draggedComponentId);
    const targetIndex = components.findIndex(c => c.id === targetId);

    const newComponents = [...components];
    const [draggedItem] = newComponents.splice(draggedIndex, 1);
    newComponents.splice(targetIndex, 0, draggedItem);

    // Update order
    newComponents.forEach((comp, index) => {
      comp.order = index;
    });

    setComponents(newComponents);
  };

  const handleDragEnd = () => {
    setDraggedComponentId(null);
  };

  const handleSaveTemplate = () => {
    const templateName = prompt('템플릿 이름을 입력하세요:', `${sheetName} 레이아웃`);
    if (templateName) {
      const newTemplate: Template = {
        id: Date.now().toString(),
        name: templateName,
        description: `${components.length}개 컴포넌트`,
        components: components.map(c => ({ ...c })),
      };
      setSavedTemplates([...savedTemplates, newTemplate]);
    }
  };

  const handleLoadTemplate = (template: Template) => {
    setComponents(template.components.map(c => ({ ...c, id: Date.now().toString() + c.id })));
  };

  const getComponentPreview = (comp: LayoutComponent) => {
    switch (comp.type) {
      case 'header':
        return (
          <div className="px-[12px] py-[10px] bg-accent/30 rounded-t-[8px]">
            <span className="font-medium text-sm">과목 이름</span>
          </div>
        );
      case 'progress':
        return (
          <div className="px-[12px] py-[10px]">
            <div className="flex items-center gap-[8px]">
              <div className="flex-1 h-[6px] bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[65%]" />
              </div>
              <span className="text-xs text-muted-foreground">65%</span>
            </div>
          </div>
        );
      case 'strategy':
        return (
          <div className="px-[12px] py-[8px]">
            <div className="text-xs text-muted-foreground mb-[4px]">전략</div>
            <div className="text-sm">기출문제 위주로 학습</div>
          </div>
        );
      case 'memo':
        return (
          <div className="px-[12px] py-[8px]">
            <div className="text-xs text-muted-foreground mb-[4px]">메모</div>
            <div className="text-sm text-muted-foreground">메모 내용...</div>
          </div>
        );
      case 'ranges':
        return (
          <div className="px-[12px] py-[8px]">
            <div className="text-xs text-muted-foreground mb-[6px]">학습 범위</div>
            <div className="space-y-[4px]">
              <div className="flex items-center gap-[6px] text-sm">
                <div className="w-[14px] h-[14px] border-2 border-primary bg-primary rounded-[3px]" />
                <span className="line-through text-muted-foreground">1단원: 다항식</span>
              </div>
              <div className="flex items-center gap-[6px] text-sm">
                <div className="w-[14px] h-[14px] border-2 border-border rounded-[3px]" />
                <span>2단원: 방정식</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex">
      {/* Left Side - Preview */}
      <div className="w-[597px] border-r border-border flex flex-col">
        {/* Header */}
        <div className="h-[56px] border-b border-border px-[16px] flex items-center justify-between">
          <span className="font-medium" style={{ fontSize: '16px' }}>{sheetName} 미리보기</span>
          <button
            onClick={onClose}
            className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] hover:bg-accent transition-colors"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-[16px]">
          <div className="border border-border rounded-[10px] bg-background/50 overflow-hidden max-w-[400px] mx-auto">
            {components.sort((a, b) => a.order - b.order).map((comp) => (
              <div
                key={comp.id}
                draggable
                onDragStart={() => handleDragStart(comp.id)}
                onDragOver={(e) => handleDragOver(e, comp.id)}
                onDragEnd={handleDragEnd}
                onClick={() => handleComponentClick(comp.id)}
                className={`relative border-b border-border last:border-b-0 cursor-move transition-all ${
                  selectedComponentId === comp.id ? 'bg-accent/50 ring-2 ring-primary' : 'hover:bg-accent/30'
                } ${draggedComponentId === comp.id ? 'opacity-50' : ''}`}
              >
                {/* Drag Handle */}
                {selectedComponentId === comp.id && (
                  <div className="absolute left-[8px] top-1/2 -translate-y-1/2 text-muted-foreground">
                    <GripVertical className="w-[16px] h-[16px]" />
                  </div>
                )}

                {/* Delete Button */}
                {selectedComponentId === comp.id && comp.type !== 'header' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteComponent(comp.id);
                    }}
                    className="absolute right-[8px] top-[8px] w-[24px] h-[24px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors z-10"
                  >
                    <Minus className="w-[14px] h-[14px]" />
                  </button>
                )}

                {/* Component Preview */}
                <div className={selectedComponentId === comp.id ? 'pl-[28px]' : ''}>
                  {getComponentPreview(comp)}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center text-muted-foreground text-sm mt-[16px]">
            컴포넌트를 클릭하여 선택하고 드래그하여 순서를 변경하세요
          </div>
        </div>
      </div>

      {/* Right Side - Editor */}
      <div className="flex-1 flex flex-col bg-accent/10">
        {/* Header */}
        <div className="h-[56px] border-b border-border px-[16px] flex items-center justify-between">
          <span className="font-medium" style={{ fontSize: '16px' }}>레이아웃 편집</span>
          <button
            onClick={handleSaveTemplate}
            className="px-[12px] py-[6px] bg-primary text-primary-foreground rounded-[8px] hover:bg-primary/90 transition-colors font-medium flex items-center gap-[6px]"
            style={{ fontSize: '13px' }}
          >
            <Save className="w-[14px] h-[14px]" />
            템플릿으로 저장
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-[16px] space-y-[24px]">
          {/* Add Components Section */}
          <div>
            <h3 className="font-semibold mb-[12px]" style={{ fontSize: '14px' }}>컴포넌트 추가</h3>
            <div className="grid grid-cols-2 gap-[12px]">
              {availableComponents.map((comp) => (
                <button
                  key={comp.type}
                  onClick={() => handleAddComponent(comp.type)}
                  className="border border-border rounded-[10px] p-[12px] hover:border-primary hover:bg-accent/50 transition-all text-left"
                >
                  <div className="flex items-start justify-between mb-[8px]">
                    <span className="font-medium" style={{ fontSize: '13px' }}>{comp.label}</span>
                    <Plus className="w-[16px] h-[16px] text-muted-foreground flex-shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground">{comp.description}</p>
                  
                  {/* Mini Preview */}
                  <div className="mt-[8px] border border-border rounded-[6px] bg-background overflow-hidden text-xs">
                    {getComponentPreview({
                      id: 'preview',
                      type: comp.type as LayoutComponent['type'],
                      label: comp.label,
                      order: 0,
                    })}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Saved Templates Section */}
          <div>
            <h3 className="font-semibold mb-[12px]" style={{ fontSize: '14px' }}>내 템플릿</h3>
            <div className="space-y-[8px]">
              {savedTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleLoadTemplate(template)}
                  className="w-full border border-border rounded-[10px] p-[12px] hover:border-primary hover:bg-accent/50 transition-all text-left"
                >
                  <div className="flex items-start justify-between mb-[4px]">
                    <span className="font-medium" style={{ fontSize: '13px' }}>{template.name}</span>
                    <Eye className="w-[16px] h-[16px] text-muted-foreground flex-shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Default Templates Section */}
          <div>
            <h3 className="font-semibold mb-[12px]" style={{ fontSize: '14px' }}>기본 추천 템플릿</h3>
            <div className="space-y-[8px]">
              {defaultTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleLoadTemplate(template)}
                  className="w-full border border-border rounded-[10px] overflow-hidden hover:border-primary transition-all text-left"
                >
                  <div className="p-[12px]">
                    <div className="flex items-start justify-between mb-[4px]">
                      <span className="font-medium" style={{ fontSize: '13px' }}>{template.name}</span>
                      <Download className="w-[16px] h-[16px] text-muted-foreground flex-shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-[8px]">{template.description}</p>
                  </div>
                  
                  {/* Template Preview */}
                  <div className="border-t border-border bg-background/50 p-[8px]">
                    <div className="text-xs text-muted-foreground mb-[4px]">미리보기</div>
                    <div className="border border-border rounded-[6px] bg-background overflow-hidden">
                      {template.components.slice(0, 3).map((comp) => (
                        <div key={comp.id} className="border-b border-border last:border-b-0 text-xs">
                          {getComponentPreview(comp)}
                        </div>
                      ))}
                      {template.components.length > 3 && (
                        <div className="px-[12px] py-[6px] text-center text-muted-foreground text-xs">
                          +{template.components.length - 3}개 더보기
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
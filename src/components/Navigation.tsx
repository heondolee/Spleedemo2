import { Plus, ChevronLeft, ChevronRight, BookOpen, PanelLeft, Settings, Palette, CreditCard, Trash2, User, Globe, FileText, Shield, Info, MessageCircle, Gift, X, ArrowLeft, Check, Mail, ExternalLink } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { SheetContextMenu } from './SheetContextMenu';

interface AppSheet {
  id: string;
  name: string;
  isNew: boolean;
}

interface NavigationProps {
  isExpanded: boolean;
  onToggle: () => void;
  appSheets: AppSheet[];
  selectedSheets: {
    left: string | null;
    right: string | null;
  };
  onSheetSelect: (sheetName: string, position: 'left' | 'right') => void;
  focusedSheet: 'left' | 'right';
  showAddSheet: boolean;
  setShowAddSheet: (show: boolean) => void;
  onDeleteSheet: (sheetId: string) => void;
  onRenameSheet: (sheetId: string, newName: string) => void;
  onReorderSheets: (newOrder: AppSheet[]) => void;
  onEditSheet: (sheetName: string) => void;
}

const settingsItems = [
  { id: 'language', icon: Globe, label: '언어', value: '한국어', hasArrow: true },
  { id: 'terms', icon: FileText, label: '이용약관', hasArrow: true },
  { id: 'privacy', icon: Shield, label: '개인정보처리방침', hasArrow: true },
  { id: 'version', icon: Info, label: '버전정보', value: 'v1.0.0', hasArrow: false },
  { id: 'contact', icon: MessageCircle, label: '문의하기', hasArrow: true },
  { id: 'giftcode', icon: Gift, label: '선물티켓코드', hasArrow: true },
];

export function Navigation({
  isExpanded,
  onToggle,
  appSheets,
  selectedSheets,
  onSheetSelect,
  focusedSheet,
  showAddSheet,
  setShowAddSheet,
  onDeleteSheet,
  onRenameSheet,
  onReorderSheets,
  onEditSheet
}: NavigationProps) {
  const [contextMenu, setContextMenu] = useState<{
    sheetId: string;
    sheetName: string;
    x: number;
    y: number;
  } | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsView, setSettingsView] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('ko');
  const [giftCode, setGiftCode] = useState('');
  const [editingSheetId, setEditingSheetId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    draggedId: string | null;
    draggedOverId: string | null;
    longPressTimer: NodeJS.Timeout | null;
    startY: number;
    currentY: number;
  }>({
    isDragging: false,
    draggedId: null,
    draggedOverId: null,
    longPressTimer: null,
    startY: 0,
    currentY: 0,
  });

  const handleSheetClick = (sheetName: string) => {
    // 현재 포커스된 화면에 해당 시트를 설정 (교체)
    onSheetSelect(sheetName, focusedSheet);
  };

  const handleMouseDown = (e: React.MouseEvent, sheet: AppSheet) => {
    // 편집 중이면 이벤트 무시
    if (editingSheetId === sheet.id) {
      return;
    }
    
    const startY = e.clientY;
    setDragState(prev => ({
      ...prev,
      startY,
      currentY: startY,
      draggedId: sheet.id, // Set draggedId immediately
    }));

    const timer = setTimeout(() => {
      // 500ms 후에도 움직임이 거의 없으면 컨텍스트 메뉴 표시
      if (Math.abs(dragState.currentY - startY) < 5) {
        setContextMenu({
          sheetId: sheet.id,
          sheetName: sheet.name,
          x: e.clientX,
          y: e.clientY,
        });
        setDragState(prev => ({
          ...prev,
          longPressTimer: null,
          draggedId: null, // Reset draggedId when showing menu
        }));
      } else {
        // 움직였으면 드래그 시작
        setDragState(prev => ({
          ...prev,
          isDragging: true,
          longPressTimer: null,
        }));
      }
    }, 500);

    setDragState(prev => ({
      ...prev,
      longPressTimer: timer,
    }));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const currentY = e.clientY;
    setDragState(prev => {
      const newState = {
        ...prev,
        currentY,
      };

      // 움직임이 5px 이상이면 long press 타이머 취소하고 드래그 시작
      if (prev.longPressTimer && Math.abs(currentY - prev.startY) > 5) {
        clearTimeout(prev.longPressTimer);
        return {
          ...newState,
          isDragging: true,
          longPressTimer: null,
        };
      }

      return newState;
    });
  };

  const handleMouseUp = (e: React.MouseEvent, sheet: AppSheet) => {
    if (dragState.longPressTimer) {
      clearTimeout(dragState.longPressTimer);
    }

    if (dragState.isDragging && dragState.draggedId && dragState.draggedOverId) {
      // 드래그 앤 드롭으로 순서 변경
      const newOrder = [...appSheets];
      const draggedIndex = newOrder.findIndex(s => s.id === dragState.draggedId);
      const targetIndex = newOrder.findIndex(s => s.id === dragState.draggedOverId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [removed] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, removed);
        onReorderSheets(newOrder);
      }
    } else if (!dragState.isDragging && Math.abs(e.clientY - dragState.startY) < 5) {
      // 클릭으로 간주
      handleSheetClick(sheet.name);
    }

    setDragState({
      isDragging: false,
      draggedId: null,
      draggedOverId: null,
      longPressTimer: null,
      startY: 0,
      currentY: 0,
    });
  };

  const handleMouseEnter = (sheetId: string) => {
    if (dragState.isDragging) {
      setDragState(prev => ({
        ...prev,
        draggedOverId: sheetId,
      }));
    }
  };

  const startEditing = (sheetId: string, sheetName: string) => {
    setEditingSheetId(sheetId);
    setEditingName(sheetName);
  };

  const cancelEditing = () => {
    setEditingSheetId(null);
    setEditingName('');
  };

  const saveEditing = () => {
    if (editingSheetId && editingName.trim() && editingName.trim() !== appSheets.find(s => s.id === editingSheetId)?.name) {
      onRenameSheet(editingSheetId, editingName.trim());
    }
    cancelEditing();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveEditing();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  // Focus input when editing starts
  useEffect(() => {
    if (editingSheetId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingSheetId]);

  if (!isExpanded) {
    // 완전히 접힌 상태 - 토글 버튼만 표시
    return (
      <div className="absolute left-[16px] top-[16px] z-50">
        <button
          onClick={onToggle}
          className="w-[44px] h-[44px] flex items-center justify-center rounded-[8px] bg-background border border-border hover:bg-accent transition-colors shadow-lg"
        >
          <PanelLeft className="w-[20px] h-[20px]" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div 
        className="absolute left-0 top-0 h-full bg-background border-r border-border flex flex-col z-50 shadow-xl"
        style={{ width: '240px' }}
      >
        {/* Profile & Toggle */}
        <div className="p-[16px] flex items-center justify-between">
          {/* Profile Image with Dropdown */}
          <div className="relative">
            <div
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium cursor-pointer hover:bg-primary/90 transition-colors"
              style={{ width: '44px', height: '44px', fontSize: '16px' }}
            >
              U
            </div>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-[100]"
                  onClick={() => setShowProfileMenu(false)}
                />
                {/* Menu */}
                <div
                  className="absolute left-0 top-[52px] bg-background border border-border rounded-[12px] shadow-xl z-[101] overflow-hidden"
                  style={{ width: '180px' }}
                >
                  <div className="py-[4px]">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        // TODO: 프로필 페이지 열기
                      }}
                      className="w-full flex items-center gap-[12px] px-[16px] py-[10px] hover:bg-accent transition-colors"
                    >
                      <User className="w-[16px] h-[16px] text-muted-foreground" />
                      <span style={{ fontSize: '14px' }}>프로필</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowSettings(true);
                      }}
                      className="w-full flex items-center gap-[12px] px-[16px] py-[10px] hover:bg-accent transition-colors"
                    >
                      <Settings className="w-[16px] h-[16px] text-muted-foreground" />
                      <span style={{ fontSize: '14px' }}>설정</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        // TODO: 테마 설정 열기
                      }}
                      className="w-full flex items-center gap-[12px] px-[16px] py-[10px] hover:bg-accent transition-colors"
                    >
                      <Palette className="w-[16px] h-[16px] text-muted-foreground" />
                      <span style={{ fontSize: '14px' }}>테마</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        // TODO: 플랜 페이지 열기
                      }}
                      className="w-full flex items-center gap-[12px] px-[16px] py-[10px] hover:bg-accent transition-colors"
                    >
                      <CreditCard className="w-[16px] h-[16px] text-muted-foreground" />
                      <span style={{ fontSize: '14px' }}>플랜</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        // TODO: 휴지통 페이지 열기
                      }}
                      className="w-full flex items-center gap-[12px] px-[16px] py-[10px] hover:bg-accent transition-colors"
                    >
                      <Trash2 className="w-[16px] h-[16px] text-muted-foreground" />
                      <span style={{ fontSize: '14px' }}>휴지통</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Toggle Button */}
          <button
            onClick={onToggle}
            className="w-[44px] h-[44px] flex items-center justify-center rounded-[8px] hover:bg-accent transition-colors"
          >
            <ChevronLeft className="w-[20px] h-[20px]" />
          </button>
        </div>

        {/* App Sheets Section */}
        <>
          {/* Header */}
          <div className="px-[16px] py-[12px] flex items-center justify-between">
            <h3 className="font-medium" style={{ fontSize: '16px' }}>앱시트</h3>
            <button 
              onClick={() => setShowAddSheet(true)}
              className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] hover:bg-accent transition-colors"
            >
              <Plus className="w-[16px] h-[16px]" />
            </button>
          </div>

          {/* Sheet List */}
          <div className="flex-1 overflow-y-auto px-[8px] flex flex-col gap-[4px]">
            {appSheets.map((sheet, index) => {
              const isLeftSelected = selectedSheets.left === sheet.name;
              const isRightSelected = selectedSheets.right === sheet.name;
              const isAnySelected = isLeftSelected || isRightSelected;
              const isFocused = (isLeftSelected && focusedSheet === 'left') || (isRightSelected && focusedSheet === 'right');
              const isDraggedOver = dragState.draggedOverId === sheet.id && dragState.isDragging;
              const isDragged = dragState.draggedId === sheet.id && dragState.isDragging;
              
              return (
                <div
                  key={sheet.id}
                  data-sheet-id={sheet.id}
                  onMouseDown={(e) => handleMouseDown(e, sheet)}
                  onMouseMove={handleMouseMove}
                  onMouseUp={(e) => handleMouseUp(e, sheet)}
                  onMouseEnter={() => handleMouseEnter(sheet.id)}
                  className={`flex items-center justify-between px-[16px] rounded-[12px] cursor-pointer transition-all ${
                    isDragged ? 'opacity-50 scale-95' : ''
                  } ${
                    isDraggedOver ? 'border-2 border-primary border-dashed' : ''
                  } ${
                    isFocused ? 'bg-primary/10' : 'hover:bg-accent'
                  }`}
                  style={{ height: '48px', minHeight: '48px' }}
                >
                  {/* Left: Sheet Name + Badge */}
                  <div className="flex items-center gap-[8px] flex-1 min-w-0">
                    {editingSheetId === sheet.id ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={saveEditing}
                        className="flex-1 bg-transparent border-b-2 border-primary font-medium outline-none"
                        style={{ fontSize: '15px' }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="font-medium" style={{ fontSize: '15px' }}>
                        {sheet.name}
                      </span>
                    )}
                    {sheet.isNew && (
                      <span 
                        className="px-[6px] py-[2px] bg-primary text-primary-foreground rounded-[4px] flex-shrink-0"
                        style={{ fontSize: '11px' }}
                      >
                        NEW
                      </span>
                    )}
                  </div>

                  {/* Right: Position Indicators - Fixed width to prevent layout shift */}
                  <div className="flex items-center justify-end flex-shrink-0" style={{ width: '24px', height: '24px' }}>
                    {isAnySelected && (
                      <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none"
                        className="text-primary"
                      >
                        {/* 왼쪽 화면 */}
                        <rect 
                          x="3" 
                          y="5" 
                          width="8" 
                          height="14" 
                          rx="2"
                          stroke="currentColor" 
                          strokeWidth="2"
                          strokeDasharray={isLeftSelected ? '0' : '3 3'}
                          fill={isLeftSelected ? 'currentColor' : 'none'}
                          fillOpacity={isLeftSelected ? '0.3' : '0'}
                        />
                        {/* 오른쪽 화면 */}
                        <rect 
                          x="13" 
                          y="5" 
                          width="8" 
                          height="14" 
                          rx="2"
                          stroke="currentColor" 
                          strokeWidth="2"
                          strokeDasharray={isRightSelected ? '0' : '3 3'}
                          fill={isRightSelected ? 'currentColor' : 'none'}
                          fillOpacity={isRightSelected ? '0.3' : '0'}
                        />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <SheetContextMenu
          sheetId={contextMenu.sheetId}
          sheetName={contextMenu.sheetName}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          onRename={() => {
            startEditing(contextMenu.sheetId, contextMenu.sheetName);
            setContextMenu(null);
          }}
          onDelete={() => {
            onDeleteSheet(contextMenu.sheetId);
            setContextMenu(null);
          }}
          onEdit={() => {
            onEditSheet(contextMenu.sheetName);
            setContextMenu(null);
          }}
        />
      )}

      {/* Settings Dialog */}
      {showSettings && (
        <div
          className="absolute inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm"
          onClick={() => {
            setShowSettings(false);
            setSettingsView(null);
          }}
        >
          {/* Dialog - 아이패드 화면 정중앙 고정 크기 */}
          <div
            className="bg-background rounded-[16px] border border-border shadow-xl overflow-hidden flex flex-col"
            style={{ width: '480px', height: '560px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-[24px] py-[20px] border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-[12px]">
                {settingsView && (
                  <button
                    onClick={() => setSettingsView(null)}
                    className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] hover:bg-accent transition-colors"
                  >
                    <ArrowLeft className="w-[18px] h-[18px]" />
                  </button>
                )}
                <h2 className="font-semibold" style={{ fontSize: '18px' }}>
                  {settingsView === 'language' && '언어'}
                  {settingsView === 'terms' && '이용약관'}
                  {settingsView === 'privacy' && '개인정보처리방침'}
                  {settingsView === 'version' && '버전정보'}
                  {settingsView === 'contact' && '문의하기'}
                  {settingsView === 'giftcode' && '선물티켓코드'}
                  {!settingsView && '설정'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowSettings(false);
                  setSettingsView(null);
                }}
                className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] hover:bg-accent transition-colors"
              >
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Main Settings List */}
              {!settingsView && (
                <div className="py-[8px]">
                  {settingsItems.map((item) => {
                    const Icon = item.icon;
                    const displayValue = item.id === 'language'
                      ? (selectedLanguage === 'ko' ? '한국어' : 'English')
                      : item.value;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSettingsView(item.id)}
                        className="w-full flex items-center justify-between px-[24px] py-[16px] hover:bg-accent transition-colors"
                        style={{ minHeight: '56px' }}
                      >
                        <div className="flex items-center gap-[16px]">
                          <Icon className="w-[20px] h-[20px] text-muted-foreground" />
                          <span className="font-medium" style={{ fontSize: '16px' }}>
                            {item.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-[8px]">
                          {displayValue && (
                            <span className="text-muted-foreground" style={{ fontSize: '14px' }}>
                              {displayValue}
                            </span>
                          )}
                          {item.hasArrow && (
                            <ChevronRight className="w-[16px] h-[16px] text-muted-foreground" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Language View */}
              {settingsView === 'language' && (
                <div className="py-[8px]">
                  <button
                    onClick={() => setSelectedLanguage('ko')}
                    className="w-full flex items-center justify-between px-[24px] py-[16px] hover:bg-accent transition-colors"
                    style={{ minHeight: '56px' }}
                  >
                    <span className="font-medium" style={{ fontSize: '16px' }}>한국어</span>
                    {selectedLanguage === 'ko' && (
                      <Check className="w-[20px] h-[20px] text-primary" />
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedLanguage('en')}
                    className="w-full flex items-center justify-between px-[24px] py-[16px] hover:bg-accent transition-colors"
                    style={{ minHeight: '56px' }}
                  >
                    <span className="font-medium" style={{ fontSize: '16px' }}>English</span>
                    {selectedLanguage === 'en' && (
                      <Check className="w-[20px] h-[20px] text-primary" />
                    )}
                  </button>
                </div>
              )}

              {/* Terms View */}
              {settingsView === 'terms' && (
                <div className="p-[24px]">
                  <div className="prose prose-sm" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    <h3 className="font-semibold mb-[16px]" style={{ fontSize: '16px' }}>서비스 이용약관</h3>
                    <p className="text-muted-foreground mb-[12px]">
                      본 약관은 Splee(이하 "서비스")의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                    </p>
                    <h4 className="font-medium mt-[20px] mb-[8px]" style={{ fontSize: '15px' }}>제1조 (목적)</h4>
                    <p className="text-muted-foreground mb-[12px]">
                      이 약관은 서비스가 제공하는 모든 서비스의 이용조건 및 절차에 관한 사항을 규정합니다.
                    </p>
                    <h4 className="font-medium mt-[20px] mb-[8px]" style={{ fontSize: '15px' }}>제2조 (용어의 정의)</h4>
                    <p className="text-muted-foreground mb-[12px]">
                      "서비스"란 회사가 제공하는 일정 관리 및 학습 계획 서비스를 의미합니다.
                    </p>
                    <h4 className="font-medium mt-[20px] mb-[8px]" style={{ fontSize: '15px' }}>제3조 (약관의 효력)</h4>
                    <p className="text-muted-foreground mb-[12px]">
                      본 약관은 서비스를 이용하고자 하는 모든 회원에게 적용됩니다.
                    </p>
                    <h4 className="font-medium mt-[20px] mb-[8px]" style={{ fontSize: '15px' }}>제4조 (서비스의 제공)</h4>
                    <p className="text-muted-foreground mb-[12px]">
                      회사는 연중무휴 24시간 서비스를 제공함을 원칙으로 합니다.
                    </p>
                  </div>
                </div>
              )}

              {/* Privacy View */}
              {settingsView === 'privacy' && (
                <div className="p-[24px]">
                  <div className="prose prose-sm" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    <h3 className="font-semibold mb-[16px]" style={{ fontSize: '16px' }}>개인정보처리방침</h3>
                    <p className="text-muted-foreground mb-[12px]">
                      Splee(이하 "서비스")는 이용자의 개인정보를 중요시하며, 개인정보 보호법을 준수하고 있습니다.
                    </p>
                    <h4 className="font-medium mt-[20px] mb-[8px]" style={{ fontSize: '15px' }}>1. 수집하는 개인정보 항목</h4>
                    <p className="text-muted-foreground mb-[12px]">
                      - 필수항목: 이메일 주소, 비밀번호, 닉네임<br />
                      - 선택항목: 프로필 사진, 학교/학년 정보
                    </p>
                    <h4 className="font-medium mt-[20px] mb-[8px]" style={{ fontSize: '15px' }}>2. 개인정보의 수집 및 이용목적</h4>
                    <p className="text-muted-foreground mb-[12px]">
                      - 회원 관리 및 서비스 제공<br />
                      - 서비스 개선 및 신규 서비스 개발<br />
                      - 고객 문의 응대
                    </p>
                    <h4 className="font-medium mt-[20px] mb-[8px]" style={{ fontSize: '15px' }}>3. 개인정보의 보유 및 이용기간</h4>
                    <p className="text-muted-foreground mb-[12px]">
                      회원 탈퇴 시 즉시 파기하며, 관계법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
                    </p>
                    <h4 className="font-medium mt-[20px] mb-[8px]" style={{ fontSize: '15px' }}>4. 개인정보의 제3자 제공</h4>
                    <p className="text-muted-foreground mb-[12px]">
                      원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
                    </p>
                  </div>
                </div>
              )}

              {/* Version View */}
              {settingsView === 'version' && (
                <div className="p-[24px]">
                  <div className="flex flex-col items-center py-[32px]">
                    <div className="w-[80px] h-[80px] bg-primary rounded-[20px] flex items-center justify-center mb-[20px]">
                      <span className="text-primary-foreground font-bold" style={{ fontSize: '32px' }}>S</span>
                    </div>
                    <h3 className="font-semibold mb-[8px]" style={{ fontSize: '20px' }}>Splee</h3>
                    <p className="text-muted-foreground mb-[24px]" style={{ fontSize: '14px' }}>버전 1.0.0</p>
                    <div className="w-full border-t border-border pt-[24px]">
                      <div className="flex justify-between py-[12px]">
                        <span className="text-muted-foreground" style={{ fontSize: '14px' }}>빌드 번호</span>
                        <span style={{ fontSize: '14px' }}>2024.01.23.001</span>
                      </div>
                      <div className="flex justify-between py-[12px]">
                        <span className="text-muted-foreground" style={{ fontSize: '14px' }}>최종 업데이트</span>
                        <span style={{ fontSize: '14px' }}>2024년 1월 23일</span>
                      </div>
                      <div className="flex justify-between py-[12px]">
                        <span className="text-muted-foreground" style={{ fontSize: '14px' }}>개발사</span>
                        <span style={{ fontSize: '14px' }}>Splee Inc.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact View */}
              {settingsView === 'contact' && (
                <div className="p-[24px]">
                  <p className="text-muted-foreground mb-[24px]" style={{ fontSize: '14px' }}>
                    서비스 이용 중 불편한 점이나 문의사항이 있으시면 아래 방법으로 연락해 주세요.
                  </p>
                  <div className="space-y-[16px]">
                    <a
                      href="mailto:support@splee.app"
                      className="flex items-center gap-[16px] p-[16px] rounded-[12px] border border-border hover:bg-accent transition-colors"
                    >
                      <div className="w-[44px] h-[44px] bg-primary/10 rounded-[12px] flex items-center justify-center">
                        <Mail className="w-[20px] h-[20px] text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium" style={{ fontSize: '15px' }}>이메일 문의</p>
                        <p className="text-muted-foreground" style={{ fontSize: '13px' }}>support@splee.app</p>
                      </div>
                      <ExternalLink className="w-[16px] h-[16px] text-muted-foreground" />
                    </a>
                    <a
                      href="https://splee.app/faq"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-[16px] p-[16px] rounded-[12px] border border-border hover:bg-accent transition-colors"
                    >
                      <div className="w-[44px] h-[44px] bg-primary/10 rounded-[12px] flex items-center justify-center">
                        <Info className="w-[20px] h-[20px] text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium" style={{ fontSize: '15px' }}>자주 묻는 질문</p>
                        <p className="text-muted-foreground" style={{ fontSize: '13px' }}>FAQ 페이지 바로가기</p>
                      </div>
                      <ExternalLink className="w-[16px] h-[16px] text-muted-foreground" />
                    </a>
                    <a
                      href="https://instagram.com/splee.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-[16px] p-[16px] rounded-[12px] border border-border hover:bg-accent transition-colors"
                    >
                      <div className="w-[44px] h-[44px] bg-primary/10 rounded-[12px] flex items-center justify-center">
                        <MessageCircle className="w-[20px] h-[20px] text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium" style={{ fontSize: '15px' }}>인스타그램</p>
                        <p className="text-muted-foreground" style={{ fontSize: '13px' }}>@splee.app</p>
                      </div>
                      <ExternalLink className="w-[16px] h-[16px] text-muted-foreground" />
                    </a>
                  </div>
                  <p className="text-muted-foreground mt-[24px] text-center" style={{ fontSize: '12px' }}>
                    운영시간: 평일 09:00 - 18:00 (주말/공휴일 제외)
                  </p>
                </div>
              )}

              {/* Gift Code View */}
              {settingsView === 'giftcode' && (
                <div className="p-[24px]">
                  <p className="text-muted-foreground mb-[24px]" style={{ fontSize: '14px' }}>
                    선물 받은 티켓 코드를 입력하여 프리미엄 기능을 이용해 보세요.
                  </p>
                  <div className="space-y-[16px]">
                    <div>
                      <label className="block mb-[8px] font-medium" style={{ fontSize: '14px' }}>
                        티켓 코드
                      </label>
                      <input
                        type="text"
                        value={giftCode}
                        onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                        placeholder="XXXX-XXXX-XXXX"
                        className="w-full h-[48px] px-[16px] rounded-[12px] border border-border bg-input-background font-mono tracking-wider text-center"
                        style={{ fontSize: '18px' }}
                        maxLength={14}
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (giftCode.length > 0) {
                          alert('코드가 등록되었습니다!');
                          setGiftCode('');
                        }
                      }}
                      disabled={giftCode.length === 0}
                      className="w-full h-[48px] rounded-[12px] bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontSize: '16px' }}
                    >
                      코드 등록
                    </button>
                  </div>
                  <div className="mt-[32px] p-[16px] rounded-[12px] bg-muted">
                    <h4 className="font-medium mb-[8px]" style={{ fontSize: '14px' }}>코드 입력 안내</h4>
                    <ul className="text-muted-foreground space-y-[4px]" style={{ fontSize: '13px' }}>
                      <li>• 코드는 대소문자를 구분하지 않습니다</li>
                      <li>• 하이픈(-)은 자동으로 입력됩니다</li>
                      <li>• 유효하지 않은 코드는 등록되지 않습니다</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
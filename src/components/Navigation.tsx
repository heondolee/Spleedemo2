import { Plus, ChevronLeft, ChevronRight, BookOpen, PanelLeft, Settings, Palette, CreditCard, Trash2, User } from 'lucide-react';
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
                        // TODO: 설정 페이지 열기
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
    </>
  );
}
import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  TimelineBlock,
  Subject,
  Todo,
  TIMELINE_START_HOUR,
  TIMELINE_TOTAL_HOURS,
  TIMELINE_START_MINUTES,
  TIMELINE_END_MINUTES,
  formatHourLabel,
} from './types';
import type { DragData } from './TasksWidget';

// window 타입 확장
declare global {
  interface Window {
    __todoDragData?: DragData | null;
    __todoDragPosition?: { x: number; y: number } | null;
    __todoDragActive?: boolean;
  }
}

interface TimelineWidgetProps {
  timelineBlocks: TimelineBlock[];
  subjects: Subject[];
  todos: Todo[];
  onAddBlock: (block: Omit<TimelineBlock, 'id'>) => TimelineBlock;
  onUpdateBlock: (id: string, updates: Partial<TimelineBlock>) => void;
  onDeleteBlock: (id: string) => void;
}

const ROW_HEIGHT = 24; // 1시간 = 24px (10분 = 4px)
const CELL_WIDTH = 20; // 10분당 너비
const BLOCK_HEIGHT = 20; // 블록 높이 (행 높이보다 살짝 작게)
const BLOCK_PADDING = (ROW_HEIGHT - BLOCK_HEIGHT) / 2; // 상하 여백 (가운데 정렬용)

export function TimelineWidget({
  timelineBlocks,
  subjects,
  todos,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
}: TimelineWidgetProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const planColumnRef = useRef<HTMLDivElement>(null);
  const doneColumnRef = useRef<HTMLDivElement>(null);
  const trashRef = useRef<HTMLDivElement>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);

  // 드래그 앤 드롭 프리뷰 상태
  const [dragPreview, setDragPreview] = useState<{
    startTime: number;
    color: string;
    type: 'plan' | 'done';
  } | null>(null);

  // Y 좌표를 분 단위로 변환하는 헬퍼 함수 (시간 단위로 스냅)
  const calcMinutesFromY = (localY: number): number => {
    // 시간 단위로 스냅 (60분 = 1시간)
    const hour = Math.round(localY / ROW_HEIGHT);
    const minutes = hour * 60 + TIMELINE_START_MINUTES;
    return Math.max(TIMELINE_START_MINUTES, Math.min(TIMELINE_END_MINUTES - 60, minutes));
  };

  // 터치 드래그 이벤트 리스너
  useEffect(() => {
    const handleTouchDragMove = (e: CustomEvent<{ x: number; y: number }>) => {
      const { x, y } = e.detail;
      const dragData = window.__todoDragData;
      if (!dragData) return;

      // Plan 열 위에 있는지 확인
      const planRect = planColumnRef.current?.getBoundingClientRect();
      if (planRect && x >= planRect.left && x <= planRect.right && y >= planRect.top && y <= planRect.bottom) {
        const localY = y - planRect.top;
        // 시간 단위로 스냅
        const hour = Math.round(localY / ROW_HEIGHT);
        const startTime = Math.max(TIMELINE_START_MINUTES, Math.min(TIMELINE_END_MINUTES - 60, hour * 60 + TIMELINE_START_MINUTES));
        setDragPreview({
          startTime,
          color: dragData.color,
          type: 'plan',
        });
        return;
      }

      // Done 열 위에 있는지 확인
      const doneRect = doneColumnRef.current?.getBoundingClientRect();
      if (doneRect && x >= doneRect.left && x <= doneRect.right && y >= doneRect.top && y <= doneRect.bottom) {
        const localY = y - doneRect.top;
        // 시간 단위로 스냅
        const hour = Math.round(localY / ROW_HEIGHT);
        const startTime = Math.max(TIMELINE_START_MINUTES, Math.min(TIMELINE_END_MINUTES - 60, hour * 60 + TIMELINE_START_MINUTES));
        setDragPreview({
          startTime,
          color: dragData.color,
          type: 'done',
        });
        return;
      }

      // 타임라인 밖이면 프리뷰 제거
      setDragPreview(null);
    };

    const handleTouchDrop = (e: CustomEvent<{ x: number; y: number }>) => {
      const { x, y } = e.detail;
      const dragData = window.__todoDragData;

      if (!dragData) {
        setDragPreview(null);
        return;
      }

      // Plan 열에 드롭
      const planRect = planColumnRef.current?.getBoundingClientRect();
      if (planRect && x >= planRect.left && x <= planRect.right && y >= planRect.top && y <= planRect.bottom) {
        const localY = y - planRect.top;
        const startTime = calcMinutesFromY(localY);
        const endTime = startTime + 60; // 1시간

        onAddBlock({
          todoId: dragData.todoId,
          subjectId: dragData.subjectId,
          startTime,
          endTime,
          type: 'plan',
          label: dragData.content,
          color: dragData.color,
          cellStart: 1, // 가운데 배치
          cellSpan: 4,
        });
        setDragPreview(null);
        return;
      }

      // Done 열에 드롭
      const doneRect = doneColumnRef.current?.getBoundingClientRect();
      if (doneRect && x >= doneRect.left && x <= doneRect.right && y >= doneRect.top && y <= doneRect.bottom) {
        const localY = y - doneRect.top;
        const startTime = calcMinutesFromY(localY);
        const endTime = startTime + 60; // 1시간

        onAddBlock({
          todoId: dragData.todoId,
          subjectId: dragData.subjectId,
          startTime,
          endTime,
          type: 'done',
          label: dragData.content,
          color: dragData.color,
          cellStart: 1, // 가운데 배치
          cellSpan: 4,
        });
        setDragPreview(null);
        return;
      }

      setDragPreview(null);
    };

    window.addEventListener('todoDragMove', handleTouchDragMove as EventListener);
    window.addEventListener('todoDrop', handleTouchDrop as EventListener);

    return () => {
      window.removeEventListener('todoDragMove', handleTouchDragMove as EventListener);
      window.removeEventListener('todoDrop', handleTouchDrop as EventListener);
    };
  }, [onAddBlock]);

  const dragStartRef = useRef<{ x: number; y: number; startTime: number; endTime: number; cellStart: number; cellSpan: number }>({
    x: 0,
    y: 0,
    startTime: 0,
    endTime: 0,
    cellStart: 0,
    cellSpan: 3,
  });

  const getSubjectColor = (subjectId: string | null) => {
    if (!subjectId) return '#86EFAC';
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.color || '#86EFAC';
  };

  const getTodoLabel = (todoId: string | null) => {
    if (!todoId) return '';
    const todo = todos.find(t => t.id === todoId);
    return todo?.content || '';
  };

  const minutesToY = (minutes: number): number => {
    return ((minutes - TIMELINE_START_MINUTES) / 10) * (ROW_HEIGHT / 6);
  };

  const yToMinutes = (y: number): number => {
    const scrollTop = scrollContainerRef.current?.scrollTop || 0;
    const adjustedY = y + scrollTop;
    const minutes = Math.round(adjustedY / (ROW_HEIGHT / 6)) * 10 + TIMELINE_START_MINUTES;
    return Math.max(TIMELINE_START_MINUTES, Math.min(TIMELINE_END_MINUTES, minutes));
  };

  // 열 클릭 시 선택 해제
  const handleColumnClick = useCallback((_e: React.MouseEvent, _type: 'plan' | 'done') => {
    setSelectedBlockId(null);
  }, []);

  // 드래그 오버 핸들러
  const handleDragOver = useCallback((e: React.DragEvent, type: 'plan' | 'done') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    // 시간 단위로 스냅
    const hour = Math.round(y / ROW_HEIGHT);
    const startTime = Math.max(TIMELINE_START_MINUTES, Math.min(TIMELINE_END_MINUTES - 60, hour * 60 + TIMELINE_START_MINUTES));

    // 전역 드래그 데이터에서 색상 가져오기
    const dragData = window.__todoDragData;
    if (dragData) {
      setDragPreview({
        startTime,
        color: dragData.color,
        type,
      });
    }
  }, []);

  // 드래그 엔터 핸들러
  const handleDragEnter = useCallback((e: React.DragEvent, type: 'plan' | 'done') => {
    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    // 시간 단위로 스냅
    const hour = Math.round(y / ROW_HEIGHT);
    const startTime = Math.max(TIMELINE_START_MINUTES, Math.min(TIMELINE_END_MINUTES - 60, hour * 60 + TIMELINE_START_MINUTES));

    // 전역 드래그 데이터에서 색상 가져오기
    const dragData = window.__todoDragData;
    if (dragData) {
      setDragPreview({
        startTime,
        color: dragData.color,
        type,
      });
    }
  }, []);

  // 드래그 리브 핸들러
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // 자식 요소로 이동할 때는 무시
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (e.currentTarget.contains(relatedTarget)) return;

    setDragPreview(null);
  }, []);

  // 드롭 핸들러
  const handleDrop = useCallback((e: React.DragEvent, type: 'plan' | 'done') => {
    e.preventDefault();
    setDragPreview(null);

    try {
      let data: DragData | null = window.__todoDragData || null;

      // dataTransfer에서도 시도
      const jsonData = e.dataTransfer.getData('application/json');
      if (jsonData) {
        data = JSON.parse(jsonData);
      }

      if (!data) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      // 시간 단위로 스냅
      const hour = Math.round(y / ROW_HEIGHT);
      const startTime = Math.max(TIMELINE_START_MINUTES, Math.min(TIMELINE_END_MINUTES - 60, hour * 60 + TIMELINE_START_MINUTES));
      const endTime = startTime + 60; // 1시간

      onAddBlock({
        todoId: data.todoId,
        subjectId: data.subjectId,
        startTime,
        endTime,
        type,
        label: data.content,
        color: data.color,
        cellStart: 1, // 가운데 배치
        cellSpan: 4,
      });
    } catch {
      // 무시
    }
  }, [onAddBlock]);

  const handleBlockMouseDown = useCallback((
    e: React.MouseEvent,
    block: TimelineBlock
  ) => {
    e.preventDefault();
    e.stopPropagation();

    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
    setActiveBlockId(block.id);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startTime: block.startTime,
      endTime: block.endTime,
      cellStart: block.cellStart ?? 1,
      cellSpan: block.cellSpan ?? 4,
    };

    let hasMoved = false;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStartRef.current.x;
      const deltaY = moveEvent.clientY - dragStartRef.current.y;

      // 5px 이상 움직이면 드래그로 판단
      if (!hasMoved && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
        hasMoved = true;
        setIsDragging(true);
        setShowTrash(true);
      }

      if (!hasMoved) return;

      // 휴지통 위에 있는지 확인
      const trashRect = trashRef.current?.getBoundingClientRect();
      if (trashRect) {
        const isOver = moveEvent.clientX >= trashRect.left &&
                       moveEvent.clientX <= trashRect.right &&
                       moveEvent.clientY >= trashRect.top &&
                       moveEvent.clientY <= trashRect.bottom;
        setIsOverTrash(isOver);
      }

      // 세로 이동 (시간 단위로 스냅)
      const deltaHours = Math.round(deltaY / ROW_HEIGHT);
      const startHour = Math.floor((dragStartRef.current.startTime - TIMELINE_START_MINUTES) / 60);
      let newHour = startHour + deltaHours;
      newHour = Math.max(0, Math.min(TIMELINE_TOTAL_HOURS - 1, newHour));
      const newStart = newHour * 60 + TIMELINE_START_MINUTES;
      const newEnd = newStart + 60;

      // 가로 이동
      const deltaCells = Math.round(deltaX / CELL_WIDTH);
      const currentSpan = dragStartRef.current.cellSpan;
      let newCellStart = dragStartRef.current.cellStart + deltaCells;
      newCellStart = Math.max(0, Math.min(6 - currentSpan, newCellStart));

      onUpdateBlock(block.id, { startTime: newStart, endTime: newEnd, cellStart: newCellStart });
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      // 휴지통 위에서 놓으면 삭제
      const trashRect = trashRef.current?.getBoundingClientRect();
      if (trashRect && hasMoved) {
        const isOver = upEvent.clientX >= trashRect.left &&
                       upEvent.clientX <= trashRect.right &&
                       upEvent.clientY >= trashRect.top &&
                       upEvent.clientY <= trashRect.bottom;
        if (isOver) {
          onDeleteBlock(block.id);
          setSelectedBlockId(null);
        }
      }

      // 움직이지 않았으면 클릭으로 처리 (선택/선택해제)
      if (!hasMoved) {
        setSelectedBlockId(prev => prev === block.id ? null : block.id);
      }

      setIsDragging(false);
      setIsResizing(null);
      setActiveBlockId(null);
      setShowTrash(false);
      setIsOverTrash(false);
      mouseDownPosRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onUpdateBlock, onDeleteBlock]);


  // 가로 리사이즈 핸들러
  const handleResizeMouseDown = useCallback((
    e: React.MouseEvent,
    block: TimelineBlock,
    direction: 'left' | 'right'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setActiveBlockId(block.id);
    setIsResizing(direction);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startTime: block.startTime,
      endTime: block.endTime,
      cellStart: block.cellStart ?? 1,
      cellSpan: block.cellSpan ?? 4,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStartRef.current.x;
      const deltaCells = Math.round(deltaX / CELL_WIDTH);

      if (direction === 'left') {
        // 왼쪽 리사이즈: cellStart 변경, cellSpan 조절
        const currentEnd = dragStartRef.current.cellStart + dragStartRef.current.cellSpan;
        let newCellStart = dragStartRef.current.cellStart + deltaCells;
        newCellStart = Math.max(0, Math.min(currentEnd - 1, newCellStart));
        const newCellSpan = currentEnd - newCellStart;
        onUpdateBlock(block.id, { cellStart: newCellStart, cellSpan: newCellSpan });
      } else {
        // 오른쪽 리사이즈: cellSpan 변경
        let newCellSpan = dragStartRef.current.cellSpan + deltaCells;
        const currentStart = dragStartRef.current.cellStart;
        newCellSpan = Math.max(1, Math.min(6 - currentStart, newCellSpan));
        onUpdateBlock(block.id, { cellSpan: newCellSpan });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(null);
      setActiveBlockId(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onUpdateBlock]);

  const planBlocks = timelineBlocks.filter(b => b.type === 'plan');
  const doneBlocks = timelineBlocks.filter(b => b.type === 'done');

  // 시간 배열 (6~23, 0~3 = 다음날)
  const hours = Array.from({ length: TIMELINE_TOTAL_HOURS }, (_, i) => {
    return (TIMELINE_START_HOUR + i) % 24;
  });

  const totalHeight = TIMELINE_TOTAL_HOURS * ROW_HEIGHT;

  const renderBlocks = (blocks: TimelineBlock[]) => {
    return blocks.map(block => {
      // 시간 기준으로 행 위치 계산 (시간 단위로 스냅)
      const hourIndex = Math.floor((block.startTime - TIMELINE_START_MINUTES) / 60);
      const top = hourIndex * ROW_HEIGHT + BLOCK_PADDING; // 행 가운데 정렬
      const isActive = activeBlockId === block.id;
      const isSelected = selectedBlockId === block.id;
      // 블록 자체 색상 우선, 없으면 과목 색상 사용
      const color = block.color || getSubjectColor(block.subjectId);
      // 가운데 배치 (cellStart=1, cellSpan=4)
      const cellStart = block.cellStart ?? 1;
      const cellSpan = block.cellSpan ?? 4;
      const left = cellStart * CELL_WIDTH + 1;
      const width = cellSpan * CELL_WIDTH - 2;

      return (
        <div
          key={block.id}
          className={`absolute rounded-[4px] cursor-move transition-shadow ${
            isActive ? 'shadow-md z-20' : isSelected ? 'shadow-lg z-30' : 'hover:shadow-sm z-10'
          }`}
          style={{
            top: `${top}px`,
            left: `${left}px`,
            width: `${width}px`,
            height: `${BLOCK_HEIGHT}px`,
            backgroundColor: color,
            opacity: isActive && isOverTrash ? 0.5 : 1,
            outline: isSelected ? '2px solid #2563EB' : 'none',
            outlineOffset: '1px',
          }}
          onMouseDown={(e) => handleBlockMouseDown(e, block)}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 라벨 */}
          <div className="absolute inset-x-[4px] top-[2px] bottom-[2px] overflow-hidden flex items-center pointer-events-none">
            <span className="text-[10px] text-white font-medium truncate block text-left">
              {block.label || getTodoLabel(block.todoId)}
            </span>
          </div>

          {/* 선택 시 가로 리사이즈 핸들 표시 - [ ] 대괄호 모양 */}
          {isSelected && (
            <>
              {/* 왼쪽 리사이즈 핸들 [ */}
              <div
                className="absolute cursor-ew-resize"
                style={{
                  left: '-6px',
                  top: '0px',
                  bottom: '0px',
                  width: '6px',
                  borderLeft: '3px solid #2563EB',
                  borderTop: '3px solid #2563EB',
                  borderBottom: '3px solid #2563EB',
                  borderRadius: '3px 0 0 3px',
                  zIndex: 100,
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleResizeMouseDown(e, block, 'left');
                }}
              />
              {/* 오른쪽 리사이즈 핸들 ] */}
              <div
                className="absolute cursor-ew-resize"
                style={{
                  right: '-6px',
                  top: '0px',
                  bottom: '0px',
                  width: '6px',
                  borderRight: '3px solid #2563EB',
                  borderTop: '3px solid #2563EB',
                  borderBottom: '3px solid #2563EB',
                  borderRadius: '0 3px 3px 0',
                  zIndex: 100,
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleResizeMouseDown(e, block, 'right');
                }}
              />
              {/* 삭제 버튼 - 블록 아래 중앙 */}
              <div
                className="absolute cursor-pointer flex items-center justify-center bg-red-500 hover:bg-red-600 transition-colors"
                style={{
                  width: `${Math.round(BLOCK_HEIGHT * 2 / 3)}px`,
                  height: `${Math.round(BLOCK_HEIGHT * 2 / 3)}px`,
                  borderRadius: '50%',
                  bottom: `-${Math.round(BLOCK_HEIGHT * 2 / 3) + 4}px`,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 100,
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDeleteBlock(block.id);
                  setSelectedBlockId(null);
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  width={Math.round(BLOCK_HEIGHT * 2 / 3 * 0.6)}
                  height={Math.round(BLOCK_HEIGHT * 2 / 3 * 0.6)}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
            </>
          )}
        </div>
      );
    });
  };

  // 격자 셀 렌더링 (가로선 + 세로선)
  const renderGrid = () => {
    const lines: React.ReactNode[] = [];

    // 가로선 (시간별)
    for (let i = 0; i < hours.length; i++) {
      lines.push(
        <div
          key={`hline-${i}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${(i + 1) * ROW_HEIGHT}px`,
            height: '1px',
            backgroundColor: 'rgba(128, 128, 128, 0.3)',
          }}
        />
      );
    }

    // 세로선 (10분 단위)
    for (let j = 1; j <= 5; j++) {
      lines.push(
        <div
          key={`vline-${j}`}
          style={{
            position: 'absolute',
            top: 0,
            left: `${j * CELL_WIDTH}px`,
            width: '1px',
            height: `${totalHeight}px`,
            backgroundColor: 'rgba(128, 128, 128, 0.3)',
          }}
        />
      );
    }

    return <>{lines}</>;
  };

  return (
    <div className="bg-card border border-border rounded-[12px] flex flex-col overflow-hidden relative">
      {/* 헤더 */}
      <div className="flex border-b border-border flex-shrink-0 relative">
        {/* Plan 헤더 */}
        <div className="relative flex-shrink-0" style={{ width: `${6 * CELL_WIDTH}px`, minWidth: `${6 * CELL_WIDTH}px` }}>
          <div className="flex">
            {[10, 20, 30, 40, 50, 60].map((min) => (
              <div
                key={`plan-${min}`}
                className="text-left text-[10px] text-muted-foreground py-[6px] pl-[2px] flex-shrink-0"
                style={{ width: `${CELL_WIDTH}px`, minWidth: `${CELL_WIDTH}px` }}
              >
                {min}
              </div>
            ))}
          </div>
          {/* 헤더 세로선 */}
          {[1, 2, 3, 4, 5].map(j => (
            <div
              key={`plan-hline-${j}`}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${j * CELL_WIDTH}px`,
                width: '1px',
                backgroundColor: 'rgba(128, 128, 128, 0.3)',
              }}
            />
          ))}
        </div>
        {/* Time 헤더 (빈칸) */}
        <div className="flex-shrink-0" style={{ width: '32px', minWidth: '32px' }} />
        {/* Done 헤더 */}
        <div className="relative flex-shrink-0" style={{ width: `${6 * CELL_WIDTH}px`, minWidth: `${6 * CELL_WIDTH}px` }}>
          <div className="flex">
            {[10, 20, 30, 40, 50, 60].map((min) => (
              <div
                key={`done-${min}`}
                className="text-left text-[10px] text-muted-foreground py-[6px] pl-[2px] flex-shrink-0"
                style={{ width: `${CELL_WIDTH}px`, minWidth: `${CELL_WIDTH}px` }}
              >
                {min}
              </div>
            ))}
          </div>
          {/* 헤더 세로선 */}
          {[1, 2, 3, 4, 5].map(j => (
            <div
              key={`done-hline-${j}`}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${j * CELL_WIDTH}px`,
                width: '1px',
                backgroundColor: 'rgba(128, 128, 128, 0.3)',
              }}
            />
          ))}
        </div>
        {/* 열 구분선 (Plan|Time, Time|Done) */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${6 * CELL_WIDTH}px`, width: '1px', backgroundColor: 'rgba(128, 128, 128, 0.5)' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${6 * CELL_WIDTH + 32}px`, width: '1px', backgroundColor: 'rgba(128, 128, 128, 0.5)' }} />
      </div>

      {/* 타임라인 본체 */}
      <div
        ref={scrollContainerRef}
        className="overflow-hidden"
      >
        <div className="flex relative" style={{ height: `${totalHeight}px` }}>
          {/* Plan 열 */}
          <div
            ref={planColumnRef}
            className="relative flex-shrink-0"
            style={{ width: `${6 * CELL_WIDTH}px`, minWidth: `${6 * CELL_WIDTH}px` }}
            onClick={(e) => handleColumnClick(e, 'plan')}
            onDragOver={(e) => handleDragOver(e, 'plan')}
            onDragEnter={(e) => handleDragEnter(e, 'plan')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'plan')}
          >
            {renderGrid()}
            {renderBlocks(planBlocks)}
            {/* 드래그 프리뷰 - 행 가운데 배치 */}
            {dragPreview && dragPreview.type === 'plan' && (() => {
              const hourIndex = Math.floor((dragPreview.startTime - TIMELINE_START_MINUTES) / 60);
              const top = hourIndex * ROW_HEIGHT + BLOCK_PADDING;
              return (
                <div
                  className="absolute rounded-[4px] pointer-events-none opacity-60"
                  style={{
                    top: `${top}px`,
                    left: `${1 * CELL_WIDTH + 1}px`,
                    width: `${4 * CELL_WIDTH - 2}px`,
                    height: `${BLOCK_HEIGHT}px`,
                    backgroundColor: dragPreview.color,
                  }}
                />
              );
            })()}
          </div>

          {/* Time 열 */}
          <div
            className="relative bg-accent/20 flex-shrink-0 overflow-hidden"
            style={{ width: '32px', minWidth: '32px', maxWidth: '32px' }}
          >
            {hours.map((hour, i) => (
              <div
                key={`time-${i}`}
                className="flex items-center justify-center"
                style={{ height: `${ROW_HEIGHT}px` }}
              >
                <span className="text-[11px] text-muted-foreground">
                  {formatHourLabel(hour)}
                </span>
              </div>
            ))}
            {/* Time 열 가로선 */}
            {hours.map((_, i) => (
              <div
                key={`time-hline-${i}`}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: `${(i + 1) * ROW_HEIGHT}px`,
                  height: '1px',
                  backgroundColor: 'rgba(128, 128, 128, 0.3)',
                }}
              />
            ))}
          </div>

          {/* Done 열 */}
          <div
            ref={doneColumnRef}
            className="relative flex-shrink-0"
            style={{ width: `${6 * CELL_WIDTH}px`, minWidth: `${6 * CELL_WIDTH}px` }}
            onClick={(e) => handleColumnClick(e, 'done')}
            onDragOver={(e) => handleDragOver(e, 'done')}
            onDragEnter={(e) => handleDragEnter(e, 'done')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'done')}
          >
            {renderGrid()}
            {renderBlocks(doneBlocks)}
            {/* 드래그 프리뷰 - 행 가운데 배치 */}
            {dragPreview && dragPreview.type === 'done' && (() => {
              const hourIndex = Math.floor((dragPreview.startTime - TIMELINE_START_MINUTES) / 60);
              const top = hourIndex * ROW_HEIGHT + BLOCK_PADDING;
              return (
                <div
                  className="absolute rounded-[4px] pointer-events-none opacity-60"
                  style={{
                    top: `${top}px`,
                    left: `${1 * CELL_WIDTH + 1}px`,
                    width: `${4 * CELL_WIDTH - 2}px`,
                    height: `${BLOCK_HEIGHT}px`,
                    backgroundColor: dragPreview.color,
                  }}
                />
              );
            })()}
          </div>

          {/* 열 구분선 (Plan|Time, Time|Done) */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${6 * CELL_WIDTH}px`, width: '1px', backgroundColor: 'rgba(128, 128, 128, 0.5)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${6 * CELL_WIDTH + 32}px`, width: '1px', backgroundColor: 'rgba(128, 128, 128, 0.5)', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* 휴지통 아이콘 - 블록 드래그 시 표시 (Portal로 body에 렌더링) */}
      {showTrash && createPortal(
        <div
          ref={trashRef}
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 w-[56px] h-[56px] rounded-full flex items-center justify-center transition-all ${
            isOverTrash
              ? 'bg-red-500 scale-125'
              : 'bg-gray-300 dark:bg-gray-600'
          }`}
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 9999 }}
        >
          <svg
            className={`w-7 h-7 ${isOverTrash ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>,
        document.body
      )}
    </div>
  );
}

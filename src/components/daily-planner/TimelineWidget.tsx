import { useState, useRef, useCallback, useEffect } from 'react';
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
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<'top' | 'bottom' | null>(null);

  // 드래그 앤 드롭 프리뷰 상태
  const [dragPreview, setDragPreview] = useState<{
    startTime: number;
    color: string;
    type: 'plan' | 'done';
  } | null>(null);

  // Y 좌표를 분 단위로 변환하는 헬퍼 함수
  const calcMinutesFromY = (localY: number): number => {
    const minutes = Math.round(localY / (ROW_HEIGHT / 6)) * 10 + TIMELINE_START_MINUTES;
    return Math.max(TIMELINE_START_MINUTES, Math.min(TIMELINE_END_MINUTES, minutes));
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
        const startTime = calcMinutesFromY(localY);
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
        const startTime = calcMinutesFromY(localY);
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
        const endTime = Math.min(startTime + 30, TIMELINE_END_MINUTES);

        onAddBlock({
          todoId: dragData.todoId,
          subjectId: dragData.subjectId,
          startTime,
          endTime,
          type: 'plan',
          label: dragData.content,
          color: dragData.color,
        });
        setDragPreview(null);
        return;
      }

      // Done 열에 드롭
      const doneRect = doneColumnRef.current?.getBoundingClientRect();
      if (doneRect && x >= doneRect.left && x <= doneRect.right && y >= doneRect.top && y <= doneRect.bottom) {
        const localY = y - doneRect.top;
        const startTime = calcMinutesFromY(localY);
        const endTime = Math.min(startTime + 30, TIMELINE_END_MINUTES);

        onAddBlock({
          todoId: dragData.todoId,
          subjectId: dragData.subjectId,
          startTime,
          endTime,
          type: 'done',
          label: dragData.content,
          color: dragData.color,
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

  const dragStartRef = useRef<{ y: number; startTime: number; endTime: number }>({
    y: 0,
    startTime: 0,
    endTime: 0,
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

  const handleColumnClick = useCallback((e: React.MouseEvent, type: 'plan' | 'done') => {
    if (isDragging || isResizing) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const startTime = yToMinutes(y);
    const endTime = Math.min(startTime + 60, TIMELINE_END_MINUTES);

    onAddBlock({
      todoId: null,
      subjectId: null,
      startTime,
      endTime,
      type,
    });
  }, [isDragging, isResizing, onAddBlock]);

  // 드래그 오버 핸들러
  const handleDragOver = useCallback((e: React.DragEvent, type: 'plan' | 'done') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const startTime = yToMinutes(y);

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
    const startTime = yToMinutes(y);

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
      const startTime = yToMinutes(y);
      const endTime = Math.min(startTime + 30, TIMELINE_END_MINUTES); // 30분 = 3칸

      onAddBlock({
        todoId: data.todoId,
        subjectId: data.subjectId,
        startTime,
        endTime,
        type,
        label: data.content,
        color: data.color,
      });
    } catch {
      // 무시
    }
  }, [onAddBlock]);

  const handleBlockMouseDown = useCallback((
    e: React.MouseEvent,
    block: TimelineBlock,
    action: 'move' | 'top' | 'bottom'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setActiveBlockId(block.id);
    dragStartRef.current = {
      y: e.clientY,
      startTime: block.startTime,
      endTime: block.endTime,
    };

    if (action === 'move') {
      setIsDragging(true);
    } else {
      setIsResizing(action);
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - dragStartRef.current.y;
      const deltaMinutes = Math.round(deltaY / (ROW_HEIGHT / 6)) * 10;

      if (action === 'move') {
        const duration = dragStartRef.current.endTime - dragStartRef.current.startTime;
        let newStart = dragStartRef.current.startTime + deltaMinutes;
        let newEnd = newStart + duration;

        if (newStart < TIMELINE_START_MINUTES) {
          newStart = TIMELINE_START_MINUTES;
          newEnd = newStart + duration;
        }
        if (newEnd > TIMELINE_END_MINUTES) {
          newEnd = TIMELINE_END_MINUTES;
          newStart = newEnd - duration;
        }

        onUpdateBlock(block.id, { startTime: newStart, endTime: newEnd });
      } else if (action === 'top') {
        const newStart = Math.max(
          TIMELINE_START_MINUTES,
          Math.min(dragStartRef.current.startTime + deltaMinutes, block.endTime - 10)
        );
        onUpdateBlock(block.id, { startTime: newStart });
      } else if (action === 'bottom') {
        const newEnd = Math.min(
          TIMELINE_END_MINUTES,
          Math.max(dragStartRef.current.endTime + deltaMinutes, block.startTime + 10)
        );
        onUpdateBlock(block.id, { endTime: newEnd });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
      setActiveBlockId(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onUpdateBlock]);

  const handleBlockDelete = (e: React.MouseEvent, blockId: string) => {
    e.stopPropagation();
    onDeleteBlock(blockId);
  };

  const planBlocks = timelineBlocks.filter(b => b.type === 'plan');
  const doneBlocks = timelineBlocks.filter(b => b.type === 'done');

  // 시간 배열 (6~23, 0~3 = 다음날)
  const hours = Array.from({ length: TIMELINE_TOTAL_HOURS }, (_, i) => {
    return (TIMELINE_START_HOUR + i) % 24;
  });

  const totalHeight = TIMELINE_TOTAL_HOURS * ROW_HEIGHT;

  const renderBlocks = (blocks: TimelineBlock[]) => {
    return blocks.map(block => {
      const top = minutesToY(block.startTime);
      const height = minutesToY(block.endTime) - top;
      const isActive = activeBlockId === block.id;
      // 블록 자체 색상 우선, 없으면 과목 색상 사용
      const color = block.color || getSubjectColor(block.subjectId);

      return (
        <div
          key={block.id}
          className={`absolute rounded-[4px] cursor-move transition-shadow group ${
            isActive ? 'shadow-md z-20' : 'hover:shadow-sm z-10'
          }`}
          style={{
            top: `${top}px`,
            left: '2px',
            width: `${3 * CELL_WIDTH - 4}px`, // 3칸 = 60px - 4px 여백
            height: `${Math.max(height, 4)}px`,
            backgroundColor: color,
          }}
          onMouseDown={(e) => handleBlockMouseDown(e, block, 'move')}
          onDoubleClick={(e) => handleBlockDelete(e, block.id)}
        >
          {/* 상단 리사이즈 */}
          <div
            className="absolute top-0 left-0 right-0 h-[6px] cursor-n-resize"
            onMouseDown={(e) => handleBlockMouseDown(e, block, 'top')}
          />
          {/* 라벨 */}
          {height > 16 && (
            <div className="absolute inset-x-[2px] top-[2px] bottom-[2px] overflow-hidden">
              <span className="text-[10px] text-white font-medium truncate block text-left">
                {block.label || getTodoLabel(block.todoId)}
              </span>
            </div>
          )}
          {/* 하단 리사이즈 */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[6px] cursor-s-resize"
            onMouseDown={(e) => handleBlockMouseDown(e, block, 'bottom')}
          />
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
    <div className="bg-card border border-border rounded-[12px] flex flex-col overflow-hidden">
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
            {/* 드래그 프리뷰 */}
            {dragPreview && dragPreview.type === 'plan' && (
              <div
                className="absolute left-[2px] right-[2px] rounded-[4px] pointer-events-none opacity-60"
                style={{
                  top: `${minutesToY(dragPreview.startTime)}px`,
                  height: `${minutesToY(dragPreview.startTime + 30) - minutesToY(dragPreview.startTime)}px`,
                  backgroundColor: dragPreview.color,
                }}
              />
            )}
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
            {/* 드래그 프리뷰 */}
            {dragPreview && dragPreview.type === 'done' && (
              <div
                className="absolute left-[2px] right-[2px] rounded-[4px] pointer-events-none opacity-60"
                style={{
                  top: `${minutesToY(dragPreview.startTime)}px`,
                  height: `${minutesToY(dragPreview.startTime + 30) - minutesToY(dragPreview.startTime)}px`,
                  backgroundColor: dragPreview.color,
                }}
              />
            )}
          </div>

          {/* 열 구분선 (Plan|Time, Time|Done) */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${6 * CELL_WIDTH}px`, width: '1px', backgroundColor: 'rgba(128, 128, 128, 0.5)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${6 * CELL_WIDTH + 32}px`, width: '1px', backgroundColor: 'rgba(128, 128, 128, 0.5)', pointerEvents: 'none' }} />
        </div>
      </div>
    </div>
  );
}

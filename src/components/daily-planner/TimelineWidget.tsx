import { useState, useRef, useCallback } from 'react';
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
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<'top' | 'bottom' | null>(null);

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

      return (
        <div
          key={block.id}
          className={`absolute left-[2px] right-[2px] rounded-[4px] cursor-move transition-shadow group ${
            isActive ? 'shadow-md z-10' : 'hover:shadow-sm'
          }`}
          style={{
            top: `${top}px`,
            height: `${Math.max(height, 4)}px`,
            backgroundColor: getSubjectColor(block.subjectId),
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
    return (
      <>
        {/* 가로선 (시간별) */}
        {hours.map((_, i) => (
          <div
            key={`hline-${i}`}
            className="absolute left-0 right-0 border-b border-border/30"
            style={{ top: `${(i + 1) * ROW_HEIGHT - 1}px` }}
          />
        ))}
        {/* 세로선 (10분 단위) */}
        {[1, 2, 3, 4, 5].map(j => (
          <div
            key={`vline-${j}`}
            className="absolute top-0 bottom-0 border-l border-border/30"
            style={{ left: `${j * CELL_WIDTH}px` }}
          />
        ))}
      </>
    );
  };

  return (
    <div className="bg-card border border-border rounded-[12px] flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="flex border-b border-border flex-shrink-0">
        {/* Plan 헤더 */}
        <div className="border-r border-border" style={{ width: `${6 * CELL_WIDTH}px` }}>
          <div className="flex">
            {[10, 20, 30, 40, 50, 60].map((min, i) => (
              <div
                key={`plan-${min}`}
                className={`flex-1 text-left text-[10px] text-muted-foreground py-[6px] pl-[2px] ${
                  i < 5 ? 'border-r border-border/30' : ''
                }`}
              >
                {min}
              </div>
            ))}
          </div>
        </div>
        {/* Time 헤더 (빈칸) */}
        <div className="border-r border-border" style={{ width: '32px' }} />
        {/* Done 헤더 */}
        <div style={{ width: `${6 * CELL_WIDTH}px` }}>
          <div className="flex">
            {[10, 20, 30, 40, 50, 60].map((min, i) => (
              <div
                key={`done-${min}`}
                className={`flex-1 text-left text-[10px] text-muted-foreground py-[6px] pl-[2px] ${
                  i < 5 ? 'border-r border-border/30' : ''
                }`}
              >
                {min}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 타임라인 본체 */}
      <div
        ref={scrollContainerRef}
        className="overflow-y-auto overflow-x-hidden"
      >
        <div className="flex relative" style={{ height: `${totalHeight}px` }}>
          {/* Plan 열 */}
          <div
            className="relative border-r border-border"
            style={{ width: `${6 * CELL_WIDTH}px` }}
            onClick={(e) => handleColumnClick(e, 'plan')}
          >
            {renderGrid()}
            {renderBlocks(planBlocks)}
          </div>

          {/* Time 열 */}
          <div
            className="relative border-r border-border bg-accent/20"
            style={{ width: '32px' }}
          >
            {hours.map((hour, i) => (
              <div
                key={`time-${i}`}
                className="flex items-center justify-center border-b border-border/30"
                style={{ height: `${ROW_HEIGHT}px` }}
              >
                <span className="text-[11px] text-muted-foreground">
                  {formatHourLabel(hour)}
                </span>
              </div>
            ))}
          </div>

          {/* Done 열 */}
          <div
            className="relative"
            style={{ width: `${6 * CELL_WIDTH}px` }}
            onClick={(e) => handleColumnClick(e, 'done')}
          >
            {renderGrid()}
            {renderBlocks(doneBlocks)}
          </div>
        </div>
      </div>
    </div>
  );
}

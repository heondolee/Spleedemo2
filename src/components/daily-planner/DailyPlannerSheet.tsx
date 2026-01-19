import { useDailyPlannerState } from './useDailyPlannerState';
import { HeaderWidgets } from './HeaderWidgets';
import { TasksWidget } from './TasksWidget';
import { TimelineWidget } from './TimelineWidget';

interface DailyPlannerSheetProps {
  initialDate?: string;
}

// Timeline 너비: Plan(6*20) + Time(32) + Done(6*20) = 272px
const TIMELINE_WIDTH = 272;

export function DailyPlannerSheet({ initialDate }: DailyPlannerSheetProps) {
  const {
    data,
    currentDate,
    changeDate,
    updateDailyInfo,
    addSubject,
    updateSubject,
    deleteSubject,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodoComplete,
    addTimelineBlock,
    updateTimelineBlock,
    deleteTimelineBlock,
  } = useDailyPlannerState(initialDate);

  return (
    <div className="flex flex-col bg-background h-full overflow-y-auto">
      {/* 상단 위젯들: DAY / D-DAY / 공부시간 + COMMENT */}
      <HeaderWidgets
        dailyInfo={data.dailyInfo}
        timelineBlocks={data.timelineBlocks}
        onUpdateDailyInfo={updateDailyInfo}
        onDateChange={changeDate}
      />

      {/* 하단 메인 영역: TASKS + TIMELINE */}
      <div className="flex gap-[8px] px-[12px] pb-[12px] items-start">
        {/* TASKS 위젯 - 남은 공간 사용 */}
        <div className="flex-1 min-w-0">
          <TasksWidget
            subjects={data.subjects}
            todos={data.todos}
            onAddSubject={addSubject}
            onUpdateSubject={updateSubject}
            onDeleteSubject={deleteSubject}
            onAddTodo={addTodo}
            onUpdateTodo={updateTodo}
            onDeleteTodo={deleteTodo}
            onToggleTodo={toggleTodoComplete}
          />
        </div>

        {/* TIMELINE 위젯 - 고정 너비, 오른쪽 정렬 */}
        <div className="flex-shrink-0" style={{ width: `${TIMELINE_WIDTH}px` }}>
          <TimelineWidget
            timelineBlocks={data.timelineBlocks}
            subjects={data.subjects}
            todos={data.todos}
            onAddBlock={addTimelineBlock}
            onUpdateBlock={updateTimelineBlock}
            onDeleteBlock={deleteTimelineBlock}
          />
        </div>
      </div>
    </div>
  );
}

export default DailyPlannerSheet;

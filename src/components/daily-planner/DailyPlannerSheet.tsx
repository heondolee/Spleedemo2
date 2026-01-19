import { useDailyPlannerState } from './useDailyPlannerState';
import { HeaderWidgets } from './HeaderWidgets';
import { TasksWidget } from './TasksWidget';
import { TimelineWidget } from './TimelineWidget';

interface DailyPlannerSheetProps {
  initialDate?: string;
}

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
    <div className="flex flex-col bg-background h-full overflow-hidden">
      {/* 상단 위젯들: DAY / D-DAY / 공부시간 + COMMENT */}
      <HeaderWidgets
        dailyInfo={data.dailyInfo}
        timelineBlocks={data.timelineBlocks}
        onUpdateDailyInfo={updateDailyInfo}
        onDateChange={changeDate}
      />

      {/* 하단 메인 영역: TASKS + TIMELINE */}
      <div className="flex flex-1 min-h-0 gap-[8px] px-[12px] pb-[12px]">
        {/* TASKS 위젯 */}
        <div style={{ width: '200px' }}>
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

        {/* TIMELINE 위젯 */}
        <div className="flex-1">
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

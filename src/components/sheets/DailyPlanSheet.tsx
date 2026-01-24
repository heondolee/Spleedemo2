import { useState } from 'react';
import { Plus, Trash2, Clock, Target, CheckSquare } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  time?: string;
}

interface Goal {
  id: string;
  text: string;
}

interface DailyPlanSheetProps {
  selectedDate: Date;
}

export function DailyPlanSheet({ selectedDate }: DailyPlanSheetProps) {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: '수학 문제집 3단원', completed: true, time: '09:00' },
    { id: '2', text: '영어 단어 50개', completed: true, time: '11:00' },
    { id: '3', text: '과학 실험 보고서', completed: false, time: '14:00' },
    { id: '4', text: '운동 30분', completed: false, time: '18:00' },
  ]);

  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', text: '공부 8시간' },
    { id: '2', text: '독서 1시간' },
  ]);

  const [memo, setMemo] = useState('오늘은 수학 시험 대비에 집중하자!');

  const formatDate = (date: Date) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const addTask = () => {
    const text = prompt('할 일을 입력하세요:');
    if (text) {
      const time = prompt('시간을 입력하세요 (예: 09:00):');
      setTasks([...tasks, {
        id: Date.now().toString(),
        text,
        completed: false,
        time: time || undefined,
      }]);
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const addGoal = () => {
    const text = prompt('목표를 입력하세요:');
    if (text) {
      setGoals([...goals, {
        id: Date.now().toString(),
        text,
      }]);
    }
  };

  const deleteGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-[20px] py-[16px] flex-shrink-0 bg-accent/5">
        <h2 className="font-semibold mb-[8px]" style={{ fontSize: '17px' }}>
          {formatDate(selectedDate)}
        </h2>
        
        {/* Progress */}
        <div className="flex items-center gap-[12px]">
          <div className="flex-1 h-[8px] bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground font-medium">
            {completedCount}/{totalCount}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-[20px]">
        {/* Goals Section */}
        <div className="mb-[24px]">
          <div className="flex items-center justify-between mb-[12px]">
            <div className="flex items-center gap-[8px]">
              <Target className="w-[18px] h-[18px] text-primary" />
              <h3 className="font-semibold" style={{ fontSize: '15px' }}>오늘의 목표</h3>
            </div>
            <button
              onClick={addGoal}
              className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] hover:bg-accent transition-colors"
            >
              <Plus className="w-[16px] h-[16px]" />
            </button>
          </div>
          
          <div className="space-y-[8px]">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center gap-[10px] px-[14px] py-[10px] border border-border rounded-[8px] bg-primary/5 group"
              >
                <CheckSquare className="w-[16px] h-[16px] text-primary flex-shrink-0" />
                <span className="flex-1 text-sm text-primary font-medium">{goal.text}</span>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-[14px] h-[14px] text-destructive" />
                </button>
              </div>
            ))}
            {goals.length === 0 && (
              <div className="text-center text-muted-foreground py-[20px] text-sm">
                목표를 추가해보세요
              </div>
            )}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="mb-[24px]">
          <div className="flex items-center justify-between mb-[12px]">
            <div className="flex items-center gap-[8px]">
              <Clock className="w-[18px] h-[18px] text-primary" />
              <h3 className="font-semibold" style={{ fontSize: '15px' }}>할 일</h3>
            </div>
            <button
              onClick={addTask}
              className="px-[10px] py-[5px] bg-primary text-primary-foreground rounded-[6px] hover:bg-primary/90 transition-colors flex items-center gap-[6px]"
            >
              <Plus className="w-[14px] h-[14px]" />
              <span className="text-xs font-medium">추가</span>
            </button>
          </div>

          <div className="space-y-[6px]">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-[10px] px-[14px] py-[12px] border border-border rounded-[8px] group transition-colors ${
                  task.completed ? 'bg-accent/30' : 'bg-background hover:bg-accent/20'
                }`}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-[20px] h-[20px] border-2 rounded-[5px] flex-shrink-0 transition-colors ${
                    task.completed ? 'bg-primary border-primary' : 'border-border'
                  }`}
                >
                  {task.completed && (
                    <svg className="w-full h-full text-primary-foreground" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                  )}
                </button>

                {task.time && (
                  <span className={`text-xs font-medium px-[8px] py-[2px] rounded-[4px] ${
                    task.completed ? 'bg-accent text-muted-foreground' : 'bg-primary/10 text-primary'
                  }`}>
                    {task.time}
                  </span>
                )}

                <span className={`flex-1 text-sm ${
                  task.completed ? 'line-through text-muted-foreground' : ''
                }`}>
                  {task.text}
                </span>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-[14px] h-[14px] text-destructive" />
                </button>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center text-muted-foreground py-[20px] text-sm">
                할 일을 추가해보세요
              </div>
            )}
          </div>
        </div>

        {/* Memo Section */}
        <div>
          <h3 className="font-semibold mb-[12px]" style={{ fontSize: '15px' }}>메모</h3>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full px-[14px] py-[12px] rounded-[8px] border border-border bg-background resize-none outline-none focus:border-primary transition-colors text-sm"
            rows={4}
            placeholder="오늘 하루를 기록해보세요..."
          />
        </div>
      </div>
    </div>
  );
}

import { ChevronLeft, ChevronRight, Plus, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface Task {
  id: string;
  name: string;
  completed: number;
  total: number;
  icon: string;
}

export function DailyPlannerSheet() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 23)); // 1월 23일 (금)
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', name: 'ㅁㄴㅇㄹ', completed: 0, total: 0, icon: '📚' },
    { id: '2', name: '🏃', completed: 0, total: 0, icon: '' },
  ]);

  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[date.getDay()];
    return `${month}월 ${day}일 (${dayName})`;
  };

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  // 시간 그리드 생성 (6-12, 1-3)
  const timeSlots = [6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
  const minutes = [10, 20, 30, 40, 50, 60];

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-[16px] border-b border-border" style={{ height: '56px' }}>
        <div className="flex items-center gap-[16px] flex-1">
          <button className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] hover:bg-accent transition-colors">
            <ChevronLeft className="w-[20px] h-[20px]" />
          </button>
          
          <span className="font-medium" style={{ fontSize: '16px' }}>하루 계획</span>
          
          <div className="flex items-center gap-[8px] ml-[24px]">
            <button className="px-[12px] py-[6px] bg-primary text-primary-foreground rounded-[8px] font-medium" style={{ fontSize: '13px' }}>
              DAY
            </button>
            <button className="px-[12px] py-[6px] hover:bg-accent rounded-[8px] font-medium" style={{ fontSize: '13px' }}>
              WEEK
            </button>
          </div>
          
          <div className="flex items-center gap-[8px] ml-[8px]">
            <button 
              onClick={goToPreviousDay}
              className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] hover:bg-accent transition-colors"
            >
              <ChevronLeft className="w-[16px] h-[16px]" />
            </button>
            <span className="font-medium min-w-[120px] text-center" style={{ fontSize: '15px' }}>
              {formatDate(currentDate)}
            </span>
            <button 
              onClick={goToNextDay}
              className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] hover:bg-accent transition-colors"
            >
              <ChevronRight className="w-[16px] h-[16px]" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-[12px]">
          <button className="px-[12px] py-[6px] rounded-[8px] border border-border hover:bg-accent transition-colors font-medium" style={{ fontSize: '13px' }}>
            D-DAY 설정하기
          </button>
          <div className="text-muted-foreground" style={{ fontSize: '13px' }}>
            공부시간 <span className="font-medium">0분</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-[16px]">
          {/* Comment Section */}
          <div className="mb-[16px] p-[12px] rounded-[12px] border border-border bg-card">
            <div className="text-muted-foreground text-center" style={{ fontSize: '13px' }}>
              <div className="font-medium mb-[4px]">COMMENT</div>
              <div>클릭하여 입력</div>
            </div>
          </div>

          {/* Tasks and Time Grid */}
          <div className="flex gap-[16px]">
            {/* Tasks Section */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-[12px]">
                <span className="font-medium text-muted-foreground" style={{ fontSize: '13px' }}>TASKS</span>
                <button className="w-[24px] h-[24px] flex items-center justify-center rounded-[6px] hover:bg-accent transition-colors">
                  <Plus className="w-[16px] h-[16px]" />
                </button>
              </div>
              
              <div className="space-y-[8px]">
                {tasks.map((task) => (
                  <div 
                    key={task.id}
                    className="flex items-center gap-[12px] px-[12px] py-[10px] rounded-[8px] border border-border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <span style={{ fontSize: '16px' }}>{task.icon || task.name}</span>
                    <div className="flex-1" />
                    <button className="flex items-center gap-[4px] px-[8px] py-[4px] rounded-[6px] border border-border hover:bg-accent transition-colors">
                      <span style={{ fontSize: '13px' }}>{task.completed}/{task.total}</span>
                      <ChevronDown className="w-[14px] h-[14px]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Grid */}
            <div className="flex-shrink-0">
              <div className="mb-[12px] h-[24px]" /> {/* Spacer to align with TASKS header */}
              
              <div className="flex flex-col">
                {/* Minute Headers */}
                <div className="flex mb-[4px]">
                  <div className="w-[32px]" /> {/* Spacer for time labels */}
                  {minutes.map((min) => (
                    <div 
                      key={min}
                      className="w-[20px] text-center text-muted-foreground"
                      style={{ fontSize: '10px' }}
                    >
                      {min}
                    </div>
                  ))}
                </div>

                {/* Time Rows */}
                {timeSlots.map((hour) => (
                  <div key={hour} className="flex items-center" style={{ height: '24px' }}>
                    <div className="w-[32px] text-right pr-[8px] text-muted-foreground" style={{ fontSize: '11px' }}>
                      {hour}
                    </div>
                    {minutes.map((min) => (
                      <div 
                        key={`${hour}-${min}`}
                        className="w-[20px] h-full border-r border-b border-border/30 hover:bg-primary/10 transition-colors cursor-pointer"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

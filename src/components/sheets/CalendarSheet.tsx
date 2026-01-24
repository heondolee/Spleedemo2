import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Filter, Target, ListTodo } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  category: string;
  startDate: Date;
  endDate: Date;
  color: string;
}

interface CalendarSheetProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

type ViewMode = 'month' | 'week' | 'day';

const categories = [
  { id: 'study', name: '공부', color: 'bg-blue-500' },
  { id: 'exam', name: '시험', color: 'bg-red-500' },
  { id: 'assignment', name: '과제', color: 'bg-orange-500' },
  { id: 'personal', name: '개인', color: 'bg-green-500' },
  { id: 'exercise', name: '운동', color: 'bg-purple-500' },
];

export function CalendarSheet({ onDateSelect, selectedDate: propSelectedDate }: CalendarSheetProps) {
  const [currentDate, setCurrentDate] = useState(propSelectedDate || new Date(2026, 0, 24)); // 2026년 1월 24일
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categories.map(c => c.id));
  const [monthGoals, setMonthGoals] = useState('수능 대비 기초 다지기');
  const [monthTodos, setMonthTodos] = useState<{ id: string; text: string; completed: boolean }[]>([
    { id: '1', text: '수학 기출문제 3회분', completed: true },
    { id: '2', text: '영어 단어 500개', completed: false },
    { id: '3', text: '과학 실험 정리', completed: false },
  ]);

  // 일정 추가 폼 상태
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState('study');
  const [newEventStartDate, setNewEventStartDate] = useState('');
  const [newEventEndDate, setNewEventEndDate] = useState('');

  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: '중간고사',
      category: 'exam',
      startDate: new Date(2026, 0, 20),
      endDate: new Date(2026, 0, 23),
      color: 'bg-red-500',
    },
    {
      id: '2',
      title: '영어 과제 제출',
      category: 'assignment',
      startDate: new Date(2026, 0, 25),
      endDate: new Date(2026, 0, 25),
      color: 'bg-orange-500',
    },
    {
      id: '3',
      title: '헬스장',
      category: 'exercise',
      startDate: new Date(2026, 0, 24),
      endDate: new Date(2026, 0, 24),
      color: 'bg-purple-500',
    },
  ]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getWeekDays = (date: Date) => {
    const dayOfWeek = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - dayOfWeek);
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    
    return events.filter(event => {
      const eventStart = new Date(event.startDate.setHours(0, 0, 0, 0));
      const eventEnd = new Date(event.endDate.setHours(23, 59, 59, 999));
      const checkDate = new Date(date.setHours(12, 0, 0, 0));
      
      return selectedCategories.includes(event.category) &&
             checkDate >= eventStart && checkDate <= eventEnd;
    });
  };

  const isSameDay = (date1: Date | null, date2: Date) => {
    if (!date1) return false;
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return isSameDay(date, today);
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const formatDateHeader = () => {
    if (viewMode === 'month') {
      return `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;
    } else if (viewMode === 'week') {
      const weekDays = getWeekDays(currentDate);
      const start = weekDays[0];
      const end = weekDays[6];
      return `${start.getMonth() + 1}.${start.getDate()} - ${end.getMonth() + 1}.${end.getDate()}`;
    } else {
      return `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월 ${currentDate.getDate()}일`;
    }
  };

  const toggleTodo = (todoId: string) => {
    setMonthTodos(monthTodos.map(todo =>
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const addEvent = () => {
    if (newEventTitle && newEventStartDate && newEventEndDate) {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: newEventTitle,
        category: newEventCategory,
        startDate: new Date(newEventStartDate),
        endDate: new Date(newEventEndDate),
        color: categories.find(c => c.id === newEventCategory)?.color || 'bg-gray-500',
      };
      setEvents([...events, newEvent]);
      setShowAddEvent(false);
      setNewEventTitle('');
      setNewEventCategory('study');
      setNewEventStartDate('');
      setNewEventEndDate('');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header */}
      <div className="h-[60px] border-b border-border px-[20px] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-[12px]">
          <button
            onClick={handlePrevious}
            className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] hover:bg-accent transition-colors"
          >
            <ChevronLeft className="w-[18px] h-[18px]" />
          </button>
          <h2 className="font-semibold" style={{ fontSize: '17px' }}>{formatDateHeader()}</h2>
          <button
            onClick={handleNext}
            className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] hover:bg-accent transition-colors"
          >
            <ChevronRight className="w-[18px] h-[18px]" />
          </button>
        </div>

        <div className="flex items-center gap-[8px]">
          {/* View Mode Switcher */}
          <div className="flex bg-accent/30 rounded-[8px] p-[2px]">
            {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-[12px] py-[5px] rounded-[6px] text-xs font-medium transition-colors ${
                  viewMode === mode ? 'bg-background shadow-sm' : 'hover:bg-accent/50'
                }`}
              >
                {mode === 'month' ? '월' : mode === 'week' ? '주' : '일'}
              </button>
            ))}
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-[10px] py-[6px] rounded-[8px] hover:bg-accent transition-colors flex items-center gap-[6px] ${
              showFilters ? 'bg-accent' : ''
            }`}
          >
            <Filter className="w-[16px] h-[16px]" />
            <span className="text-xs font-medium">필터</span>
          </button>

          {/* Add Event Button */}
          <button
            onClick={() => setShowAddEvent(true)}
            className="px-[10px] py-[6px] bg-primary text-primary-foreground rounded-[8px] hover:bg-primary/90 transition-colors flex items-center gap-[6px]"
          >
            <Plus className="w-[16px] h-[16px]" />
            <span className="text-xs font-medium">일정 추가</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="border-b border-border px-[20px] py-[12px] bg-accent/5 flex-shrink-0">
          <div className="flex flex-wrap gap-[8px]">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={`px-[12px] py-[6px] rounded-[8px] text-xs font-medium transition-all ${
                  selectedCategories.includes(category.id)
                    ? `${category.color} text-white`
                    : 'bg-accent text-muted-foreground'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {/* Calendar View - Full Width */}
        <div className="p-[20px] pb-[12px]">
          {viewMode === 'month' && (
            <div className="flex flex-col">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-[4px] mb-[8px]">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                  <div
                    key={day}
                    className={`text-center font-semibold py-[8px] text-xs ${
                      idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-muted-foreground'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-[4px]">
                {getDaysInMonth(currentDate).map((date, idx) => {
                  const dayEvents = getEventsForDate(date);
                  const isCurrentDay = date && isSameDay(date, currentDate);
                  const isTodayDate = isToday(date);

                  return (
                    <div
                      key={idx}
                      onClick={() => date && onDateSelect && onDateSelect(date)}
                      className={`border border-border rounded-[8px] p-[8px] cursor-pointer transition-all min-h-[90px] ${
                        !date ? 'bg-accent/10 cursor-default' : 'hover:border-primary hover:shadow-sm'
                      } ${isCurrentDay ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                    >
                      {date && (
                        <>
                          <div className={`text-sm font-medium mb-[4px] ${
                            isTodayDate ? 'text-primary' : ''
                          }`}>
                            {date.getDate()}
                          </div>
                          <div className="space-y-[2px]">
                            {dayEvents.slice(0, 3).map((event) => (
                              <div
                                key={event.id}
                                className={`${event.color} text-white text-xs px-[4px] py-[2px] rounded-[4px] truncate`}
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 3 && (
                              <div className="text-xs text-muted-foreground">+{dayEvents.length - 3}</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'week' && (
            <div className="flex flex-col">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-[4px] mb-[8px]">
                {getWeekDays(currentDate).map((date, idx) => (
                  <div key={idx} className="text-center">
                    <div className={`font-semibold text-xs ${
                      idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-muted-foreground'
                    }`}>
                      {['일', '월', '화', '수', '목', '금', '토'][idx]}
                    </div>
                    <div className={`text-sm font-medium ${isToday(date) ? 'text-primary' : ''}`}>
                      {date.getDate()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Week Grid */}
              <div className="grid grid-cols-7 gap-[4px]" style={{ minHeight: '300px' }}>
                {getWeekDays(currentDate).map((date, idx) => {
                  const dayEvents = getEventsForDate(date);
                  const isCurrentDay = isSameDay(date, currentDate);

                  return (
                    <div
                      key={idx}
                      onClick={() => onDateSelect && onDateSelect(date)}
                      className={`border border-border rounded-[8px] p-[8px] cursor-pointer transition-all ${
                        isCurrentDay ? 'ring-2 ring-primary bg-primary/5' : 'hover:border-primary hover:shadow-sm'
                      }`}
                    >
                      <div className="space-y-[4px]">
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className={`${event.color} text-white text-xs px-[6px] py-[3px] rounded-[4px]`}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'day' && (
            <div className="border border-border rounded-[12px] p-[16px]">
              <h3 className="font-semibold mb-[16px]" style={{ fontSize: '15px' }}>
                {currentDate.getMonth() + 1}월 {currentDate.getDate()}일 일정
              </h3>
              <div className="space-y-[8px]">
                {getEventsForDate(currentDate).map((event) => (
                  <div
                    key={event.id}
                    className={`${event.color} text-white px-[12px] py-[10px] rounded-[8px]`}
                  >
                    <div className="font-medium mb-[2px]">{event.title}</div>
                    <div className="text-xs opacity-90">
                      {event.startDate.toLocaleDateString()} - {event.endDate.toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {getEventsForDate(currentDate).length === 0 && (
                  <div className="text-center text-muted-foreground py-[40px]">
                    일정이 없습니다
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Goals & TODOs - Below Calendar */}
        <div className="px-[20px] pb-[20px] pt-[8px] border-t border-border">
          <div className="grid grid-cols-2 gap-[16px]">
            {/* Goals */}
            <div className="border border-border rounded-[12px] p-[14px] bg-background">
              <div className="flex items-center gap-[6px] mb-[10px]">
                <Target className="w-[16px] h-[16px] text-primary" />
                <h4 className="font-semibold text-sm">이번 달 목표</h4>
              </div>
              <textarea
                value={monthGoals}
                onChange={(e) => setMonthGoals(e.target.value)}
                className="w-full px-[10px] py-[8px] rounded-[6px] border border-border bg-background resize-none outline-none focus:border-primary transition-colors text-sm"
                rows={3}
                placeholder="목표를 입력하세요..."
              />
            </div>

            {/* TODOs */}
            <div className="border border-border rounded-[12px] p-[14px] bg-background">
              <div className="flex items-center gap-[6px] mb-[10px]">
                <ListTodo className="w-[16px] h-[16px] text-primary" />
                <h4 className="font-semibold text-sm">TODO</h4>
              </div>
              <div className="space-y-[6px]">
                {monthTodos.map((todo) => (
                  <div key={todo.id} className="flex items-start gap-[8px]">
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`mt-[2px] w-[16px] h-[16px] border-2 rounded-[4px] flex-shrink-0 transition-colors ${
                        todo.completed ? 'bg-primary border-primary' : 'border-border'
                      }`}
                    />
                    <span className={`text-sm flex-1 ${
                      todo.completed ? 'line-through text-muted-foreground' : ''
                    }`}>
                      {todo.text}
                    </span>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newTodo = prompt('새 TODO를 입력하세요:');
                    if (newTodo) {
                      setMonthTodos([...monthTodos, {
                        id: Date.now().toString(),
                        text: newTodo,
                        completed: false,
                      }]);
                    }
                  }}
                  className="w-full text-left text-sm text-primary hover:underline mt-[4px]"
                >
                  + TODO 추가
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <>
          <div className="absolute inset-0 bg-black/50 z-50" onClick={() => setShowAddEvent(false)} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-51 bg-background rounded-[12px] shadow-xl p-[24px] w-[400px]">
            <h3 className="font-semibold mb-[16px]" style={{ fontSize: '16px' }}>일정 추가</h3>
            <div className="space-y-[12px]">
              <div>
                <label className="text-sm text-muted-foreground mb-[6px] block">일정 제목</label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-[12px] py-[8px] rounded-[8px] border border-border bg-background outline-none focus:border-primary transition-colors text-sm"
                  placeholder="예: 중간고사"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-[6px] block">카테고리</label>
                <select
                  value={newEventCategory}
                  onChange={(e) => setNewEventCategory(e.target.value)}
                  className="w-full px-[12px] py-[8px] rounded-[8px] border border-border bg-background outline-none focus:border-primary transition-colors text-sm"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-[6px] block">시작 날짜</label>
                <input
                  type="date"
                  value={newEventStartDate}
                  onChange={(e) => setNewEventStartDate(e.target.value)}
                  className="w-full px-[12px] py-[8px] rounded-[8px] border border-border bg-background outline-none focus:border-primary transition-colors text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-[6px] block">종료 날짜</label>
                <input
                  type="date"
                  value={newEventEndDate}
                  onChange={(e) => setNewEventEndDate(e.target.value)}
                  className="w-full px-[12px] py-[8px] rounded-[8px] border border-border bg-background outline-none focus:border-primary transition-colors text-sm"
                />
              </div>
              <div className="flex gap-[8px] pt-[8px]">
                <button
                  onClick={addEvent}
                  className="flex-1 px-[16px] py-[10px] bg-primary text-primary-foreground rounded-[8px] hover:bg-primary/90 transition-colors font-medium text-sm"
                >
                  추가
                </button>
                <button
                  onClick={() => setShowAddEvent(false)}
                  className="flex-1 px-[16px] py-[10px] border border-border rounded-[8px] hover:bg-accent transition-colors font-medium text-sm"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
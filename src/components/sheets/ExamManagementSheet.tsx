import { Plus, ChevronDown, ChevronRight, Calendar, CheckSquare, Square, Trash2, GripVertical } from 'lucide-react';
import { useState } from 'react';

interface RangeItem {
  id: string;
  text: string;
  completed: boolean;
  expanded: boolean;
  children: RangeItem[];
}

interface Subject {
  id: string;
  name: string;
  ranges: RangeItem[];
  strategy: string;
  memo: string;
  progress: number;
  expanded: boolean;
}

interface Exam {
  id: string;
  name: string;
  date: string;
  expanded: boolean;
  subjects: Subject[];
}

export function ExamManagementSheet() {
  const [exams, setExams] = useState<Exam[]>([
    {
      id: '1',
      name: '중간고사',
      date: '2026-03-15',
      expanded: true,
      subjects: [
        {
          id: 's1',
          name: '수학',
          ranges: [
            { 
              id: 'r1', 
              text: '1단원: 다항식', 
              completed: true, 
              expanded: false,
              children: [] 
            },
            { 
              id: 'r2', 
              text: '2단원: 방정식', 
              completed: false, 
              expanded: false,
              children: [] 
            },
          ],
          strategy: '기출문제 위주로 학습',
          memo: '',
          progress: 50,
          expanded: false,
        },
        {
          id: 's2',
          name: '영어',
          ranges: [
            { 
              id: 'r3', 
              text: '1-3과', 
              completed: false, 
              expanded: false,
              children: [] 
            },
          ],
          strategy: '',
          memo: '',
          progress: 0,
          expanded: false,
        },
        {
          id: 's3',
          name: '국어',
          ranges: [],
          strategy: '',
          memo: '',
          progress: 0,
          expanded: false,
        },
      ],
    },
  ]);

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [swipeState, setSwipeState] = useState<{
    id: string;
    type: 'exam' | 'subject';
    examId?: string;
    offset: number;
  } | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; id: string; type: 'exam' | 'subject'; examId?: string } | null>(null);

  const toggleExam = (examId: string) => {
    setExams(exams.map(exam => 
      exam.id === examId ? { ...exam, expanded: !exam.expanded } : exam
    ));
  };

  const toggleSubject = (examId: string, subjectId: string) => {
    setExams(exams.map(exam => 
      exam.id === examId 
        ? {
            ...exam,
            subjects: exam.subjects.map(subject =>
              subject.id === subjectId ? { ...subject, expanded: !subject.expanded } : subject
            )
          }
        : exam
    ));
  };

  const addExam = () => {
    const newExam: Exam = {
      id: Date.now().toString(),
      name: '새 시험',
      date: new Date().toISOString().split('T')[0],
      expanded: true,
      subjects: [],
    };
    setExams([...exams, newExam]);
  };

  const deleteExam = (examId: string) => {
    setExams(exams.filter(exam => exam.id !== examId));
    setSwipeState(null);
  };

  const updateExamName = (examId: string, name: string) => {
    setExams(exams.map(exam => 
      exam.id === examId ? { ...exam, name } : exam
    ));
  };

  const updateExamDate = (examId: string, date: string) => {
    setExams(exams.map(exam => 
      exam.id === examId ? { ...exam, date } : exam
    ));
  };

  const addSubject = (examId: string) => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: '새 과목',
      ranges: [],
      strategy: '',
      memo: '',
      progress: 0,
      expanded: false,
    };
    setExams(exams.map(exam => 
      exam.id === examId ? { ...exam, subjects: [...exam.subjects, newSubject] } : exam
    ));
  };

  const deleteSubject = (examId: string, subjectId: string) => {
    setExams(exams.map(exam => 
      exam.id === examId 
        ? { ...exam, subjects: exam.subjects.filter(s => s.id !== subjectId) }
        : exam
    ));
    setSwipeState(null);
  };

  const updateSubjectName = (examId: string, subjectId: string, name: string) => {
    setExams(exams.map(exam => 
      exam.id === examId 
        ? {
            ...exam,
            subjects: exam.subjects.map(subject =>
              subject.id === subjectId ? { ...subject, name } : subject
            )
          }
        : exam
    ));
  };

  const updateSubjectStrategy = (examId: string, subjectId: string, strategy: string) => {
    setExams(exams.map(exam => 
      exam.id === examId 
        ? {
            ...exam,
            subjects: exam.subjects.map(subject =>
              subject.id === subjectId ? { ...subject, strategy } : subject
            )
          }
        : exam
    ));
  };

  const updateSubjectMemo = (examId: string, subjectId: string, memo: string) => {
    setExams(exams.map(exam => 
      exam.id === examId 
        ? {
            ...exam,
            subjects: exam.subjects.map(subject =>
              subject.id === subjectId ? { ...subject, memo } : subject
            )
          }
        : exam
    ));
  };

  // Recursive functions for nested ranges
  const findAndUpdateRange = (items: RangeItem[], rangeId: string, updater: (item: RangeItem) => RangeItem): RangeItem[] => {
    return items.map(item => {
      if (item.id === rangeId) {
        return updater(item);
      }
      if (item.children.length > 0) {
        return { ...item, children: findAndUpdateRange(item.children, rangeId, updater) };
      }
      return item;
    });
  };

  const findAndDeleteRange = (items: RangeItem[], rangeId: string): RangeItem[] => {
    return items.filter(item => item.id !== rangeId).map(item => ({
      ...item,
      children: findAndDeleteRange(item.children, rangeId)
    }));
  };

  const findAndAddChild = (items: RangeItem[], parentId: string, newItem: RangeItem): RangeItem[] => {
    return items.map(item => {
      if (item.id === parentId) {
        return { ...item, children: [...item.children, newItem], expanded: true };
      }
      if (item.children.length > 0) {
        return { ...item, children: findAndAddChild(item.children, parentId, newItem) };
      }
      return item;
    });
  };

  const countAllItems = (items: RangeItem[]): number => {
    return items.reduce((count, item) => {
      return count + 1 + countAllItems(item.children);
    }, 0);
  };

  const countCompletedItems = (items: RangeItem[]): number => {
    return items.reduce((count, item) => {
      return count + (item.completed ? 1 : 0) + countCompletedItems(item.children);
    }, 0);
  };

  const getDepth = (items: RangeItem[], targetId: string, currentDepth: number = 0): number => {
    for (const item of items) {
      if (item.id === targetId) {
        return currentDepth;
      }
      if (item.children.length > 0) {
        const childDepth = getDepth(item.children, targetId, currentDepth + 1);
        if (childDepth !== -1) {
          return childDepth;
        }
      }
    }
    return -1;
  };

  const addRange = (examId: string, subjectId: string) => {
    const newRange: RangeItem = {
      id: Date.now().toString(),
      text: '',
      completed: false,
      expanded: false,
      children: [],
    };
    setExams(exams.map(exam => 
      exam.id === examId 
        ? {
            ...exam,
            subjects: exam.subjects.map(subject =>
              subject.id === subjectId 
                ? { ...subject, ranges: [...subject.ranges, newRange] }
                : subject
            )
          }
        : exam
    ));
    setEditingItemId(newRange.id);
  };

  const addSubRange = (examId: string, subjectId: string, parentId: string) => {
    const newRange: RangeItem = {
      id: Date.now().toString(),
      text: '',
      completed: false,
      expanded: false,
      children: [],
    };
    
    setExams(exams.map(exam => 
      exam.id === examId 
        ? {
            ...exam,
            subjects: exam.subjects.map(subject => {
              if (subject.id === subjectId) {
                const depth = getDepth(subject.ranges, parentId);
                if (depth >= 2) {
                  // Already at max depth, don't add
                  return subject;
                }
                return {
                  ...subject,
                  ranges: findAndAddChild(subject.ranges, parentId, newRange)
                };
              }
              return subject;
            })
          }
        : exam
    ));
    setEditingItemId(newRange.id);
  };

  const updateRange = (examId: string, subjectId: string, rangeId: string, text: string) => {
    setExams(exams.map(exam => 
      exam.id === examId 
        ? {
            ...exam,
            subjects: exam.subjects.map(subject =>
              subject.id === subjectId 
                ? {
                    ...subject,
                    ranges: findAndUpdateRange(subject.ranges, rangeId, (item) => ({ ...item, text }))
                  }
                : subject
            )
          }
        : exam
    ));
  };

  const toggleRangeExpanded = (examId: string, subjectId: string, rangeId: string) => {
    setExams(exams.map(exam => 
      exam.id === examId 
        ? {
            ...exam,
            subjects: exam.subjects.map(subject =>
              subject.id === subjectId 
                ? {
                    ...subject,
                    ranges: findAndUpdateRange(subject.ranges, rangeId, (item) => ({ 
                      ...item, 
                      expanded: !item.expanded 
                    }))
                  }
                : subject
            )
          }
        : exam
    ));
  };

  const toggleRangeComplete = (examId: string, subjectId: string, rangeId: string) => {
    setExams(exams.map(exam => 
      exam.id === examId 
        ? {
            ...exam,
            subjects: exam.subjects.map(subject => {
              if (subject.id === subjectId) {
                const updatedRanges = findAndUpdateRange(subject.ranges, rangeId, (item) => ({ 
                  ...item, 
                  completed: !item.completed 
                }));
                const totalCount = countAllItems(updatedRanges);
                const completedCount = countCompletedItems(updatedRanges);
                const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                return { ...subject, ranges: updatedRanges, progress };
              }
              return subject;
            })
          }
        : exam
    ));
  };

  const deleteRange = (examId: string, subjectId: string, rangeId: string) => {
    setExams(exams.map(exam => 
      exam.id === examId 
        ? {
            ...exam,
            subjects: exam.subjects.map(subject =>
              subject.id === subjectId 
                ? {
                    ...subject,
                    ranges: findAndDeleteRange(subject.ranges, rangeId)
                  }
                : subject
            )
          }
        : exam
    ));
  };

  // Swipe handlers
  const handleMouseDown = (e: React.MouseEvent, id: string, type: 'exam' | 'subject', examId?: string) => {
    setDragStart({ x: e.clientX, y: e.clientY, id, type, examId });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStart) return;
    
    const deltaX = dragStart.x - e.clientX;
    const deltaY = Math.abs(dragStart.y - e.clientY);
    
    // Only swipe if horizontal movement is more than vertical
    if (deltaY < 30 && deltaX > 5) {
      const offset = Math.max(0, Math.min(80, deltaX));
      setSwipeState({ id: dragStart.id, type: dragStart.type, examId: dragStart.examId, offset });
    }
  };

  const handleMouseUp = () => {
    if (swipeState && swipeState.offset > 40) {
      // Keep delete button visible
      setSwipeState({ ...swipeState, offset: 80 });
    } else {
      // Reset
      setSwipeState(null);
    }
    setDragStart(null);
  };

  const handleMouseLeave = () => {
    if (dragStart && (!swipeState || swipeState.offset < 40)) {
      setSwipeState(null);
      setDragStart(null);
    }
  };

  // Recursive component for rendering range items
  const RangeItemComponent = ({ 
    item, 
    depth, 
    examId, 
    subjectId 
  }: { 
    item: RangeItem; 
    depth: number; 
    examId: string; 
    subjectId: string; 
  }) => {
    const hasChildren = item.children.length > 0;
    const canAddChild = depth < 2; // Max 3 levels (0, 1, 2)
    const marginLeft = depth * 20;

    return (
      <div key={item.id} className="space-y-[4px]">
        <div
          className={`flex items-center gap-[8px] px-[10px] rounded-[8px] border border-border bg-background transition-all ${
            editingItemId === item.id ? 'py-[12px]' : 'py-[8px]'
          }`}
          style={{ marginLeft: `${marginLeft}px` }}
        >
          {/* Toggle button for children */}
          <button
            onClick={() => hasChildren && toggleRangeExpanded(examId, subjectId, item.id)}
            className={`flex-shrink-0 w-[16px] h-[16px] flex items-center justify-center rounded transition-colors ${
              hasChildren ? 'hover:bg-accent cursor-pointer' : 'cursor-default'
            }`}
          >
            {hasChildren && (
              item.expanded ? (
                <ChevronDown className="w-[12px] h-[12px]" />
              ) : (
                <ChevronRight className="w-[12px] h-[12px]" />
              )
            )}
          </button>

          {/* Checkbox */}
          <button
            onClick={() => toggleRangeComplete(examId, subjectId, item.id)}
            className="flex-shrink-0 hover:text-primary transition-colors"
          >
            {item.completed ? (
              <CheckSquare className="w-[18px] h-[18px] text-primary" />
            ) : (
              <Square className="w-[18px] h-[18px]" />
            )}
          </button>

          {/* Drag Handle (when editing) */}
          {editingItemId === item.id && (
            <button className="flex-shrink-0 cursor-move text-muted-foreground hover:text-foreground">
              <GripVertical className="w-[14px] h-[14px]" />
            </button>
          )}

          {/* Range Text */}
          <input
            type="text"
            value={item.text}
            onChange={(e) => updateRange(examId, subjectId, item.id, e.target.value)}
            onFocus={() => setEditingItemId(item.id)}
            onBlur={(e) => {
              // Delay to allow button clicks to register first
              setTimeout(() => {
                setEditingItemId(null);
              }, 150);
            }}
            placeholder="범위를 입력하세요"
            className={`flex-1 bg-transparent outline-none transition-all ${
              item.completed ? 'line-through text-muted-foreground' : ''
            }`}
            style={{ fontSize: '13px' }}
          />

          {/* Add Sub-item button (when editing and can add) */}
          {editingItemId === item.id && canAddChild && (
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                addSubRange(examId, subjectId, item.id);
              }}
              className="flex-shrink-0 w-[24px] h-[24px] flex items-center justify-center rounded-[6px] hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              title="하위 항목 추가"
            >
              <Plus className="w-[14px] h-[14px]" />
            </button>
          )}

          {/* Delete Button (when editing) */}
          {editingItemId === item.id && (
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                deleteRange(examId, subjectId, item.id);
                setEditingItemId(null);
              }}
              className="flex-shrink-0 w-[24px] h-[24px] flex items-center justify-center rounded-[6px] hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <Trash2 className="w-[14px] h-[14px]" />
            </button>
          )}
        </div>

        {/* Children */}
        {item.expanded && item.children.length > 0 && (
          <div className="space-y-[4px]">
            {item.children.map(child => (
              <RangeItemComponent
                key={child.id}
                item={child}
                depth={depth + 1}
                examId={examId}
                subjectId={subjectId}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-[16px] border-b border-border" style={{ height: '56px' }}>
        <div className="flex items-center gap-[16px]">
          <span className="font-medium" style={{ fontSize: '16px' }}>시험 관리</span>
          <button
            onClick={addExam}
            className="px-[12px] py-[6px] bg-primary text-primary-foreground rounded-[8px] hover:bg-primary/90 transition-colors font-medium flex items-center gap-[6px]"
            style={{ fontSize: '13px' }}
          >
            <Plus className="w-[14px] h-[14px]" />
            시험 추가
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div 
        className="flex-1 overflow-auto p-[16px]"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div className="space-y-[12px]">
          {exams.map((exam) => {
            const isExamSwiped = swipeState?.type === 'exam' && swipeState?.id === exam.id;
            
            return (
              <div
                key={exam.id}
                className="relative"
              >
                {/* Delete Button Background (for Exam) */}
                {isExamSwiped && (
                  <div className="absolute right-0 top-0 bottom-0 w-[80px] bg-destructive rounded-r-[12px] flex items-center justify-center">
                    <button
                      onClick={() => deleteExam(exam.id)}
                      className="text-destructive-foreground"
                    >
                      <Trash2 className="w-[24px] h-[24px]" />
                    </button>
                  </div>
                )}
                
                <div
                  className="border border-border rounded-[12px] bg-card overflow-hidden transition-transform duration-200"
                  style={{
                    transform: isExamSwiped ? `translateX(-${swipeState.offset}px)` : 'translateX(0)',
                  }}
                  onMouseDown={(e) => handleMouseDown(e, exam.id, 'exam')}
                >
                  {/* Exam Header */}
                  <div className="flex items-center justify-between px-[16px] py-[12px] bg-accent/50">
                    <div className="flex items-center gap-[12px] flex-1">
                      <button
                        onClick={() => toggleExam(exam.id)}
                        className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] hover:bg-accent transition-colors"
                      >
                        {exam.expanded ? (
                          <ChevronDown className="w-[18px] h-[18px]" />
                        ) : (
                          <ChevronRight className="w-[18px] h-[18px]" />
                        )}
                      </button>
                      
                      <input
                        type="text"
                        value={exam.name}
                        onChange={(e) => updateExamName(exam.id, e.target.value)}
                        className="bg-transparent font-semibold outline-none border-b-2 border-transparent hover:border-primary focus:border-primary transition-colors"
                        style={{ fontSize: '16px' }}
                      />
                      
                      <div className="flex items-center gap-[8px]">
                        <Calendar className="w-[14px] h-[14px] text-muted-foreground" />
                        <input
                          type="date"
                          value={exam.date}
                          onChange={(e) => updateExamDate(exam.id, e.target.value)}
                          className="bg-transparent text-muted-foreground outline-none border-b-2 border-transparent hover:border-primary focus:border-primary transition-colors"
                          style={{ fontSize: '13px' }}
                        />
                      </div>

                      <div className="text-muted-foreground" style={{ fontSize: '13px' }}>
                        과목 {exam.subjects.length}개
                      </div>
                    </div>
                  </div>

                  {/* Exam Content */}
                  {exam.expanded && (
                    <div className="p-[16px]">
                      {/* Subjects Grid */}
                      <div className="grid grid-cols-2 gap-[12px]">
                        {exam.subjects.map((subject) => {
                          const isSubjectSwiped = swipeState?.type === 'subject' && swipeState?.id === subject.id && swipeState?.examId === exam.id;
                          
                          return (
                            <div
                              key={subject.id}
                              className="relative"
                              style={subject.expanded ? { gridColumn: 'span 2' } : {}}
                            >
                              {/* Delete Button Background (for Subject) */}
                              {isSubjectSwiped && (
                                <div className="absolute right-0 top-0 bottom-0 w-[80px] bg-destructive rounded-r-[10px] flex items-center justify-center z-10">
                                  <button
                                    onClick={() => deleteSubject(exam.id, subject.id)}
                                    className="text-destructive-foreground"
                                  >
                                    <Trash2 className="w-[20px] h-[20px]" />
                                  </button>
                                </div>
                              )}
                              
                              <div
                                className="border border-border rounded-[10px] bg-background/50 overflow-hidden transition-transform duration-200"
                                style={{
                                  transform: isSubjectSwiped ? `translateX(-${swipeState.offset}px)` : 'translateX(0)',
                                }}
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  handleMouseDown(e, subject.id, 'subject', exam.id);
                                }}
                              >
                                {/* Subject Header */}
                                <div 
                                  className="flex items-center justify-between px-[12px] py-[10px] bg-accent/30 cursor-pointer"
                                  onClick={() => toggleSubject(exam.id, subject.id)}
                                >
                                  <div className="flex items-center gap-[8px] flex-1 min-w-0">
                                    <button className="flex-shrink-0 w-[20px] h-[20px] flex items-center justify-center">
                                      {subject.expanded ? (
                                        <ChevronDown className="w-[16px] h-[16px]" />
                                      ) : (
                                        <ChevronRight className="w-[16px] h-[16px]" />
                                      )}
                                    </button>
                                    
                                    <input
                                      type="text"
                                      value={subject.name}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        updateSubjectName(exam.id, subject.id, e.target.value);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="bg-transparent font-medium outline-none border-b-2 border-transparent hover:border-primary focus:border-primary transition-colors truncate"
                                      style={{ fontSize: '14px' }}
                                    />
                                  </div>

                                  {!subject.expanded && (
                                    <div className="flex-shrink-0 flex items-center gap-[6px]">
                                      <div className="w-[40px] h-[4px] bg-muted rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-primary transition-all duration-300"
                                          style={{ width: `${subject.progress}%` }}
                                        />
                                      </div>
                                      <span className="text-muted-foreground font-medium" style={{ fontSize: '10px' }}>
                                        {subject.progress}%
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Subject Content (Expanded) */}
                                {subject.expanded && (
                                  <div className="p-[12px] space-y-[12px]">
                                    {/* Progress Bar */}
                                    <div>
                                      <div className="flex items-center gap-[8px]">
                                        <div className="flex-1 h-[6px] bg-muted rounded-full overflow-hidden">
                                          <div
                                            className="h-full bg-primary transition-all duration-300"
                                            style={{ width: `${subject.progress}%` }}
                                          />
                                        </div>
                                        <span className="text-muted-foreground font-medium" style={{ fontSize: '12px' }}>
                                          {subject.progress}%
                                        </span>
                                      </div>
                                    </div>
                                    
                                    {/* Strategy */}
                                    <div>
                                      <label className="text-muted-foreground font-medium mb-[6px] block" style={{ fontSize: '12px' }}>
                                        전략
                                      </label>
                                      <input
                                        type="text"
                                        value={subject.strategy}
                                        onChange={(e) => updateSubjectStrategy(exam.id, subject.id, e.target.value)}
                                        placeholder="학습 전략을 입력하세요"
                                        className="w-full px-[12px] py-[8px] rounded-[8px] border border-border bg-background outline-none focus:border-primary transition-colors"
                                        style={{ fontSize: '13px' }}
                                      />
                                    </div>

                                    {/* Memo */}
                                    <div>
                                      <label className="text-muted-foreground font-medium mb-[6px] block" style={{ fontSize: '12px' }}>
                                        메모 <span className="text-xs">(긴 글은 펜슬 지원)</span>
                                      </label>
                                      <textarea
                                        value={subject.memo}
                                        onChange={(e) => updateSubjectMemo(exam.id, subject.id, e.target.value)}
                                        placeholder="메모를 입력하세요"
                                        className="w-full px-[12px] py-[8px] rounded-[8px] border border-border bg-background outline-none focus:border-primary transition-colors resize-none"
                                        style={{ fontSize: '13px', minHeight: '60px' }}
                                      />
                                    </div>

                                    {/* Ranges */}
                                    <div>
                                      <div className="flex items-center justify-between mb-[8px]">
                                        <label className="text-muted-foreground font-medium" style={{ fontSize: '12px' }}>
                                          학습 범위
                                        </label>
                                        <button
                                          onClick={() => addRange(exam.id, subject.id)}
                                          className="px-[8px] py-[4px] rounded-[6px] border border-border hover:bg-accent transition-colors flex items-center gap-[4px]"
                                          style={{ fontSize: '12px' }}
                                        >
                                          <Plus className="w-[12px] h-[12px]" />
                                          추가
                                        </button>
                                      </div>

                                      <div className="space-y-[4px]">
                                        {subject.ranges.map((range) => (
                                          <RangeItemComponent
                                            key={range.id}
                                            item={range}
                                            depth={0}
                                            examId={exam.id}
                                            subjectId={subject.id}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Subject Button */}
                      <button
                        onClick={() => addSubject(exam.id)}
                        className="w-full mt-[12px] py-[10px] rounded-[10px] border-2 border-dashed border-border hover:border-primary hover:bg-accent transition-colors flex items-center justify-center gap-[8px] text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="w-[16px] h-[16px]" />
                        <span className="font-medium" style={{ fontSize: '13px' }}>과목 추가</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
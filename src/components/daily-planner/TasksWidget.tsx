import { useState, useRef, useEffect } from 'react';
import { Subject, Todo } from './types';

interface TasksWidgetProps {
  subjects: Subject[];
  todos: Todo[];
  onAddSubject: (name: string) => Subject;
  onUpdateSubject: (id: string, updates: Partial<Subject>) => void;
  onDeleteSubject: (id: string) => void;
  onAddTodo: (subjectId: string, content: string) => Todo;
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void;
  onDeleteTodo: (id: string) => void;
  onToggleTodo: (id: string) => void;
}

const SWIPE_THRESHOLD = 60; // 스와이프 임계값

export function TasksWidget({
  subjects,
  todos,
  onAddSubject,
  onDeleteSubject,
  onAddTodo,
  onUpdateTodo,
  onDeleteTodo,
  onToggleTodo,
}: TasksWidgetProps) {
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [addingTodoSubjectId, setAddingTodoSubjectId] = useState<string | null>(null);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newTodoContent, setNewTodoContent] = useState('');
  const [editTodoContent, setEditTodoContent] = useState('');
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

  // 스와이프 상태
  const [swipedTodoId, setSwipedTodoId] = useState<string | null>(null);
  const [swipedSubjectId, setSwipedSubjectId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const subjectInputRef = useRef<HTMLInputElement>(null);
  const todoInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // 스와이프 참조
  const swipeStartX = useRef(0);
  const swipeCurrentX = useRef(0);
  const isSwipingRef = useRef(false);
  const swipeTargetRef = useRef<{ type: 'todo' | 'subject'; id: string } | null>(null);

  useEffect(() => {
    if (isAddingSubject && subjectInputRef.current) {
      subjectInputRef.current.focus();
    }
  }, [isAddingSubject]);

  useEffect(() => {
    if (addingTodoSubjectId && todoInputRef.current) {
      todoInputRef.current.focus();
    }
  }, [addingTodoSubjectId]);

  useEffect(() => {
    if (editingTodoId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTodoId]);

  const getTodosForSubject = (subjectId: string) => {
    return todos.filter(t => t.subjectId === subjectId);
  };

  const toggleSubjectExpand = (subjectId: string) => {
    setExpandedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(subjectId)) {
        next.delete(subjectId);
      } else {
        next.add(subjectId);
      }
      return next;
    });
  };

  const handleAddSubject = () => {
    if (newSubjectName.trim()) {
      const newSubject = onAddSubject(newSubjectName.trim());
      setExpandedSubjects(prev => new Set(prev).add(newSubject.id));
      setNewSubjectName('');
      setIsAddingSubject(false);
    } else {
      setIsAddingSubject(false);
    }
  };

  const handleAddTodo = (subjectId: string) => {
    if (newTodoContent.trim()) {
      onAddTodo(subjectId, newTodoContent.trim());
      setNewTodoContent('');
    }
    setAddingTodoSubjectId(null);
  };

  const handleEditTodo = (todoId: string) => {
    if (editTodoContent.trim()) {
      onUpdateTodo(todoId, { content: editTodoContent.trim() });
    }
    setEditTodoContent('');
    setEditingTodoId(null);
  };

  const startEditTodo = (todo: Todo) => {
    setEditTodoContent(todo.content);
    setEditingTodoId(todo.id);
  };

  // 스와이프 핸들러
  const handleSwipeStart = (e: React.TouchEvent | React.MouseEvent, type: 'todo' | 'subject', id: string) => {
    // 이미 열린 스와이프가 있으면 닫기
    if (swipedTodoId || swipedSubjectId) {
      setSwipedTodoId(null);
      setSwipedSubjectId(null);
      setSwipeOffset(0);
      return;
    }

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    swipeStartX.current = clientX;
    swipeCurrentX.current = clientX;
    isSwipingRef.current = true;
    swipeTargetRef.current = { type, id };
  };

  const handleSwipeMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isSwipingRef.current || !swipeTargetRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    swipeCurrentX.current = clientX;
    const diff = swipeStartX.current - clientX;

    // 왼쪽으로만 스와이프 (diff > 0)
    if (diff > 0) {
      const offset = Math.min(diff, SWIPE_THRESHOLD + 20);
      setSwipeOffset(offset);

      if (swipeTargetRef.current.type === 'todo') {
        setSwipedTodoId(swipeTargetRef.current.id);
        setSwipedSubjectId(null);
      } else {
        setSwipedSubjectId(swipeTargetRef.current.id);
        setSwipedTodoId(null);
      }
    }
  };

  const handleSwipeEnd = () => {
    if (!isSwipingRef.current) return;

    isSwipingRef.current = false;
    const diff = swipeStartX.current - swipeCurrentX.current;

    if (diff > SWIPE_THRESHOLD) {
      // 스와이프 완료 - 삭제 버튼 보이기
      setSwipeOffset(SWIPE_THRESHOLD);
    } else {
      // 스와이프 취소
      setSwipedTodoId(null);
      setSwipedSubjectId(null);
      setSwipeOffset(0);
    }

    swipeTargetRef.current = null;
  };

  const handleDeleteTodo = (todoId: string) => {
    onDeleteTodo(todoId);
    setSwipedTodoId(null);
    setSwipeOffset(0);
  };

  const handleDeleteSubject = (subjectId: string) => {
    onDeleteSubject(subjectId);
    setSwipedSubjectId(null);
    setSwipeOffset(0);
  };

  const closeSwipe = () => {
    setSwipedTodoId(null);
    setSwipedSubjectId(null);
    setSwipeOffset(0);
  };

  return (
    <div className="bg-card border border-border rounded-[12px] flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-[12px] py-[10px] border-b border-border">
        <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider text-left">
          TASKS
        </span>
        <button
          onClick={() => setIsAddingSubject(true)}
          className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] hover:bg-accent transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* 과목 목록 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {subjects.length === 0 && !isAddingSubject ? (
          <div className="p-[16px]">
            <p className="text-[13px] text-muted-foreground text-left">
              과목을 추가하여 할 일을 관리하세요
            </p>
          </div>
        ) : (
          subjects.map(subject => {
            const subjectTodos = getTodosForSubject(subject.id);
            const isExpanded = expandedSubjects.has(subject.id);
            const completedCount = subjectTodos.filter(t => t.isCompleted).length;
            const isSubjectSwiped = swipedSubjectId === subject.id;

            return (
              <div key={subject.id} className="border-b border-border last:border-b-0 relative overflow-hidden">
                {/* 삭제 버튼 배경 (과목 전체) */}
                <div
                  className="absolute right-0 top-0 bottom-0 bg-destructive flex items-center justify-center"
                  style={{ width: `${SWIPE_THRESHOLD}px` }}
                >
                  <button
                    onClick={() => handleDeleteSubject(subject.id)}
                    className="w-full h-full flex items-center justify-center text-white"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>

                {/* 과목 전체 컨테이너 - 헤더 + 하위 할일들 함께 스와이프 */}
                <div
                  className="relative bg-card transition-transform"
                  style={{
                    transform: isSubjectSwiped ? `translateX(-${swipeOffset}px)` : 'translateX(0)',
                    transition: isSwipingRef.current ? 'none' : 'transform 0.2s ease-out'
                  }}
                  onTouchStart={(e) => {
                    // 할일 영역에서 시작한 스와이프가 아닌 경우에만 과목 스와이프
                    const target = e.target as HTMLElement;
                    if (!target.closest('[data-todo-item]')) {
                      handleSwipeStart(e, 'subject', subject.id);
                    }
                  }}
                  onTouchMove={handleSwipeMove}
                  onTouchEnd={handleSwipeEnd}
                  onMouseDown={(e) => {
                    const target = e.target as HTMLElement;
                    if (!target.closest('[data-todo-item]')) {
                      handleSwipeStart(e, 'subject', subject.id);
                    }
                  }}
                  onMouseMove={handleSwipeMove}
                  onMouseUp={handleSwipeEnd}
                  onMouseLeave={handleSwipeEnd}
                >
                  {/* 과목 헤더 버튼 */}
                  <button
                    onClick={() => {
                      if (!isSubjectSwiped) {
                        toggleSubjectExpand(subject.id);
                      } else {
                        closeSwipe();
                      }
                    }}
                    className="w-full flex items-center gap-[8px] px-[12px] py-[10px] hover:bg-accent/50 transition-colors text-left"
                  >
                    <div
                      className="w-[8px] h-[8px] rounded-full flex-shrink-0"
                      style={{ backgroundColor: subject.color }}
                    />
                    <span className="flex-1 text-[13px] font-medium text-left">
                      {subject.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {completedCount}/{subjectTodos.length}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {/* 펼쳐진 할 일 목록 - 과목과 함께 밀림 */}
                  {isExpanded && (
                    <div>
                      {subjectTodos.map(todo => {
                        const isTodoSwiped = swipedTodoId === todo.id;

                        return (
                          <div key={todo.id} className="relative overflow-hidden" data-todo-item>
                            {/* 삭제 버튼 배경 (개별 할일) */}
                            <div
                              className="absolute right-0 top-0 bottom-0 bg-destructive flex items-center justify-center"
                              style={{ width: `${SWIPE_THRESHOLD}px` }}
                            >
                              <button
                                onClick={() => handleDeleteTodo(todo.id)}
                                className="w-full h-full flex items-center justify-center text-white"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>

                            {/* 할일 아이템 - 개별 스와이프 가능 */}
                            <div
                              className="relative flex items-center gap-[8px] px-[12px] py-[8px] pl-[28px] transition-transform bg-muted"
                              style={{
                                transform: isTodoSwiped ? `translateX(-${swipeOffset}px)` : 'translateX(0)',
                                transition: isSwipingRef.current ? 'none' : 'transform 0.2s ease-out'
                              }}
                              onTouchStart={(e) => {
                                e.stopPropagation();
                                handleSwipeStart(e, 'todo', todo.id);
                              }}
                              onTouchMove={(e) => {
                                e.stopPropagation();
                                handleSwipeMove(e);
                              }}
                              onTouchEnd={(e) => {
                                e.stopPropagation();
                                handleSwipeEnd();
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleSwipeStart(e, 'todo', todo.id);
                              }}
                              onMouseMove={(e) => {
                                e.stopPropagation();
                                handleSwipeMove(e);
                              }}
                              onMouseUp={(e) => {
                                e.stopPropagation();
                                handleSwipeEnd();
                              }}
                              onMouseLeave={(e) => {
                                e.stopPropagation();
                                handleSwipeEnd();
                              }}
                            >
                              <button
                                onClick={() => {
                                  if (isTodoSwiped) {
                                    closeSwipe();
                                  } else {
                                    onToggleTodo(todo.id);
                                  }
                                }}
                                className={`w-[20px] h-[20px] rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                  todo.isCompleted
                                    ? 'bg-primary border-primary'
                                    : 'border-border hover:border-primary'
                                }`}
                              >
                                {todo.isCompleted && (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </button>

                              {editingTodoId === todo.id ? (
                                <div className="flex-1">
                                  <input
                                    ref={editInputRef}
                                    type="text"
                                    className="w-full text-[13px] bg-background border border-border rounded-[4px] px-[8px] py-[6px] outline-none focus:border-primary text-left"
                                    value={editTodoContent}
                                    onChange={(e) => setEditTodoContent(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleEditTodo(todo.id);
                                      if (e.key === 'Escape') {
                                        setEditTodoContent('');
                                        setEditingTodoId(null);
                                      }
                                    }}
                                  />
                                  <div className="flex justify-end gap-[8px] mt-[6px]">
                                    <button
                                      className="px-[10px] py-[4px] text-[11px] rounded-[4px] hover:bg-accent transition-colors"
                                      onClick={() => {
                                        setEditTodoContent('');
                                        setEditingTodoId(null);
                                      }}
                                    >
                                      취소
                                    </button>
                                    <button
                                      className="px-[10px] py-[4px] text-[11px] bg-primary text-primary-foreground rounded-[4px] hover:bg-primary/90 transition-colors"
                                      onClick={() => handleEditTodo(todo.id)}
                                    >
                                      완료
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    if (isTodoSwiped) {
                                      closeSwipe();
                                    } else {
                                      startEditTodo(todo);
                                    }
                                  }}
                                  className={`flex-1 text-[13px] text-left ${
                                    todo.isCompleted ? 'line-through text-muted-foreground' : ''
                                  }`}
                                >
                                  {todo.content}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* 할 일 추가 - 인라인 */}
                      {addingTodoSubjectId === subject.id ? (
                        <div className="px-[12px] py-[8px] pl-[28px] bg-muted">
                          <div className="flex items-center gap-[8px]">
                            <div className="w-[20px] h-[20px]" />
                            <input
                              ref={todoInputRef}
                              type="text"
                              className="flex-1 text-[13px] bg-background border border-border rounded-[4px] px-[8px] py-[6px] outline-none focus:border-primary text-left"
                              value={newTodoContent}
                              onChange={(e) => setNewTodoContent(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddTodo(subject.id);
                                if (e.key === 'Escape') {
                                  setNewTodoContent('');
                                  setAddingTodoSubjectId(null);
                                }
                              }}
                              placeholder="할 일 입력..."
                            />
                          </div>
                          <div className="flex justify-end gap-[8px] mt-[8px] ml-[28px]">
                            <button
                              className="px-[12px] py-[6px] text-[12px] rounded-[6px] hover:bg-accent transition-colors"
                              onClick={() => {
                                setNewTodoContent('');
                                setAddingTodoSubjectId(null);
                              }}
                            >
                              취소
                            </button>
                            <button
                              className="px-[12px] py-[6px] text-[12px] bg-primary text-primary-foreground rounded-[6px] hover:bg-primary/90 transition-colors"
                              onClick={() => handleAddTodo(subject.id)}
                            >
                              완료
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingTodoSubjectId(subject.id)}
                          className="w-full flex items-center gap-[8px] px-[12px] py-[8px] pl-[28px] text-[12px] text-muted-foreground hover:text-foreground bg-muted hover:bg-accent/50 transition-colors text-left"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          할 일 추가
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* 과목 추가 - 인라인 */}
        {isAddingSubject && (
          <div className="px-[12px] py-[8px] border-b border-border">
            <input
              ref={subjectInputRef}
              type="text"
              className="w-full text-[13px] bg-background border border-border rounded-[4px] px-[8px] py-[6px] outline-none focus:border-primary text-left"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddSubject();
                if (e.key === 'Escape') {
                  setNewSubjectName('');
                  setIsAddingSubject(false);
                }
              }}
              placeholder="과목명 입력..."
            />
            <div className="flex justify-end gap-[8px] mt-[8px]">
              <button
                className="px-[12px] py-[6px] text-[12px] rounded-[6px] hover:bg-accent transition-colors"
                onClick={() => {
                  setNewSubjectName('');
                  setIsAddingSubject(false);
                }}
              >
                취소
              </button>
              <button
                className="px-[12px] py-[6px] text-[12px] bg-primary text-primary-foreground rounded-[6px] hover:bg-primary/90 transition-colors"
                onClick={handleAddSubject}
              >
                완료
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

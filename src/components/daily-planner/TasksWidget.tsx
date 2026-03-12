import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Subject, Todo, SUBJECT_COLORS } from './types';

// 드래그 중인 데이터를 저장하는 전역 인터페이스
export interface DragData {
  todoId: string;
  subjectId: string;
  color: string;
  content: string;
}

// window 객체에 드래그 데이터 저장 (모듈 간 공유)
declare global {
  interface Window {
    __todoDragData?: DragData | null;
    __todoDragPosition?: { x: number; y: number } | null;
    __todoDragActive?: boolean;
  }
}

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

  // 색상 선택 상태
  const [colorPickerTodoId, setColorPickerTodoId] = useState<string | null>(null);
  const [colorPickerPosition, setColorPickerPosition] = useState<{ top: number; right: number } | null>(null);

  const subjectInputRef = useRef<HTMLInputElement>(null);
  const todoInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // 스와이프 참조
  const swipeStartX = useRef(0);
  const swipeCurrentX = useRef(0);
  const isSwipingRef = useRef(false);
  const swipeTargetRef = useRef<{ type: 'todo' | 'subject'; id: string } | null>(null);

  // 터치 드래그 상태 (타임라인으로 드래그)
  const [isDraggingToTimeline, setIsDraggingToTimeline] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [draggedTodo, setDraggedTodo] = useState<Todo | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const dragDirectionDecided = useRef(false);

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
    // 색상 선택 드롭다운 닫기
    if (colorPickerTodoId) {
      setColorPickerTodoId(null);
      setColorPickerPosition(null);
    }

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
    setColorPickerTodoId(null);
    setColorPickerPosition(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'Pretendard, sans-serif' }}>
      {/* 과목 카드 목록 */}
      {subjects.length === 0 && !isAddingSubject && (
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #eeeeec',
            borderRadius: '10px',
            padding: '16px',
          }}
        >
          <p style={{ fontSize: '14px', color: '#7c7875', textAlign: 'left' }}>
            과목을 추가하여 할 일을 관리하세요
          </p>
        </div>
      )}

      {subjects.map(subject => {
        const subjectTodos = getTodosForSubject(subject.id);
        const isExpanded = expandedSubjects.has(subject.id);
        const isSubjectSwiped = swipedSubjectId === subject.id;

        return (
          <div
            key={subject.id}
            style={{
              backgroundColor: 'white',
              border: '1px solid #eeeeec',
              borderRadius: '10px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* 삭제 버튼 배경 (과목 전체) */}
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: `${SWIPE_THRESHOLD}px`,
                backgroundColor: '#d4183d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <button
                onClick={() => handleDeleteSubject(subject.id)}
                style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>

            {/* 과목 컨테이너 - 스와이프 */}
            <div
              style={{
                position: 'relative',
                backgroundColor: 'white',
                transform: isSubjectSwiped ? `translateX(-${swipeOffset}px)` : 'translateX(0)',
                transition: isSwipingRef.current ? 'none' : 'transform 0.2s ease-out',
              }}
              onTouchStart={(e) => {
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
              {/* 과목 헤더 */}
              <button
                onClick={() => {
                  if (!isSubjectSwiped) {
                    toggleSubjectExpand(subject.id);
                  } else {
                    closeSwipe();
                  }
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: subject.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: '#5d5957' }}>
                  {subject.name}
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7c7875"
                  strokeWidth="2"
                  style={{
                    transition: 'transform 0.2s',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* 펼쳐진 투두 목록 */}
              {isExpanded && (
                <div style={{ padding: '0 12px 8px 12px' }}>
                  {subjectTodos.map(todo => {
                    const isTodoSwiped = swipedTodoId === todo.id;

                    return (
                      <div key={todo.id} style={{ position: 'relative', overflow: 'hidden' }} data-todo-item>
                        {/* 삭제 버튼 배경 */}
                        <div
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: `${SWIPE_THRESHOLD}px`,
                            backgroundColor: '#d4183d',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <button
                            onClick={() => handleDeleteTodo(todo.id)}
                            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>

                        {/* 투두 아이템 */}
                        <div
                          style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 0',
                            paddingLeft: '4px',
                            backgroundColor: 'white',
                            userSelect: 'none',
                            transform: isTodoSwiped ? `translateX(-${swipeOffset}px)` : 'translateX(0)',
                            transition: isSwipingRef.current ? 'none' : 'transform 0.2s ease-out',
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            touchStartPos.current = { x: e.clientX, y: e.clientY };
                            dragDirectionDecided.current = false;
                            swipeStartX.current = e.clientX;
                            swipeCurrentX.current = e.clientX;
                            isSwipingRef.current = true;
                            swipeTargetRef.current = { type: 'todo', id: todo.id };

                            const handleMouseMove = (moveE: MouseEvent) => {
                              if (!touchStartPos.current) return;
                              const deltaX = moveE.clientX - touchStartPos.current.x;
                              const deltaY = moveE.clientY - touchStartPos.current.y;

                              if (window.__todoDragActive) {
                                setDragPosition({ x: moveE.clientX, y: moveE.clientY });
                                window.__todoDragPosition = { x: moveE.clientX, y: moveE.clientY };
                                window.dispatchEvent(new CustomEvent('todoDragMove', { detail: { x: moveE.clientX, y: moveE.clientY } }));
                                return;
                              }

                              if (dragDirectionDecided.current && isSwipingRef.current && !window.__todoDragActive) {
                                swipeCurrentX.current = moveE.clientX;
                                const diff = swipeStartX.current - moveE.clientX;
                                if (diff > 0) {
                                  setSwipeOffset(Math.min(diff, SWIPE_THRESHOLD + 20));
                                  setSwipedTodoId(todo.id);
                                  setSwipedSubjectId(null);
                                }
                                return;
                              }

                              if (!dragDirectionDecided.current && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
                                dragDirectionDecided.current = true;
                                if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
                                  if (deltaX < 0) {
                                    swipeCurrentX.current = moveE.clientX;
                                    const diff = swipeStartX.current - moveE.clientX;
                                    if (diff > 0) {
                                      setSwipeOffset(Math.min(diff, SWIPE_THRESHOLD + 20));
                                      setSwipedTodoId(todo.id);
                                      setSwipedSubjectId(null);
                                    }
                                  }
                                } else {
                                  isSwipingRef.current = false;
                                  window.__todoDragData = { todoId: todo.id, subjectId: todo.subjectId, color: todo.color || '#86EFAC', content: todo.content };
                                  window.__todoDragActive = true;
                                  window.__todoDragPosition = { x: moveE.clientX, y: moveE.clientY };
                                  setIsDraggingToTimeline(true);
                                  setDraggedTodo(todo);
                                  setDragPosition({ x: moveE.clientX, y: moveE.clientY });
                                  window.dispatchEvent(new CustomEvent('todoDragMove', { detail: { x: moveE.clientX, y: moveE.clientY } }));
                                }
                              }
                            };

                            const handleMouseUp = () => {
                              if (window.__todoDragActive) {
                                const pos = window.__todoDragPosition;
                                if (pos) window.dispatchEvent(new CustomEvent('todoDrop', { detail: { x: pos.x, y: pos.y } }));
                                setTimeout(() => {
                                  setIsDraggingToTimeline(false);
                                  setDraggedTodo(null);
                                  setDragPosition(null);
                                  window.__todoDragData = null;
                                  window.__todoDragActive = false;
                                  window.__todoDragPosition = null;
                                }, 0);
                              } else if (isSwipingRef.current) {
                                const diff = swipeStartX.current - swipeCurrentX.current;
                                if (diff > SWIPE_THRESHOLD) {
                                  setSwipeOffset(SWIPE_THRESHOLD);
                                } else {
                                  setSwipedTodoId(null);
                                  setSwipedSubjectId(null);
                                  setSwipeOffset(0);
                                }
                              }
                              isSwipingRef.current = false;
                              swipeTargetRef.current = null;
                              touchStartPos.current = null;
                              dragDirectionDecided.current = false;
                              document.removeEventListener('mousemove', handleMouseMove);
                              document.removeEventListener('mouseup', handleMouseUp);
                            };

                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                            const touch = e.touches[0];
                            touchStartPos.current = { x: touch.clientX, y: touch.clientY };
                            dragDirectionDecided.current = false;
                            handleSwipeStart(e, 'todo', todo.id);
                          }}
                          onTouchMove={(e) => {
                            e.stopPropagation();
                            const touch = e.touches[0];
                            if (!touchStartPos.current) return;
                            const deltaX = touch.clientX - touchStartPos.current.x;
                            const deltaY = touch.clientY - touchStartPos.current.y;

                            if (window.__todoDragActive) {
                              e.preventDefault();
                              setDragPosition({ x: touch.clientX, y: touch.clientY });
                              window.__todoDragPosition = { x: touch.clientX, y: touch.clientY };
                              window.dispatchEvent(new CustomEvent('todoDragMove', { detail: { x: touch.clientX, y: touch.clientY } }));
                              return;
                            }
                            if (dragDirectionDecided.current) { handleSwipeMove(e); return; }
                            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                              dragDirectionDecided.current = true;
                              if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
                                handleSwipeMove(e);
                              } else {
                                e.preventDefault();
                                window.__todoDragData = { todoId: todo.id, subjectId: todo.subjectId, color: todo.color || '#86EFAC', content: todo.content };
                                window.__todoDragActive = true;
                                window.__todoDragPosition = { x: touch.clientX, y: touch.clientY };
                                setIsDraggingToTimeline(true);
                                setDraggedTodo(todo);
                                setDragPosition({ x: touch.clientX, y: touch.clientY });
                                window.dispatchEvent(new CustomEvent('todoDragMove', { detail: { x: touch.clientX, y: touch.clientY } }));
                              }
                            }
                          }}
                          onTouchEnd={(e) => {
                            e.stopPropagation();
                            if (isDraggingToTimeline || window.__todoDragActive) {
                              const pos = window.__todoDragPosition;
                              if (pos) window.dispatchEvent(new CustomEvent('todoDrop', { detail: { x: pos.x, y: pos.y } }));
                              setTimeout(() => {
                                setIsDraggingToTimeline(false);
                                setDraggedTodo(null);
                                setDragPosition(null);
                                window.__todoDragData = null;
                                window.__todoDragActive = false;
                                window.__todoDragPosition = null;
                              }, 0);
                            } else {
                              handleSwipeEnd();
                            }
                            touchStartPos.current = null;
                            dragDirectionDecided.current = false;
                          }}
                        >
                          {/* 체크박스 (피그마 □ 스타일) */}
                          <button
                            onClick={() => {
                              if (isTodoSwiped) { closeSwipe(); } else { onToggleTodo(todo.id); }
                            }}
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '3px',
                              border: todo.isCompleted ? '2px solid #5d5957' : '1.5px solid #b0ada9',
                              backgroundColor: todo.isCompleted ? '#5d5957' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            {todo.isCompleted && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </button>

                          {editingTodoId === todo.id ? (
                            <div style={{ flex: 1 }}>
                              <input
                                ref={editInputRef}
                                type="text"
                                style={{
                                  width: '100%',
                                  fontSize: '13px',
                                  border: '1px solid #eeeeec',
                                  borderRadius: '6px',
                                  padding: '6px 8px',
                                  outline: 'none',
                                  fontFamily: 'Pretendard, sans-serif',
                                }}
                                value={editTodoContent}
                                onChange={(e) => setEditTodoContent(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.nativeEvent.isComposing) return;
                                  if (e.key === 'Enter') handleEditTodo(todo.id);
                                  if (e.key === 'Escape') { setEditTodoContent(''); setEditingTodoId(null); }
                                }}
                              />
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                if (isTodoSwiped) { closeSwipe(); } else { startEditTodo(todo); }
                              }}
                              style={{
                                flex: 1,
                                fontSize: '13px',
                                color: todo.isCompleted ? '#b0ada9' : '#5d5957',
                                textDecoration: todo.isCompleted ? 'line-through' : 'none',
                                textAlign: 'left',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                fontFamily: 'Pretendard, sans-serif',
                              }}
                            >
                              {todo.content}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* 투두 추가 */}
                  {addingTodoSubjectId === subject.id ? (
                    <div style={{ padding: '6px 0 0 4px' }}>
                      <input
                        ref={todoInputRef}
                        type="text"
                        style={{
                          width: '100%',
                          fontSize: '13px',
                          border: '1px solid #eeeeec',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          outline: 'none',
                          fontFamily: 'Pretendard, sans-serif',
                        }}
                        value={newTodoContent}
                        onChange={(e) => setNewTodoContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.nativeEvent.isComposing) return;
                          if (e.key === 'Enter') handleAddTodo(subject.id);
                          if (e.key === 'Escape') { setNewTodoContent(''); setAddingTodoSubjectId(null); }
                        }}
                        placeholder="할 일 입력..."
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingTodoSubjectId(subject.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 0 0 4px',
                        fontSize: '13px',
                        color: '#b0ada9',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'Pretendard, sans-serif',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* 과목 추가 */}
      {isAddingSubject ? (
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #eeeeec',
            borderRadius: '10px',
            padding: '12px',
          }}
        >
          <input
            ref={subjectInputRef}
            type="text"
            style={{
              width: '100%',
              fontSize: '14px',
              border: '1px solid #eeeeec',
              borderRadius: '6px',
              padding: '8px',
              outline: 'none',
              fontFamily: 'Pretendard, sans-serif',
            }}
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return;
              if (e.key === 'Enter') handleAddSubject();
              if (e.key === 'Escape') { setNewSubjectName(''); setIsAddingSubject(false); }
            }}
            placeholder="과목명 입력..."
          />
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
          <button
            onClick={() => setIsAddingSubject(true)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7c7875',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      )}

      {/* 색상 선택 드롭다운 */}
      {colorPickerTodoId && colorPickerPosition && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            onClick={() => { setColorPickerTodoId(null); setColorPickerPosition(null); }}
          />
          <div
            style={{
              position: 'fixed',
              zIndex: 50,
              backgroundColor: 'white',
              border: '1px solid #eeeeec',
              borderRadius: '8px',
              padding: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              top: `${colorPickerPosition.top}px`,
              right: `${colorPickerPosition.right}px`,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
              {SUBJECT_COLORS.map((color) => {
                const currentTodo = todos.find(t => t.id === colorPickerTodoId);
                return (
                  <button
                    key={color}
                    onClick={() => {
                      onUpdateTodo(colorPickerTodoId, { color });
                      setColorPickerTodoId(null);
                      setColorPickerPosition(null);
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: currentTodo?.color === color ? '2px solid #5d5957' : '2px solid transparent',
                      backgroundColor: color,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 드래그 프리뷰 */}
      {isDraggingToTimeline && createPortal(
        <div
          style={{
            position: 'fixed',
            zIndex: 9999,
            pointerEvents: 'none',
            left: dragPosition ? `${dragPosition.x - 40}px` : '50%',
            top: dragPosition ? `${dragPosition.y - 20}px` : '50%',
          }}
        >
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              color: 'white',
              fontSize: '13px',
              fontWeight: 500,
              border: '2px solid white',
              backgroundColor: draggedTodo?.color || '#86EFAC',
              fontFamily: 'Pretendard, sans-serif',
            }}
          >
            {draggedTodo?.content || '드래그 중...'}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

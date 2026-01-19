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

  const subjectInputRef = useRef<HTMLInputElement>(null);
  const todoInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

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
      <div className="flex-1 overflow-y-auto">
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

            return (
              <div key={subject.id} className="border-b border-border last:border-b-0">
                {/* 과목 헤더 버튼 */}
                <button
                  onClick={() => toggleSubjectExpand(subject.id)}
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

                {/* 펼쳐진 할 일 목록 */}
                {isExpanded && (
                  <div className="bg-accent/20">
                    {subjectTodos.map(todo => (
                      <div
                        key={todo.id}
                        className="flex items-center gap-[8px] px-[12px] py-[8px] pl-[28px]"
                      >
                        <button
                          onClick={() => onToggleTodo(todo.id)}
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
                          <input
                            ref={editInputRef}
                            type="text"
                            className="flex-1 text-[13px] bg-background border border-border rounded-[4px] px-[8px] py-[4px] outline-none focus:border-primary text-left"
                            value={editTodoContent}
                            onChange={(e) => setEditTodoContent(e.target.value)}
                            onBlur={() => handleEditTodo(todo.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditTodo(todo.id);
                              if (e.key === 'Escape') {
                                setEditTodoContent('');
                                setEditingTodoId(null);
                              }
                            }}
                          />
                        ) : (
                          <button
                            onClick={() => startEditTodo(todo)}
                            className={`flex-1 text-[13px] text-left ${
                              todo.isCompleted ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {todo.content}
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteTodo(todo.id)}
                          className="w-[24px] h-[24px] flex items-center justify-center rounded-[4px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))}

                    {/* 할 일 추가 - 인라인 */}
                    {addingTodoSubjectId === subject.id ? (
                      <div className="flex items-center gap-[8px] px-[12px] py-[8px] pl-[28px]">
                        <div className="w-[20px] h-[20px]" />
                        <input
                          ref={todoInputRef}
                          type="text"
                          className="flex-1 text-[13px] bg-background border border-border rounded-[4px] px-[8px] py-[4px] outline-none focus:border-primary text-left"
                          value={newTodoContent}
                          onChange={(e) => setNewTodoContent(e.target.value)}
                          onBlur={() => handleAddTodo(subject.id)}
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
                    ) : (
                      <button
                        onClick={() => setAddingTodoSubjectId(subject.id)}
                        className="w-full flex items-center gap-[8px] px-[12px] py-[8px] pl-[28px] text-[12px] text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors text-left"
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
              onBlur={handleAddSubject}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddSubject();
                if (e.key === 'Escape') {
                  setNewSubjectName('');
                  setIsAddingSubject(false);
                }
              }}
              placeholder="과목명 입력..."
            />
          </div>
        )}
      </div>
    </div>
  );
}

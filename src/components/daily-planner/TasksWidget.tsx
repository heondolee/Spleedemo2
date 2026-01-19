import { useState } from 'react';
import { Subject, Todo, SUBJECT_COLORS } from './types';

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
  onUpdateSubject,
  onDeleteSubject,
  onAddTodo,
  onUpdateTodo,
  onDeleteTodo,
  onToggleTodo,
}: TasksWidgetProps) {
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAddTodoModal, setShowAddTodoModal] = useState<string | null>(null);
  const [showEditTodoModal, setShowEditTodoModal] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newTodoContent, setNewTodoContent] = useState('');
  const [editTodoContent, setEditTodoContent] = useState('');
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

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
      setShowAddSubjectModal(false);
    }
  };

  const handleAddTodo = (subjectId: string) => {
    if (newTodoContent.trim()) {
      onAddTodo(subjectId, newTodoContent.trim());
      setNewTodoContent('');
      setShowAddTodoModal(null);
    }
  };

  const handleEditTodo = (todoId: string) => {
    if (editTodoContent.trim()) {
      onUpdateTodo(todoId, { content: editTodoContent.trim() });
      setEditTodoContent('');
      setShowEditTodoModal(null);
    }
  };

  const openEditTodo = (todo: Todo) => {
    setEditTodoContent(todo.content);
    setShowEditTodoModal(todo.id);
  };

  return (
    <div className="bg-card border border-border rounded-[12px] flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-[12px] py-[10px] border-b border-border">
        <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
          TASKS
        </span>
        <button
          onClick={() => setShowAddSubjectModal(true)}
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
        {subjects.length === 0 ? (
          <div className="flex items-center justify-center h-full p-[20px]">
            <p className="text-[13px] text-muted-foreground text-center">
              과목을 추가하여<br />할 일을 관리하세요
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
                  className="w-full flex items-center gap-[8px] px-[12px] py-[10px] hover:bg-accent/50 transition-colors"
                >
                  {/* 색상 표시 */}
                  <div
                    className="w-[8px] h-[8px] rounded-full flex-shrink-0"
                    style={{ backgroundColor: subject.color }}
                  />
                  {/* 과목명 */}
                  <span className="flex-1 text-[13px] font-medium text-left">
                    {subject.name}
                  </span>
                  {/* 진행 상황 */}
                  <span className="text-[11px] text-muted-foreground">
                    {completedCount}/{subjectTodos.length}
                  </span>
                  {/* 펼침 화살표 */}
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
                        {/* 체크 버튼 */}
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

                        {/* 내용 (클릭하면 편집) */}
                        <button
                          onClick={() => openEditTodo(todo)}
                          className={`flex-1 text-[13px] text-left ${
                            todo.isCompleted ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {todo.content}
                        </button>

                        {/* 삭제 버튼 */}
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

                    {/* 할 일 추가 버튼 */}
                    <button
                      onClick={() => setShowAddTodoModal(subject.id)}
                      className="w-full flex items-center gap-[8px] px-[12px] py-[8px] pl-[28px] text-[12px] text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      할 일 추가
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 과목 추가 모달 */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background rounded-[16px] p-[20px] shadow-xl" style={{ width: '280px' }}>
            <h3 className="text-[16px] font-medium mb-[12px]">과목 추가</h3>
            <input
              type="text"
              className="w-full px-[12px] py-[10px] border border-border rounded-[8px] text-[14px] bg-input-background"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="과목명 입력"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
            />
            <div className="flex justify-end gap-[8px] mt-[12px]">
              <button
                className="px-[12px] py-[8px] text-[13px] rounded-[8px] hover:bg-accent transition-colors"
                onClick={() => {
                  setNewSubjectName('');
                  setShowAddSubjectModal(false);
                }}
              >
                취소
              </button>
              <button
                className="px-[12px] py-[8px] text-[13px] bg-primary text-primary-foreground rounded-[8px] hover:bg-primary/90 transition-colors"
                onClick={handleAddSubject}
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 할 일 추가 모달 */}
      {showAddTodoModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background rounded-[16px] p-[20px] shadow-xl" style={{ width: '280px' }}>
            <h3 className="text-[16px] font-medium mb-[12px]">할 일 추가</h3>
            <input
              type="text"
              className="w-full px-[12px] py-[10px] border border-border rounded-[8px] text-[14px] bg-input-background"
              value={newTodoContent}
              onChange={(e) => setNewTodoContent(e.target.value)}
              placeholder="할 일 입력"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddTodo(showAddTodoModal)}
            />
            <div className="flex justify-end gap-[8px] mt-[12px]">
              <button
                className="px-[12px] py-[8px] text-[13px] rounded-[8px] hover:bg-accent transition-colors"
                onClick={() => {
                  setNewTodoContent('');
                  setShowAddTodoModal(null);
                }}
              >
                취소
              </button>
              <button
                className="px-[12px] py-[8px] text-[13px] bg-primary text-primary-foreground rounded-[8px] hover:bg-primary/90 transition-colors"
                onClick={() => handleAddTodo(showAddTodoModal)}
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 할 일 편집 모달 */}
      {showEditTodoModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background rounded-[16px] p-[20px] shadow-xl" style={{ width: '280px' }}>
            <h3 className="text-[16px] font-medium mb-[12px]">할 일 수정</h3>
            <input
              type="text"
              className="w-full px-[12px] py-[10px] border border-border rounded-[8px] text-[14px] bg-input-background"
              value={editTodoContent}
              onChange={(e) => setEditTodoContent(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleEditTodo(showEditTodoModal)}
            />
            <div className="flex justify-end gap-[8px] mt-[12px]">
              <button
                className="px-[12px] py-[8px] text-[13px] rounded-[8px] hover:bg-accent transition-colors"
                onClick={() => {
                  setEditTodoContent('');
                  setShowEditTodoModal(null);
                }}
              >
                취소
              </button>
              <button
                className="px-[12px] py-[8px] text-[13px] bg-primary text-primary-foreground rounded-[8px] hover:bg-primary/90 transition-colors"
                onClick={() => handleEditTodo(showEditTodoModal)}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

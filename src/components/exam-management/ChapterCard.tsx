import { useState, useRef, useEffect, ReactNode } from 'react';
import { Chapter } from './types';
import { AddPlaceholder } from './ExamManagementSheet';
import type { useExamState } from './useExamState';

const SWIPE_THRESHOLD = 80;

interface ChapterCardProps {
  chapter: Chapter;
  index: number;
  state: ReturnType<typeof useExamState>;
}

export function ChapterCard({ chapter, index, state }: ChapterCardProps) {
  const {
    addSection, updateSection, deleteSection,
    addSubsection, updateSubsection, deleteSubsection,
    addTask, updateTask, deleteTask, toggleTask,
    updateChapter, deleteChapter,
  } = state;

  const [isAddMode, setIsAddMode] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '268px' }}>
      {/* 대단원 카드 전체를 SwipeContainer로 감싸기 */}
      <SwipeContainer
        onEdit={(startEdit) => {
          startEdit();
        }}
        onEditSubmit={(name) => updateChapter(chapter.id, name)}
        onDelete={() => deleteChapter(chapter.id)}
        disabled={isAddMode}
        editValue={chapter.name}
        borderRadius="15px"
      >
        {(editState) => (
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid #d0d0d0',
              borderRadius: '15px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '11px',
            }}
          >
            {/* Chapter Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              {editState.isEditing ? (
                <input
                  ref={editState.inputRef}
                  type="text"
                  value={editState.value}
                  onChange={e => editState.setValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') editState.submit(); if (e.key === 'Escape') editState.cancel(); }}
                  onBlur={editState.submit}
                  style={{
                    flex: 1, fontSize: '14px', fontWeight: 500, color: '#7c7875',
                    border: 'none', borderBottom: '1px solid #d0d0d0', outline: 'none',
                    background: 'transparent', fontFamily: 'Pretendard, sans-serif', padding: '2px 0',
                  }}
                />
              ) : (
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#7c7875' }}>
                  {index}. {chapter.name}
                </span>
              )}
              {!editState.isEditing && (
                isAddMode ? (
                  <button
                    onClick={() => setIsAddMode(false)}
                    style={{
                      height: '28px', padding: '0 12px', borderRadius: '21px', border: 'none',
                      background: 'linear-gradient(90deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.2) 100%), linear-gradient(90deg, #5d5957 0%, #5d5957 100%)',
                      color: 'white', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                      fontFamily: 'Pretendard, sans-serif', boxShadow: '0px 0px 4px 0px rgba(0,0,0,0.1)',
                    }}
                  >
                    완료
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAddMode(true)}
                    style={{
                      width: '25px', height: '25px', border: '1px solid #d0d0d0', borderRadius: '15px',
                      background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c7875" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                )
              )}
            </div>

            {/* Sections (중단원) */}
            {chapter.sections.map((section, secIdx) => (
              <div key={section.id} style={{ paddingLeft: '10px' }}>
                <SwipeContainer
                  onEditSubmit={(name) => updateSection(chapter.id, section.id, name)}
                  onDelete={() => deleteSection(chapter.id, section.id)}
                  disabled={isAddMode}
                  editValue={section.name}
                  borderRadius="5px"
                >
                  {(secEdit) => (
                    <div style={{ backgroundColor: '#f5f5f5', borderRadius: '5px', padding: '8px 5px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* Section header */}
                      {secEdit.isEditing ? (
                        <input
                          ref={secEdit.inputRef}
                          type="text"
                          value={secEdit.value}
                          onChange={e => secEdit.setValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') secEdit.submit(); if (e.key === 'Escape') secEdit.cancel(); }}
                          onBlur={secEdit.submit}
                          style={{
                            fontSize: '14px', fontWeight: 500, color: '#4a4846',
                            border: 'none', borderBottom: '1px solid #d0d0d0', outline: 'none',
                            background: 'transparent', fontFamily: 'Pretendard, sans-serif', padding: '2px 0',
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#4a4846' }}>
                          [ {secIdx + 1} ] {section.name}
                        </span>
                      )}

                      {/* Subsections (소단원) */}
                      {section.subsections.map((sub, subIdx) => (
                        <div key={sub.id} style={{ paddingLeft: '10px' }}>
                          <SwipeContainer
                            onEditSubmit={(name) => updateSubsection(chapter.id, section.id, sub.id, name)}
                            onDelete={() => deleteSubsection(chapter.id, section.id, sub.id)}
                            disabled={isAddMode}
                            editValue={sub.name}
                            borderRadius="5px"
                          >
                            {(subEdit) => (
                              <div style={{
                                backgroundColor: 'white', border: '1px solid #d0d0d0', borderRadius: '5px',
                                padding: '5px 8px', display: 'flex', flexDirection: 'column', gap: '5px',
                              }}>
                                {/* Subsection header */}
                                {subEdit.isEditing ? (
                                  <input
                                    ref={subEdit.inputRef}
                                    type="text"
                                    value={subEdit.value}
                                    onChange={e => subEdit.setValue(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') subEdit.submit(); if (e.key === 'Escape') subEdit.cancel(); }}
                                    onBlur={subEdit.submit}
                                    style={{
                                      fontSize: '14px', fontWeight: 500, color: '#4a4846',
                                      border: 'none', borderBottom: '1px solid #d0d0d0', outline: 'none',
                                      background: 'transparent', fontFamily: 'Pretendard, sans-serif', padding: '2px 0',
                                    }}
                                  />
                                ) : (
                                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#4a4846' }}>
                                    {subIdx + 1} ) {sub.name}
                                  </span>
                                )}

                                {/* Tasks (할일) */}
                                {sub.tasks.map(task => (
                                  <div key={task.id} style={{ paddingLeft: '10px' }}>
                                    <SwipeContainer
                                      onEditSubmit={(name) => updateTask(chapter.id, section.id, sub.id, task.id, name)}
                                      onDelete={() => deleteTask(chapter.id, section.id, sub.id, task.id)}
                                      disabled={isAddMode}
                                      editValue={task.name}
                                      borderRadius="5px"
                                    >
                                      {(taskEdit) => (
                                        <div style={{
                                          backgroundColor: '#f5f5f5', borderRadius: '5px', padding: '3px',
                                          display: 'flex', alignItems: 'center', gap: '3px',
                                        }}>
                                          <button
                                            onClick={(e) => { e.stopPropagation(); toggleTask(chapter.id, section.id, sub.id, task.id); }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '14px', color: task.isCompleted ? '#5d5957' : '#b0ada9', lineHeight: 1 }}
                                          >
                                            {task.isCompleted ? '☑' : '□'}
                                          </button>
                                          {taskEdit.isEditing ? (
                                            <input
                                              ref={taskEdit.inputRef}
                                              type="text"
                                              value={taskEdit.value}
                                              onChange={e => taskEdit.setValue(e.target.value)}
                                              onKeyDown={e => { if (e.key === 'Enter') taskEdit.submit(); if (e.key === 'Escape') taskEdit.cancel(); }}
                                              onBlur={taskEdit.submit}
                                              style={{
                                                flex: 1, fontSize: '14px', fontWeight: 500, color: '#4a4846',
                                                border: 'none', borderBottom: '1px solid #d0d0d0', outline: 'none',
                                                background: 'transparent', fontFamily: 'Pretendard, sans-serif',
                                              }}
                                            />
                                          ) : (
                                            <span style={{
                                              fontSize: '14px', fontWeight: 500, color: task.isCompleted ? '#b0ada9' : '#4a4846',
                                              textDecoration: task.isCompleted ? 'line-through' : 'none',
                                            }}>
                                              {task.name}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </SwipeContainer>
                                  </div>
                                ))}

                                {/* Add task (inside subsection) */}
                                {isAddMode && (
                                  <div style={{ paddingLeft: '10px' }}>
                                    <InlineAdd
                                      placeholder="할일 추가"
                                      prefix="□"
                                      onAdd={(name) => addTask(chapter.id, section.id, sub.id, name)}
                                      bgColor="white"
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </SwipeContainer>
                        </div>
                      ))}

                      {/* Add task (dashed, outside subsection) */}
                      {isAddMode && (
                        <div style={{ paddingLeft: '10px' }}>
                          <DashedAdd
                            label="할일 추가"
                            prefix="□"
                            onAdd={(name) => {
                              if (section.subsections.length === 0) {
                                addSubsection(chapter.id, section.id, '기본');
                              }
                              const lastSub = section.subsections[section.subsections.length - 1];
                              if (lastSub) addTask(chapter.id, section.id, lastSub.id, name);
                            }}
                          />
                        </div>
                      )}

                      {/* Add subsection */}
                      {isAddMode && (
                        <div style={{ paddingLeft: '10px' }}>
                          <DashedAdd label="소단원 추가" onAdd={(name) => addSubsection(chapter.id, section.id, name)} />
                        </div>
                      )}
                    </div>
                  )}
                </SwipeContainer>
              </div>
            ))}

            {/* Add section (중단원) */}
            {isAddMode && (
              <div style={{ paddingLeft: '10px' }}>
                <DashedAdd label="중단원 추가" onAdd={(name) => addSection(chapter.id, name)} />
              </div>
            )}
          </div>
        )}
      </SwipeContainer>

      {/* Add chapter (대단원) - outside card */}
      {isAddMode && (
        <AddPlaceholder label="대단원 추가" onAdd={(name) => state.addChapter(name)} rounded="10px" />
      )}
    </div>
  );
}

/* =========================================
   SwipeContainer — 전체 컨테이너를 슬라이드
   ========================================= */
interface EditState {
  isEditing: boolean;
  value: string;
  setValue: (v: string) => void;
  submit: () => void;
  cancel: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

function SwipeContainer({
  children,
  onEditSubmit,
  onDelete,
  disabled,
  editValue,
  borderRadius = '5px',
}: {
  children: (editState: EditState) => ReactNode;
  onEdit?: (startEdit: () => void) => void;
  onEditSubmit: (name: string) => void;
  onDelete: () => void;
  disabled?: boolean;
  editValue: string;
  borderRadius?: string;
}) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(editValue);
  const swipeStartX = useRef(0);
  const swipeCurrentX = useRef(0);
  const isSwipingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEdit = () => {
    setValue(editValue);
    setIsEditing(true);
    setIsSwiped(false);
    setSwipeOffset(0);
  };

  const handleSubmit = () => {
    if (value.trim() && value.trim() !== editValue) {
      onEditSubmit(value.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValue(editValue);
  };

  const handleSwipeStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (disabled || isEditing) return;
    e.stopPropagation();
    if (isSwiped) { setIsSwiped(false); setSwipeOffset(0); return; }
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    swipeStartX.current = clientX;
    swipeCurrentX.current = clientX;
    isSwipingRef.current = true;
  };

  const handleSwipeMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isSwipingRef.current) return;
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    swipeCurrentX.current = clientX;
    const diff = swipeStartX.current - clientX;
    if (diff > 0) {
      setSwipeOffset(Math.min(diff, SWIPE_THRESHOLD + 20));
      setIsSwiped(true);
    }
  };

  const handleSwipeEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isSwipingRef.current) return;
    e.stopPropagation();
    isSwipingRef.current = false;
    if (swipeOffset > SWIPE_THRESHOLD / 2) {
      setSwipeOffset(SWIPE_THRESHOLD);
    } else {
      setIsSwiped(false);
      setSwipeOffset(0);
    }
  };

  const editState: EditState = {
    isEditing,
    value,
    setValue,
    submit: handleSubmit,
    cancel: handleCancel,
    inputRef,
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius }}>
      {/* 수정/삭제 버튼 (뒤에 깔림) */}
      {!disabled && (
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: `${SWIPE_THRESHOLD}px`, display: 'flex', zIndex: 1,
        }}>
          <button
            onClick={startEdit}
            style={{ flex: 1, background: '#5d5957', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500, fontFamily: 'Pretendard, sans-serif' }}
          >
            수정
          </button>
          <button
            onClick={() => { onDelete(); setIsSwiped(false); setSwipeOffset(0); }}
            style={{ flex: 1, background: '#d4183d', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500, fontFamily: 'Pretendard, sans-serif' }}
          >
            삭제
          </button>
        </div>
      )}

      {/* 전체 컨테이너 (슬라이드됨) */}
      <div
        onTouchStart={handleSwipeStart}
        onTouchMove={handleSwipeMove}
        onTouchEnd={handleSwipeEnd}
        onMouseDown={handleSwipeStart}
        onMouseMove={handleSwipeMove}
        onMouseUp={handleSwipeEnd}
        onMouseLeave={() => { if (!isSwipingRef.current) return; isSwipingRef.current = false; if (swipeOffset > SWIPE_THRESHOLD / 2) { setSwipeOffset(SWIPE_THRESHOLD); } else { setIsSwiped(false); setSwipeOffset(0); } }}
        style={{
          position: 'relative',
          zIndex: 2,
          transform: isSwiped ? `translateX(-${swipeOffset}px)` : 'translateX(0)',
          transition: isSwipingRef.current ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {children(editState)}
      </div>
    </div>
  );
}

/* =========================================
   InlineAdd — 할일 추가 (solid bg)
   ========================================= */
function InlineAdd({ placeholder, prefix, onAdd, bgColor = 'white' }: { placeholder: string; prefix?: string; onAdd: (name: string) => void; bgColor?: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (isEditing && inputRef.current) inputRef.current.focus(); }, [isEditing]);

  const handleSubmit = () => {
    if (value.trim()) { onAdd(value.trim()); setValue(''); } else { setIsEditing(false); }
  };

  if (isEditing) {
    return (
      <div style={{ backgroundColor: bgColor, borderRadius: '5px', padding: '3px', display: 'flex', alignItems: 'center', gap: '3px', width: '100%' }}>
        {prefix && <span style={{ fontSize: '14px', color: '#d0d0d0' }}>{prefix}</span>}
        <input ref={inputRef} type="text" value={value} onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') { setValue(''); setIsEditing(false); } }}
          onBlur={handleSubmit} placeholder={placeholder}
          style={{ flex: 1, fontSize: '14px', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Pretendard, sans-serif' }}
        />
      </div>
    );
  }

  return (
    <button onClick={() => setIsEditing(true)} style={{
      backgroundColor: bgColor, borderRadius: '5px', padding: '3px', display: 'flex', alignItems: 'center', gap: '3px',
      width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif',
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      {prefix && <span style={{ fontSize: '14px', color: '#d0d0d0' }}>{prefix}</span>}
      <span style={{ fontSize: '14px', color: '#d0d0d0', fontWeight: 500 }}>{placeholder}</span>
    </button>
  );
}

/* =========================================
   DashedAdd — dashed border placeholder
   ========================================= */
function DashedAdd({ label, prefix, onAdd }: { label: string; prefix?: string; onAdd: (name: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (isEditing && inputRef.current) inputRef.current.focus(); }, [isEditing]);

  const handleSubmit = () => {
    if (value.trim()) { onAdd(value.trim()); setValue(''); } else { setIsEditing(false); }
  };

  if (isEditing) {
    return (
      <div style={{ border: '1px dashed #d0d0d0', borderRadius: '5px', padding: '3px', display: 'flex', alignItems: 'center', gap: '3px', width: '100%' }}>
        {prefix && <span style={{ fontSize: '14px', color: '#d0d0d0' }}>{prefix}</span>}
        <input ref={inputRef} type="text" value={value} onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') { setValue(''); setIsEditing(false); } }}
          onBlur={handleSubmit} placeholder={label}
          style={{ flex: 1, fontSize: '14px', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Pretendard, sans-serif' }}
        />
      </div>
    );
  }

  return (
    <button onClick={() => setIsEditing(true)} style={{
      border: '1px dashed #d0d0d0', borderRadius: '5px', padding: '3px', display: 'flex', alignItems: 'center', gap: '2px',
      width: '100%', height: '24px', background: 'none', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif',
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      {prefix && <span style={{ fontSize: '14px', color: '#d0d0d0' }}>{prefix}</span>}
      <span style={{ fontSize: '14px', color: '#d0d0d0', fontWeight: 500 }}>{label}</span>
    </button>
  );
}

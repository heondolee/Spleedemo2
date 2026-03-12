import { useState, useRef, useEffect } from 'react';
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
      {/* Chapter Card */}
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #d0d0d0',
          borderRadius: '15px',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '11px',
          overflow: 'hidden',
        }}
      >
        {/* Chapter Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#7c7875' }}>
            {index}. {chapter.name}
          </span>
          {isAddMode ? (
            <button
              onClick={() => setIsAddMode(false)}
              style={{
                height: '28px',
                padding: '0 12px',
                borderRadius: '21px',
                border: 'none',
                background: 'linear-gradient(90deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.2) 100%), linear-gradient(90deg, #5d5957 0%, #5d5957 100%)',
                color: 'white',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'Pretendard, sans-serif',
                boxShadow: '0px 0px 4px 0px rgba(0,0,0,0.1)',
              }}
            >
              완료
            </button>
          ) : (
            <button
              onClick={() => setIsAddMode(true)}
              style={{
                width: '25px',
                height: '25px',
                border: '1px solid #d0d0d0',
                borderRadius: '15px',
                background: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c7875" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          )}
        </div>

        {/* Sections (중단원) */}
        {chapter.sections.map((section, secIdx) => (
          <div key={section.id} style={{ paddingLeft: '10px' }}>
            <div style={{ backgroundColor: '#f5f5f5', borderRadius: '5px', padding: '8px 5px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Section header */}
              <SwipeItem
                label={`[ ${secIdx + 1} ] ${section.name}`}
                labelStyle={{ fontSize: '14px', fontWeight: 500, color: '#4a4846' }}
                onEdit={(newName) => updateSection(chapter.id, section.id, newName)}
                onDelete={() => deleteSection(chapter.id, section.id)}
                disabled={isAddMode}
              />

              {/* Subsections (소단원) */}
              {section.subsections.map((sub, subIdx) => (
                <div key={sub.id} style={{ paddingLeft: '10px' }}>
                  <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #d0d0d0',
                    borderRadius: '5px',
                    padding: '5px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                  }}>
                    {/* Subsection header */}
                    <SwipeItem
                      label={`${subIdx + 1} ) ${sub.name}`}
                      labelStyle={{ fontSize: '14px', fontWeight: 500, color: '#4a4846' }}
                      onEdit={(newName) => updateSubsection(chapter.id, section.id, sub.id, newName)}
                      onDelete={() => deleteSubsection(chapter.id, section.id, sub.id)}
                      disabled={isAddMode}
                    />

                    {/* Tasks (할일) */}
                    {sub.tasks.map(task => (
                      <div key={task.id} style={{ paddingLeft: '10px' }}>
                        <SwipeItem
                          label={task.name}
                          isTask
                          isCompleted={task.isCompleted}
                          onToggle={() => toggleTask(chapter.id, section.id, sub.id, task.id)}
                          onEdit={(newName) => updateTask(chapter.id, section.id, sub.id, task.id, newName)}
                          onDelete={() => deleteTask(chapter.id, section.id, sub.id, task.id)}
                          disabled={isAddMode}
                        />
                      </div>
                    ))}

                    {/* Add task placeholder (inside subsection) */}
                    {isAddMode && (
                      <div style={{ paddingLeft: '10px' }}>
                        <AddTaskPlaceholder
                          onAdd={(name) => addTask(chapter.id, section.id, sub.id, name)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Add task placeholder (outside subsection, dashed) */}
              {isAddMode && (
                <div style={{ paddingLeft: '10px' }}>
                  <AddPlaceholderDashed
                    label="할일 추가"
                    isTask
                    onAdd={(name) => {
                      // Auto-create subsection if none exist and add task
                      if (section.subsections.length === 0) {
                        addSubsection(chapter.id, section.id, '기본');
                      }
                      const lastSub = section.subsections[section.subsections.length - 1];
                      if (lastSub) addTask(chapter.id, section.id, lastSub.id, name);
                    }}
                  />
                </div>
              )}

              {/* Add subsection placeholder */}
              {isAddMode && (
                <div style={{ paddingLeft: '10px' }}>
                  <AddPlaceholderDashed
                    label="소단원 추가"
                    onAdd={(name) => addSubsection(chapter.id, section.id, name)}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add section (중단원) placeholder */}
        {isAddMode && (
          <div style={{ paddingLeft: '10px' }}>
            <AddPlaceholderDashed
              label="중단원 추가"
              onAdd={(name) => addSection(chapter.id, name)}
            />
          </div>
        )}
      </div>

      {/* Add chapter (대단원) placeholder - outside card */}
      {isAddMode && (
        <AddPlaceholder
          label="대단원 추가"
          onAdd={(name) => state.addChapter(name)}
          rounded="10px"
        />
      )}
    </div>
  );
}

// Task add placeholder (solid background, inside subsection)
function AddTaskPlaceholder({ onAdd }: { onAdd: (name: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  const handleSubmit = () => {
    if (value.trim()) { onAdd(value.trim()); setValue(''); }
    else { setIsEditing(false); }
  };

  if (isEditing) {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '5px', padding: '3px', display: 'flex', alignItems: 'center', gap: '3px', width: '100%' }}>
        <span style={{ fontSize: '14px', color: '#d0d0d0' }}>□</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') { setValue(''); setIsEditing(false); } }}
          onBlur={handleSubmit}
          placeholder="할일 추가"
          style={{ flex: 1, fontSize: '14px', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Pretendard, sans-serif' }}
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      style={{
        backgroundColor: 'white',
        borderRadius: '5px',
        padding: '3px',
        display: 'flex',
        alignItems: 'center',
        gap: '3px',
        width: '100%',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'Pretendard, sans-serif',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      <span style={{ fontSize: '14px', color: '#d0d0d0' }}>□</span>
      <span style={{ fontSize: '14px', color: '#d0d0d0', fontWeight: 500 }}>할일 추가</span>
    </button>
  );
}

// Dashed border placeholder
function AddPlaceholderDashed({ label, isTask, onAdd }: { label: string; isTask?: boolean; onAdd: (name: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  const handleSubmit = () => {
    if (value.trim()) { onAdd(value.trim()); setValue(''); }
    else { setIsEditing(false); }
  };

  if (isEditing) {
    return (
      <div style={{ border: '1px dashed #d0d0d0', borderRadius: '5px', padding: '3px', display: 'flex', alignItems: 'center', gap: '3px', width: '100%' }}>
        {isTask && <span style={{ fontSize: '14px', color: '#d0d0d0' }}>□</span>}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') { setValue(''); setIsEditing(false); } }}
          onBlur={handleSubmit}
          placeholder={label}
          style={{ flex: 1, fontSize: '14px', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Pretendard, sans-serif' }}
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      style={{
        border: '1px dashed #d0d0d0',
        borderRadius: '5px',
        padding: '3px',
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        width: '100%',
        height: '24px',
        background: 'none',
        cursor: 'pointer',
        fontFamily: 'Pretendard, sans-serif',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      {isTask && <span style={{ fontSize: '14px', color: '#d0d0d0' }}>□</span>}
      <span style={{ fontSize: '14px', color: '#d0d0d0', fontWeight: 500 }}>{label}</span>
    </button>
  );
}

// Swipeable item for sections/subsections/tasks
function SwipeItem({
  label,
  labelStyle,
  isTask,
  isCompleted,
  onToggle,
  onEdit,
  onDelete,
  disabled,
}: {
  label: string;
  labelStyle?: React.CSSProperties;
  isTask?: boolean;
  isCompleted?: boolean;
  onToggle?: () => void;
  onEdit: (newName: string) => void;
  onDelete: () => void;
  disabled?: boolean;
}) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);
  const swipeStartX = useRef(0);
  const isSwipingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  // Extract the display name without prefix
  const getDisplayName = () => label;

  const handleSwipeStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (disabled || isEditing) return;
    if (isSwiped) { setIsSwiped(false); setSwipeOffset(0); return; }
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    swipeStartX.current = clientX;
    isSwipingRef.current = true;
  };

  const handleSwipeMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isSwipingRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = swipeStartX.current - clientX;
    if (diff > 0) {
      setSwipeOffset(Math.min(diff, SWIPE_THRESHOLD + 20));
      setIsSwiped(true);
    }
  };

  const handleSwipeEnd = () => {
    if (!isSwipingRef.current) return;
    isSwipingRef.current = false;
    if (swipeOffset > SWIPE_THRESHOLD / 2) {
      setSwipeOffset(SWIPE_THRESHOLD);
    } else {
      setIsSwiped(false);
      setSwipeOffset(0);
    }
  };

  const startEdit = () => {
    setEditValue(label);
    setIsEditing(true);
    setIsSwiped(false);
    setSwipeOffset(0);
  };

  const handleEditSubmit = () => {
    if (editValue.trim()) {
      // Extract just the name part (remove numbering prefix)
      const namePart = label.replace(/^[\[\d\s\]]+|^\d+[\s.)]+/, '').trim();
      const newName = editValue.replace(/^[\[\d\s\]]+|^\d+[\s.)]+/, '').trim();
      if (newName !== namePart) onEdit(newName);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}>
        {isTask && <span style={{ fontSize: '14px', color: '#b0ada9' }}>□</span>}
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleEditSubmit(); if (e.key === 'Escape') setIsEditing(false); }}
          onBlur={handleEditSubmit}
          style={{
            flex: 1,
            fontSize: '14px',
            fontWeight: 500,
            color: '#4a4846',
            border: 'none',
            borderBottom: '1px solid #d0d0d0',
            outline: 'none',
            background: 'transparent',
            fontFamily: 'Pretendard, sans-serif',
            padding: '2px 0',
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '5px' }}>
      {/* Swipe actions */}
      {!disabled && (
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${SWIPE_THRESHOLD}px`, display: 'flex', zIndex: 1 }}>
          <button
            onClick={startEdit}
            style={{ flex: 1, background: '#5d5957', color: 'white', border: 'none', cursor: 'pointer', fontSize: '11px', fontFamily: 'Pretendard, sans-serif' }}
          >
            수정
          </button>
          <button
            onClick={onDelete}
            style={{ flex: 1, background: '#d4183d', color: 'white', border: 'none', cursor: 'pointer', fontSize: '11px', fontFamily: 'Pretendard, sans-serif' }}
          >
            삭제
          </button>
        </div>
      )}

      {/* Content */}
      <div
        onTouchStart={handleSwipeStart}
        onTouchMove={handleSwipeMove}
        onTouchEnd={handleSwipeEnd}
        onMouseDown={handleSwipeStart}
        onMouseMove={handleSwipeMove}
        onMouseUp={handleSwipeEnd}
        onMouseLeave={handleSwipeEnd}
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          width: '100%',
          transform: isSwiped ? `translateX(-${swipeOffset}px)` : 'translateX(0)',
          transition: isSwipingRef.current ? 'none' : 'transform 0.2s ease-out',
          ...(isTask ? {
            backgroundColor: '#f5f5f5',
            borderRadius: '5px',
            padding: '3px',
          } : {}),
        }}
      >
        {isTask && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontSize: '14px',
              color: isCompleted ? '#5d5957' : '#b0ada9',
              lineHeight: 1,
            }}
          >
            {isCompleted ? '☑' : '□'}
          </button>
        )}
        <span style={{
          ...labelStyle,
          textDecoration: isCompleted ? 'line-through' : 'none',
          color: isCompleted ? '#b0ada9' : (labelStyle?.color || '#4a4846'),
        }}>
          {label}
        </span>
      </div>
    </div>
  );
}

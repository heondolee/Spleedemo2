import { useState, useRef, useEffect } from 'react';
import { useExamState } from './useExamState';
import { calculateDday, formatDday, calculateSubjectProgress, Chapter } from './types';
import { ExamDropdown } from './ExamDropdown';
import { ChapterCard } from './ChapterCard';

export function ExamManagementSheet() {
  const state = useExamState();
  const {
    selectedExam, selectedSubject,
    selectedSubjectId, setSelectedSubjectId,
    addSubject, deleteSubject,
    addChapter,
  } = state;

  const [showDropdown, setShowDropdown] = useState(false);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const subjectInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAddingSubject && subjectInputRef.current) subjectInputRef.current.focus();
  }, [isAddingSubject]);

  const subjectSubmittedRef = useRef(false);
  const handleAddSubject = () => {
    if (subjectSubmittedRef.current) return;
    subjectSubmittedRef.current = true;
    if (newSubjectName.trim()) {
      addSubject(newSubjectName.trim());
      setNewSubjectName('');
    }
    setIsAddingSubject(false);
    setTimeout(() => { subjectSubmittedRef.current = false; }, 0);
  };

  const ddayValue = selectedExam ? calculateDday(selectedExam.date) : null;

  return (
    <div
      style={{
        backgroundColor: '#f5f5f5',
        border: '1px solid white',
        borderRadius: '10px',
        boxShadow: '0px 0px 4px 0px rgba(0,0,0,0.1)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'Pretendard, sans-serif',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div style={{ padding: '9px 18px', display: 'flex', alignItems: 'center', gap: '10px', height: '54px', flexShrink: 0 }}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a4846" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        {selectedExam ? (
          <>
            <span style={{ fontSize: '20px', fontWeight: 600, color: '#4a4846' }}>{selectedExam.name}</span>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#4a4846', padding: '6px 10px', borderRadius: '10px' }}>
              {ddayValue !== null ? formatDday(ddayValue) : ''}
            </span>
          </>
        ) : (
          <span style={{ fontSize: '16px', fontWeight: 500, color: '#7c7875' }}>시험을 선택하세요</span>
        )}
      </div>

      {/* Subject Tabs */}
      {selectedExam && (
        <div style={{ padding: '0 18px', display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0, overflowX: 'auto', paddingBottom: '10px' }}>
          {selectedExam.subjects.map(subject => {
            const isActive = selectedSubjectId === subject.id;
            const progress = calculateSubjectProgress(subject);
            return (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                style={{
                  backgroundColor: isActive ? 'white' : 'transparent',
                  border: '1px solid #d0d0d0',
                  borderRadius: '10px',
                  padding: '11px 13px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '4px',
                  minWidth: '70px',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#7c7875', whiteSpace: 'nowrap' }}>{subject.name}</span>
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#4a4846' }}>{progress}%</span>
              </button>
            );
          })}

          {/* Add subject button */}
          {isAddingSubject ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <input
                ref={subjectInputRef}
                type="text"
                value={newSubjectName}
                onChange={e => setNewSubjectName(e.target.value)}
                onKeyDown={e => { if (e.nativeEvent.isComposing) return; if (e.key === 'Enter') handleAddSubject(); if (e.key === 'Escape') { setNewSubjectName(''); setIsAddingSubject(false); } }}
                onBlur={handleAddSubject}
                placeholder="과목명"
                style={{
                  width: '70px',
                  fontSize: '14px',
                  border: '1px solid #d0d0d0',
                  borderRadius: '8px',
                  padding: '8px',
                  outline: 'none',
                  fontFamily: 'Pretendard, sans-serif',
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => setIsAddingSubject(true)}
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
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c7875" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Chapter Cards */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 9px 9px 9px' }}>
        {selectedSubject && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-start', alignContent: 'flex-start' }}>
            {selectedSubject.chapters.map((chapter, idx) => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                index={idx + 1}
                state={state}
              />
            ))}
          </div>
        )}

        {/* Add chapter button */}
        {selectedSubject && (
          <div style={{ padding: '10px 0' }}>
            <AddPlaceholder
              label="대단원 추가"
              onAdd={(name) => addChapter(name)}
              rounded="10px"
            />
          </div>
        )}

        {!selectedExam && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <p style={{ fontSize: '16px', color: '#7c7875' }}>
              왼쪽 상단 ≡ 메뉴에서 시험을 추가하세요
            </p>
          </div>
        )}
      </div>

      {/* Exam Dropdown */}
      {showDropdown && (
        <ExamDropdown
          state={state}
          onClose={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}

// Reusable add placeholder button
export function AddPlaceholder({
  label,
  onAdd,
  rounded = '5px',
}: {
  label: string;
  onAdd: (name: string) => void;
  rounded?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  const handleSubmit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    if (value.trim()) {
      onAdd(value.trim());
      setValue('');
      // Stay in editing mode for quick consecutive adds
    } else {
      setIsEditing(false);
    }
    setTimeout(() => { submittedRef.current = false; }, 0);
  };

  if (isEditing) {
    return (
      <div style={{
        border: '1px dashed #d0d0d0',
        borderRadius: rounded,
        padding: '3px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        width: '100%',
      }}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.nativeEvent.isComposing) return; if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') { setValue(''); setIsEditing(false); } }}
          onBlur={handleSubmit}
          placeholder={label}
          style={{
            flex: 1,
            fontSize: '14px',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: 'Pretendard, sans-serif',
            padding: '2px 4px',
          }}
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      style={{
        border: '1px dashed #d0d0d0',
        borderRadius: rounded,
        padding: '3px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
      <span style={{ fontSize: '14px', fontWeight: 500, color: '#d0d0d0' }}>{label}</span>
    </button>
  );
}

export default ExamManagementSheet;

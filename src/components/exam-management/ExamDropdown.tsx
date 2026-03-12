import { useState, useRef, useEffect } from 'react';
import { calculateDday, formatDday } from './types';
import type { useExamState } from './useExamState';

interface ExamDropdownProps {
  state: ReturnType<typeof useExamState>;
  onClose: () => void;
}

export function ExamDropdown({ state, onClose }: ExamDropdownProps) {
  const { exams, selectedExam, addExam, updateExam, deleteExam, selectExam } = state;
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Swipe state
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const swipeStartX = useRef(0);
  const isSwipingRef = useRef(false);
  const SWIPE_THRESHOLD = 80;

  useEffect(() => {
    if ((isAdding || editingId) && nameInputRef.current) nameInputRef.current.focus();
  }, [isAdding, editingId]);

  const handleAdd = () => {
    if (name.trim()) {
      addExam(name.trim(), date);
      setName('');
      setIsAdding(false);
      onClose();
    }
  };

  const handleUpdate = () => {
    if (editingId && name.trim()) {
      updateExam(editingId, { name: name.trim(), date });
      setName('');
      setEditingId(null);
    }
  };

  const startEdit = (examId: string) => {
    const exam = exams.find(e => e.id === examId);
    if (exam) {
      setEditingId(examId);
      setName(exam.name);
      setDate(exam.date);
      setSwipedId(null);
      setSwipeOffset(0);
    }
  };

  const handleSwipeStart = (e: React.TouchEvent | React.MouseEvent, id: string) => {
    if (isAdding || editingId) return;
    if (swipedId && swipedId !== id) {
      setSwipedId(null);
      setSwipeOffset(0);
      return;
    }
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    swipeStartX.current = clientX;
    isSwipingRef.current = true;
  };

  const handleSwipeMove = (e: React.TouchEvent | React.MouseEvent, id: string) => {
    if (!isSwipingRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = swipeStartX.current - clientX;
    if (diff > 0) {
      setSwipeOffset(Math.min(diff, SWIPE_THRESHOLD + 20));
      setSwipedId(id);
    }
  };

  const handleSwipeEnd = () => {
    if (!isSwipingRef.current) return;
    isSwipingRef.current = false;
    if (swipeOffset > SWIPE_THRESHOLD / 2) {
      setSwipeOffset(SWIPE_THRESHOLD);
    } else {
      setSwipedId(null);
      setSwipeOffset(0);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, zIndex: 40 }}
      />

      {/* Dropdown */}
      <div
        style={{
          position: 'absolute',
          left: '9px',
          top: '9px',
          width: '280px',
          maxHeight: '400px',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0px 0px 6px 0px rgba(0,0,0,0.25)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'Pretendard, sans-serif',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Title */}
        <div style={{ padding: '15px', flexShrink: 0 }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: '#7c7875' }}>시험관리</span>
        </div>

        {/* Exam List */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {exams.map(exam => {
            const dday = calculateDday(exam.date);
            const isSwiped = swipedId === exam.id;
            const isSelected = selectedExam?.id === exam.id;

            if (editingId === exam.id) {
              return (
                <div
                  key={exam.id}
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #d0d0d0',
                    borderRadius: '10px',
                    padding: '10px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ borderBottom: '1px solid #d0d0d0', paddingBottom: '4px' }}>
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleUpdate(); if (e.key === 'Escape') { setEditingId(null); setName(''); } }}
                      style={{ width: '100%', fontSize: '16px', fontWeight: 600, color: '#4a4846', border: 'none', outline: 'none', fontFamily: 'Pretendard, sans-serif' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        style={{ fontSize: '14px', color: '#7c7875', border: 'none', outline: 'none', fontFamily: 'Pretendard, sans-serif' }}
                      />
                      <span style={{ fontSize: '14px', color: '#7c7875' }}>{formatDday(calculateDday(date))}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={handleUpdate} style={btnDark}>완료</button>
                      <button onClick={() => { setEditingId(null); setName(''); }} style={btnLight}>취소</button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={exam.id} style={{ position: 'relative', overflow: 'hidden', borderRadius: '10px' }}>
                {/* Swipe actions */}
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${SWIPE_THRESHOLD}px`, display: 'flex' }}>
                  <button
                    onClick={() => startEdit(exam.id)}
                    style={{ flex: 1, background: '#5d5957', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', fontFamily: 'Pretendard, sans-serif' }}
                  >
                    수정
                  </button>
                  <button
                    onClick={() => { deleteExam(exam.id); setSwipedId(null); setSwipeOffset(0); }}
                    style={{ flex: 1, background: '#d4183d', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', fontFamily: 'Pretendard, sans-serif' }}
                  >
                    삭제
                  </button>
                </div>

                {/* Exam card */}
                <div
                  onClick={() => { if (!isSwiped) { selectExam(exam.id); onClose(); } else { setSwipedId(null); setSwipeOffset(0); } }}
                  onTouchStart={e => handleSwipeStart(e, exam.id)}
                  onTouchMove={e => handleSwipeMove(e, exam.id)}
                  onTouchEnd={handleSwipeEnd}
                  onMouseDown={e => handleSwipeStart(e, exam.id)}
                  onMouseMove={e => handleSwipeMove(e, exam.id)}
                  onMouseUp={handleSwipeEnd}
                  onMouseLeave={handleSwipeEnd}
                  style={{
                    backgroundColor: isSelected ? '#f0efed' : '#f0efed',
                    border: isSelected ? '1px solid #5d5957' : '1px solid #d0d0d0',
                    borderRadius: '10px',
                    padding: '10px 8px',
                    cursor: 'pointer',
                    position: 'relative',
                    transform: isSwiped ? `translateX(-${swipeOffset}px)` : 'translateX(0)',
                    transition: isSwipingRef.current ? 'none' : 'transform 0.2s ease-out',
                  }}
                >
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#4a4846' }}>{exam.name}</div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#7c7875' }}>{formatDate(exam.date)}</span>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#7c7875' }}>{formatDday(dday)}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add exam form */}
          {isAdding && (
            <div
              style={{
                backgroundColor: 'white',
                border: '1px solid #d0d0d0',
                borderRadius: '10px',
                padding: '10px 8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ borderBottom: '1px solid #d0d0d0', paddingBottom: '4px' }}>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setIsAdding(false); setName(''); } }}
                  placeholder="시험 이름을 입력하세요"
                  style={{ width: '100%', fontSize: '16px', fontWeight: 600, color: '#4a4846', border: 'none', outline: 'none', fontFamily: 'Pretendard, sans-serif' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    style={{ fontSize: '14px', color: '#7c7875', border: 'none', outline: 'none', fontFamily: 'Pretendard, sans-serif' }}
                  />
                  <span style={{ fontSize: '14px', color: '#7c7875' }}>{formatDday(calculateDday(date))}</span>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={handleAdd} style={btnDark}>완료</button>
                  <button onClick={() => { setIsAdding(false); setName(''); }} style={btnLight}>취소</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add exam button */}
        {!isAdding && !editingId && (
          <div style={{ padding: '15px', flexShrink: 0 }}>
            <button
              onClick={() => setIsAdding(true)}
              style={{
                width: '100%',
                height: '32px',
                border: '1px dashed #d0d0d0',
                borderRadius: '10px',
                background: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                fontFamily: 'Pretendard, sans-serif',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span style={{ fontSize: '14px', color: '#d0d0d0' }}>시험 추가</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

const btnDark: React.CSSProperties = {
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
};

const btnLight: React.CSSProperties = {
  height: '28px',
  padding: '0 12px',
  borderRadius: '21px',
  border: 'none',
  backgroundColor: '#f0efed',
  color: '#4a4846',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'Pretendard, sans-serif',
};

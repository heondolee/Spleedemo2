import { useState, useRef, useEffect } from 'react';
import { BrainDumpItem } from './types';

interface BrainDumpWidgetProps {
  items: BrainDumpItem[];
  onAdd: (content: string) => BrainDumpItem;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

export function BrainDumpWidget({ items, onAdd, onUpdate, onDelete }: BrainDumpWidgetProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) inputRef.current.focus();
  }, [isAdding]);

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editingId]);

  const handleAdd = () => {
    if (newContent.trim()) {
      onAdd(newContent.trim());
      setNewContent('');
    }
    setIsAdding(false);
  };

  const handleEdit = (id: string) => {
    if (editContent.trim()) {
      onUpdate(id, editContent.trim());
    }
    setEditingId(null);
    setEditContent('');
  };

  return (
    <div
      className="relative flex flex-col gap-[3px] items-start"
      style={{
        backgroundColor: 'white',
        border: '1px solid #eeeeec',
        borderRadius: '10px',
        width: '274px',
        minHeight: '91px',
        paddingTop: '21px',
        paddingBottom: '13px',
        paddingLeft: '13px',
        paddingRight: '13px',
      }}
    >
      {/* 라벨 */}
      <div
        className="absolute"
        style={{
          top: '-6px',
          left: 0,
          backgroundColor: 'white',
          borderRadius: '6px 6px 0 0',
          padding: '3px 6px',
        }}
      >
        <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: '12px', color: '#d0d0d0' }}>
          Brain Dump
        </span>
      </div>

      {/* 아이템 목록 */}
      <div className="flex-1 w-full">
        <ul style={{ listStyleType: 'disc', paddingLeft: '21px', margin: 0 }}>
          {items.map(item => (
            <li key={item.id} style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: '14px', color: '#5d5957', lineHeight: '18px' }}>
              {editingId === item.id ? (
                <input
                  ref={editRef}
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.nativeEvent.isComposing) return;
                    if (e.key === 'Enter') handleEdit(item.id);
                    if (e.key === 'Escape') { setEditingId(null); setEditContent(''); }
                  }}
                  onBlur={() => handleEdit(item.id)}
                  style={{
                    fontFamily: 'Pretendard, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: '#5d5957',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    width: '100%',
                    padding: 0,
                  }}
                />
              ) : (
                <span
                  onClick={() => { setEditContent(item.content); setEditingId(item.id); }}
                  onDoubleClick={() => onDelete(item.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {item.content}
                </span>
              )}
            </li>
          ))}
        </ul>

        {isAdding ? (
          <div style={{ paddingLeft: '21px', marginTop: items.length > 0 ? '2px' : 0 }}>
            <input
              ref={inputRef}
              type="text"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing) return;
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') { setNewContent(''); setIsAdding(false); }
              }}
              onBlur={handleAdd}
              placeholder="입력..."
              style={{
                fontFamily: 'Pretendard, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                color: '#5d5957',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '100%',
                padding: 0,
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              paddingLeft: '21px',
              marginTop: items.length > 0 ? '2px' : 0,
              fontFamily: 'Pretendard, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              color: '#d0d0d0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0 0 0 21px',
            }}
          >
            + 추가
          </button>
        )}
      </div>
    </div>
  );
}

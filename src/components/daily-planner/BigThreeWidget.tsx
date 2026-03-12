import { useState, useRef, useEffect } from 'react';

interface BigThreeWidgetProps {
  items: [string, string, string];
  onUpdate: (index: number, value: string) => void;
}

export function BigThreeWidget({ items, onUpdate }: BigThreeWidgetProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingIndex !== null && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingIndex]);

  const handleSave = (index: number) => {
    onUpdate(index, editValue.trim());
    setEditingIndex(null);
    setEditValue('');
  };

  return (
    <div
      className="relative flex flex-col gap-[3px] items-start"
      style={{
        backgroundColor: 'white',
        border: '1px solid #eeeeec',
        borderRadius: '10px',
        width: '100%',
        minHeight: '87px',
        paddingTop: '21px',
        paddingBottom: '13px',
        paddingLeft: '13px',
        paddingRight: '13px',
        gridColumn: '1 / span 2',
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
          Big 3
        </span>
      </div>

      {/* 목록 */}
      <div className="flex-1 w-full">
        <ol style={{ listStyleType: 'decimal', paddingLeft: '21px', margin: 0 }}>
          {items.map((item, index) => (
            <li key={index} style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: '14px', color: '#5d5957', lineHeight: '18px' }}>
              {editingIndex === index ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.nativeEvent.isComposing) return;
                    if (e.key === 'Enter') handleSave(index);
                    if (e.key === 'Escape') { setEditingIndex(null); setEditValue(''); }
                  }}
                  onBlur={() => handleSave(index)}
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
                  onClick={() => { setEditValue(item); setEditingIndex(index); }}
                  style={{ cursor: 'pointer', color: item ? '#5d5957' : '#d0d0d0' }}
                >
                  {item || '클릭하여 입력'}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';

interface CommentWidgetProps {
  value: string;
  onChange: (value: string) => void;
}

export function CommentWidget({ value, onChange }: CommentWidgetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div
      className="relative flex flex-col gap-[3px] items-start"
      style={{
        backgroundColor: 'white',
        border: '1px solid #eeeeec',
        borderRadius: '10px',
        width: '275px',
        minHeight: '86px',
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
          Comment
        </span>
      </div>

      <div className="flex-1 w-full" onClick={() => !isEditing && setIsEditing(true)} style={{ cursor: 'pointer' }}>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            placeholder="오늘의 한마디를 입력하세요"
            style={{
              fontFamily: 'Pretendard, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              color: '#5d5957',
              lineHeight: '18px',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              width: '100%',
              resize: 'none',
              padding: 0,
              minHeight: '40px',
            }}
          />
        ) : (
          <p style={{
            fontFamily: 'Pretendard, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            color: value ? '#5d5957' : '#d0d0d0',
            lineHeight: '18px',
            margin: 0,
            minHeight: '40px',
            whiteSpace: 'pre-wrap',
          }}>
            {value || '클릭하여 입력'}
          </p>
        )}
      </div>
    </div>
  );
}

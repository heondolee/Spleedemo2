import { useState, useEffect, useRef } from 'react';

interface SaveTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (templateName: string) => void;
}

export function SaveTemplateDialog({
  isOpen,
  onClose,
  onSave,
}: SaveTemplateDialogProps) {
  const [templateName, setTemplateName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTemplateName('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (templateName.trim()) {
      onSave(templateName.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[250]"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background rounded-[16px] shadow-xl z-[251] p-[24px]"
        style={{ width: '360px' }}
      >
        <h3 className="font-semibold mb-[16px]" style={{ fontSize: '18px' }}>
          템플릿 저장
        </h3>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full px-[16px] py-[12px] rounded-[8px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary mb-[20px]"
            style={{ fontSize: '15px' }}
            placeholder="템플릿 이름 입력"
          />

          <div className="flex gap-[8px] justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-[16px] py-[8px] rounded-[8px] hover:bg-accent transition-colors"
            >
              <span style={{ fontSize: '14px' }}>취소</span>
            </button>
            <button
              type="submit"
              className="px-[16px] py-[8px] rounded-[8px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              disabled={!templateName.trim()}
            >
              <span style={{ fontSize: '14px' }}>저장</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

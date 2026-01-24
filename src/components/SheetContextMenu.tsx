import { Edit2, Trash2, Type } from 'lucide-react';

interface SheetContextMenuProps {
  sheetId: string;
  sheetName: string;
  position: { x: number; y: number };
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function SheetContextMenu({
  sheetId,
  sheetName,
  position,
  onClose,
  onRename,
  onDelete,
}: SheetContextMenuProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100]"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div
        className="fixed bg-background border border-border rounded-[12px] shadow-xl z-[101] overflow-hidden"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '180px',
        }}
      >
        <div className="py-[4px]">
          <button
            onClick={() => {
              onRename();
              onClose();
            }}
            className="w-full flex items-center gap-[12px] px-[16px] py-[10px] hover:bg-accent transition-colors"
          >
            <Type className="w-[16px] h-[16px] text-muted-foreground" />
            <span style={{ fontSize: '14px' }}>이름 변경</span>
          </button>
          
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full flex items-center gap-[12px] px-[16px] py-[10px] hover:bg-destructive/10 text-destructive transition-colors"
          >
            <Trash2 className="w-[16px] h-[16px]" />
            <span style={{ fontSize: '14px' }}>삭제</span>
          </button>
        </div>
      </div>
    </>
  );
}

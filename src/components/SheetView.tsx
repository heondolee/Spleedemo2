interface SheetViewProps {
  sheetName: string | null;
  position: 'left' | 'right';
  isVisible: boolean;
  isNavExpanded: boolean;
  isFocused: boolean;
  onClick: () => void;
}

export function SheetView({ sheetName, position, isVisible, isNavExpanded, isFocused, onClick }: SheetViewProps) {
  if (!isVisible || !sheetName) {
    return <div className="flex-1"></div>;
  }

  return (
    <div 
      className={`bg-background p-[24px] relative transition-all ${
        isFocused && isNavExpanded 
          ? 'ring-[3px] ring-blue-500 ring-inset' 
          : ''
      } ${isNavExpanded ? 'cursor-pointer' : ''}`}
      style={{ width: '577px' }} // Fixed half size: 1154 / 2
      onClick={onClick}
    >
      {/* Floating Title (only when nav is expanded) */}
      {isNavExpanded && (
        <div className={`absolute top-[24px] z-10 ${position === 'left' ? 'right-[24px]' : 'left-[24px]'}`}>
          <div className="bg-background/80 backdrop-blur-sm border border-border rounded-[8px] px-[12px] py-[6px] shadow-sm">
            <h2 className="font-medium" style={{ fontSize: '16px' }}>
              {sheetName}
            </h2>
          </div>
        </div>
      )}

      {/* Sheet Content */}
      <div className="h-full flex flex-col">
        {/* Sheet Body - Empty for now */}
        <div className="flex-1 border border-dashed border-border rounded-[12px] flex items-center justify-center mt-[48px]">
          <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
            {sheetName} 내용이 여기에 표시됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
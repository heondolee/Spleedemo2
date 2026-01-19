export default function App() {
  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center p-8">
      {/* iPad Pro 11" Frame - Landscape - 1194 × 834 px (1:1 with pt) */}
      <div 
        className="bg-black rounded-[40px] shadow-2xl relative overflow-hidden"
        style={{ 
          width: '1194px', 
          height: '834px',
          padding: '20px' // Bezel
        }}
      >
        {/* Screen Area */}
        <div 
          className="bg-background rounded-[24px] w-full h-full overflow-hidden relative"
          style={{
            width: '1154px', // 1194 - 40 (20px bezel on each side)
            height: '794px' // 834 - 40
          }}
        >
          {/* App Content Area - Empty */}
          <div className="w-full h-full">
            {/* Empty screen - ready for development */}
          </div>
        </div>

        {/* Home Indicator */}
        <div 
          className="absolute bottom-[8px] left-1/2 transform -translate-x-1/2 bg-white/30 rounded-full"
          style={{ width: '140px', height: '4px' }}
        ></div>
      </div>
    </div>
  );
}
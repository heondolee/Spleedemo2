import { useState, useRef } from 'react';
import {
  DailyInfo,
  TimelineBlock,
  formatDateKorean,
  calculateDday,
  calculateStudyTime,
  formatStudyTime,
  formatDday,
} from './types';

interface HeaderWidgetsProps {
  dailyInfo: DailyInfo;
  timelineBlocks: TimelineBlock[];
  onUpdateDailyInfo: (updates: Partial<DailyInfo>) => void;
  onDateChange: (date: string) => void;
}

export function HeaderWidgets({
  dailyInfo,
  timelineBlocks,
  onUpdateDailyInfo,
  onDateChange,
}: HeaderWidgetsProps) {
  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [isEditingDday, setIsEditingDday] = useState(false);
  const [ddayLabel, setDdayLabel] = useState(dailyInfo.dday?.label || '');
  const [ddayDate, setDdayDate] = useState(dailyInfo.dday?.targetDate || '');
  const quoteInputRef = useRef<HTMLTextAreaElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const studyTime = calculateStudyTime(timelineBlocks);
  const ddayValue = dailyInfo.dday ? calculateDday(dailyInfo.dday.targetDate) : null;

  const handleDateClick = () => {
    dateInputRef.current?.showPicker();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onDateChange(e.target.value);
    }
  };

  const handleDdayClick = () => {
    setDdayLabel(dailyInfo.dday?.label || '');
    setDdayDate(dailyInfo.dday?.targetDate || '');
    setIsEditingDday(true);
  };

  const handleDdaySave = () => {
    if (ddayLabel && ddayDate) {
      onUpdateDailyInfo({ dday: { label: ddayLabel, targetDate: ddayDate } });
    } else {
      onUpdateDailyInfo({ dday: null });
    }
    setIsEditingDday(false);
  };

  const handleQuoteClick = () => {
    setIsEditingQuote(true);
    setTimeout(() => quoteInputRef.current?.focus(), 0);
  };

  return (
    <div className="flex flex-col gap-[8px] p-[12px]">
      {/* 상단 위젯 행: DAY / D-DAY / 공부시간 */}
      <div className="flex gap-[8px]">
        {/* DAY 위젯 */}
        <button
          onClick={handleDateClick}
          className="flex-1 bg-card border border-border rounded-[12px] p-[12px] text-left hover:bg-accent/50 transition-colors"
        >
          <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
            DAY
          </span>
          <p className="text-[14px] font-medium mt-[4px]">
            {formatDateKorean(dailyInfo.date)}
          </p>
          <input
            ref={dateInputRef}
            type="date"
            className="absolute opacity-0 pointer-events-none"
            value={dailyInfo.date}
            onChange={handleDateChange}
          />
        </button>

        {/* D-DAY 위젯 */}
        <button
          onClick={handleDdayClick}
          className="bg-card border border-border rounded-[12px] p-[12px] text-left hover:bg-accent/50 transition-colors"
          style={{ width: '100px' }}
        >
          <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
            D-DAY
          </span>
          {dailyInfo.dday ? (
            <>
              <p className="text-[16px] font-semibold text-primary mt-[4px]">
                {formatDday(ddayValue!)}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {dailyInfo.dday.label}
              </p>
            </>
          ) : (
            <p className="text-[12px] text-muted-foreground mt-[4px]">
              설정하기
            </p>
          )}
        </button>

        {/* 공부시간 위젯 */}
        <div
          className="bg-card border border-border rounded-[12px] p-[12px]"
          style={{ width: '120px' }}
        >
          <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
            공부시간
          </span>
          <p className="text-[18px] font-semibold text-primary mt-[4px]">
            {studyTime > 0 ? formatStudyTime(studyTime) : '0분'}
          </p>
        </div>
      </div>

      {/* COMMENT 위젯 */}
      <button
        onClick={!isEditingQuote ? handleQuoteClick : undefined}
        className="w-full bg-card border border-border rounded-[12px] p-[12px] text-left hover:bg-accent/50 transition-colors"
      >
        <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
          COMMENT
        </span>
        {isEditingQuote ? (
          <textarea
            ref={quoteInputRef}
            className="w-full mt-[4px] text-[13px] bg-transparent border-none outline-none resize-none"
            value={dailyInfo.dailyQuote}
            onChange={(e) => onUpdateDailyInfo({ dailyQuote: e.target.value })}
            onBlur={() => setIsEditingQuote(false)}
            placeholder="오늘의 한마디를 입력하세요"
            rows={2}
          />
        ) : (
          <p className="text-[13px] mt-[4px] min-h-[40px]">
            {dailyInfo.dailyQuote || (
              <span className="text-muted-foreground">클릭하여 입력</span>
            )}
          </p>
        )}
      </button>

      {/* D-day 편집 모달 */}
      {isEditingDday && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background rounded-[16px] p-[20px] shadow-xl" style={{ width: '300px' }}>
            <h3 className="text-[16px] font-medium mb-[16px]">D-day 설정</h3>
            <div className="space-y-[12px]">
              <div>
                <label className="text-[12px] text-muted-foreground">이름</label>
                <input
                  type="text"
                  className="w-full mt-[4px] px-[12px] py-[10px] border border-border rounded-[8px] text-[14px] bg-input-background"
                  value={ddayLabel}
                  onChange={(e) => setDdayLabel(e.target.value)}
                  placeholder="예: 수능, 기말고사"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground">목표 날짜</label>
                <input
                  type="date"
                  className="w-full mt-[4px] px-[12px] py-[10px] border border-border rounded-[8px] text-[14px] bg-input-background"
                  value={ddayDate}
                  onChange={(e) => setDdayDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-[8px] mt-[16px]">
              <button
                className="px-[12px] py-[8px] text-[13px] rounded-[8px] hover:bg-accent transition-colors"
                onClick={() => setIsEditingDday(false)}
              >
                취소
              </button>
              <button
                className="px-[12px] py-[8px] text-[13px] bg-primary text-primary-foreground rounded-[8px] hover:bg-primary/90 transition-colors"
                onClick={handleDdaySave}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useRef } from 'react';
import { useDailyPlannerState } from './useDailyPlannerState';
import { BrainDumpWidget } from './BrainDumpWidget';
import { BigThreeWidget } from './BigThreeWidget';
import { CommentWidget } from './CommentWidget';
import { FeedbackWidget } from './FeedbackWidget';
import { TimelineWidget } from './TimelineWidget';
import {
  formatDateKorean,
  calculateDday,
  calculateStudyTime,
  formatStudyTime,
  formatDday,
} from './types';

interface DailyPlannerSheetProps {
  initialDate?: string;
}

export function DailyPlannerSheet({ initialDate }: DailyPlannerSheetProps) {
  const {
    data,
    changeDate,
    updateDailyInfo,
    addBrainDumpItem,
    updateBrainDumpItem,
    deleteBrainDumpItem,
    updateBigThree,
    addTimelineBlock,
    updateTimelineBlock,
    deleteTimelineBlock,
  } = useDailyPlannerState(initialDate);

  const [isEditingDday, setIsEditingDday] = useState(false);
  const [ddayLabel, setDdayLabel] = useState('');
  const [ddayDate, setDdayDate] = useState('');
  const dateInputRef = useRef<HTMLInputElement>(null);

  const studyTime = calculateStudyTime(data.timelineBlocks);
  const ddayValue = data.dailyInfo.dday ? calculateDday(data.dailyInfo.dday.targetDate) : null;

  const handleDateClick = () => {
    dateInputRef.current?.showPicker();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) changeDate(e.target.value);
  };

  const goToPreviousDay = () => {
    const current = new Date(data.dailyInfo.date);
    current.setDate(current.getDate() - 1);
    changeDate(current.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const current = new Date(data.dailyInfo.date);
    current.setDate(current.getDate() + 1);
    changeDate(current.toISOString().split('T')[0]);
  };

  const handleDdayClick = () => {
    setDdayLabel(data.dailyInfo.dday?.label || '');
    setDdayDate(data.dailyInfo.dday?.targetDate || '');
    setIsEditingDday(true);
  };

  const handleDdaySave = () => {
    if (ddayLabel && ddayDate) {
      updateDailyInfo({ dday: { label: ddayLabel, targetDate: ddayDate } });
    } else {
      updateDailyInfo({ dday: null });
    }
    setIsEditingDday(false);
  };

  // 달성량 계산 (done 블록 기준)
  const achievementTime = data.timelineBlocks
    .filter(b => b.type === 'done')
    .reduce((total, b) => total + (b.endTime - b.startTime), 0);

  return (
    <div
      style={{
        backgroundColor: '#f0efed',
        border: '1px solid white',
        borderRadius: '10px',
        boxShadow: '0px 0px 4px 0px rgba(0,0,0,0.1)',
        width: '100%',
        height: '100%',
        padding: '10px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        alignItems: 'flex-start',
        alignContent: 'flex-start',
        overflow: 'auto',
        fontFamily: 'Pretendard, sans-serif',
      }}
    >
      {/* === 좌상단 블록: 날짜 + D-day + Brain Dump === */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', width: '274px', alignItems: 'flex-start' }}>
        {/* 날짜 위젯 */}
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #eeeeec',
            borderRadius: '10px',
            height: '69px',
            width: '150px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '13px 6px',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <button
            onClick={goToPreviousDay}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              padding: 0,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c7875" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            onClick={handleDateClick}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              alignItems: 'flex-start',
              padding: 0,
            }}
          >
            <span style={{ fontWeight: 500, fontSize: '14px', color: '#7c7875', whiteSpace: 'nowrap' }}>
              {new Date(data.dailyInfo.date).getFullYear()}년
            </span>
            <span style={{ fontWeight: 600, fontSize: '16px', color: '#5d5957', whiteSpace: 'nowrap' }}>
              {formatDateKorean(data.dailyInfo.date).replace(/\(|\)/g, '')}
            </span>
          </button>

          <button
            onClick={goToNextDay}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              padding: 0,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c7875" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <input
            ref={dateInputRef}
            type="date"
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
            value={data.dailyInfo.date}
            onChange={handleDateChange}
          />
        </div>

        {/* D-day 위젯 */}
        <button
          onClick={handleDdayClick}
          style={{
            backgroundColor: 'white',
            border: '1px solid #eeeeec',
            borderRadius: '10px',
            width: '114px',
            height: '69px',
            display: 'flex',
            alignItems: 'center',
            padding: '13px',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-start' }}>
            <span style={{ fontWeight: 500, fontSize: '14px', color: '#7c7875', whiteSpace: 'nowrap' }}>
              {data.dailyInfo.dday?.label || '디데이'}
            </span>
            <span style={{ fontWeight: 600, fontSize: '16px', color: '#5d5957', whiteSpace: 'nowrap' }}>
              {ddayValue !== null ? formatDday(ddayValue) : '설정'}
            </span>
          </div>
        </button>

        {/* Brain Dump */}
        <BrainDumpWidget
          items={data.dailyInfo.brainDump}
          onAdd={addBrainDumpItem}
          onUpdate={updateBrainDumpItem}
          onDelete={deleteBrainDumpItem}
        />
      </div>

      {/* === 우상단 블록: 공부시간 + 달성량 + Big 3 === */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'auto auto',
          gap: '10px',
          width: '261px',
        }}
      >
        {/* 공부시간 */}
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #eeeeec',
            borderRadius: '10px',
            height: '69px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: '13px',
          }}
        >
          <span style={{ fontWeight: 500, fontSize: '14px', color: '#7c7875' }}>공부시간</span>
          <span style={{ fontWeight: 600, fontSize: '16px', color: '#5d5957', marginTop: '5px' }}>
            {studyTime > 0 ? formatStudyTime(studyTime) : '0분'}
          </span>
        </div>

        {/* 달성량 */}
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #eeeeec',
            borderRadius: '10px',
            height: '69px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: '13px',
          }}
        >
          <span style={{ fontWeight: 500, fontSize: '14px', color: '#7c7875' }}>달성량</span>
          <span style={{ fontWeight: 600, fontSize: '16px', color: '#5d5957', marginTop: '5px' }}>
            {achievementTime > 0 ? formatStudyTime(achievementTime) : '0분'}
          </span>
        </div>

        {/* Big 3 */}
        <BigThreeWidget
          items={data.dailyInfo.bigThree}
          onUpdate={updateBigThree}
        />
      </div>

      {/* === 좌하단 블록: 빈 영역 + Comment === */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '275px' }}>
        {/* 빈 흰색 영역 (메모/자유 공간) */}
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #eeeeec',
            borderRadius: '10px',
            height: '440px',
            width: '275px',
          }}
        />

        {/* Comment */}
        <CommentWidget
          value={data.dailyInfo.dailyQuote}
          onChange={(v) => updateDailyInfo({ dailyQuote: v })}
        />
      </div>

      {/* === 우하단 블록: Timeline + Feedback === */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '260px' }}>
        {/* Timeline */}
        <div style={{ height: '440px', width: '260px', overflow: 'hidden' }}>
          <TimelineWidget
            timelineBlocks={data.timelineBlocks}
            subjects={data.subjects}
            todos={data.todos}
            onAddBlock={addTimelineBlock}
            onUpdateBlock={updateTimelineBlock}
            onDeleteBlock={deleteTimelineBlock}
          />
        </div>

        {/* Feedback */}
        <FeedbackWidget
          value={data.dailyInfo.feedback}
          onChange={(v) => updateDailyInfo({ feedback: v })}
        />
      </div>

      {/* D-day 편집 모달 */}
      {isEditingDday && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 50 }}
        >
          <div
            style={{
              backgroundColor: '#fdfdfd',
              borderRadius: '16px',
              padding: '20px',
              width: '300px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              fontFamily: 'Pretendard, sans-serif',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '16px', color: '#5d5957' }}>
              D-day 설정
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#7c7875' }}>이름</label>
                <input
                  type="text"
                  value={ddayLabel}
                  onChange={(e) => setDdayLabel(e.target.value)}
                  placeholder="예: 수능, 기말고사"
                  autoFocus
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '10px 12px',
                    border: '1px solid #eeeeec',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#f3f3f5',
                    outline: 'none',
                    fontFamily: 'Pretendard, sans-serif',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#7c7875' }}>목표 날짜</label>
                <input
                  type="date"
                  value={ddayDate}
                  onChange={(e) => setDdayDate(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '10px 12px',
                    border: '1px solid #eeeeec',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#f3f3f5',
                    outline: 'none',
                    fontFamily: 'Pretendard, sans-serif',
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                onClick={() => setIsEditingDday(false)}
                style={{
                  padding: '8px 12px',
                  fontSize: '13px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#5d5957',
                  fontFamily: 'Pretendard, sans-serif',
                }}
              >
                취소
              </button>
              <button
                onClick={handleDdaySave}
                style={{
                  padding: '8px 12px',
                  fontSize: '13px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#5d5957',
                  color: 'white',
                  cursor: 'pointer',
                  fontFamily: 'Pretendard, sans-serif',
                }}
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

export default DailyPlannerSheet;

export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface Todo {
  id: string;
  subjectId: string;
  content: string;
  isCompleted: boolean;
}

export interface TimelineBlock {
  id: string;
  todoId: string | null;
  subjectId: string | null;
  startTime: number; // 분 단위 (6:00 = 360)
  endTime: number;
  type: 'plan' | 'done';
  label?: string;
}

export interface DailyInfo {
  date: string; // YYYY-MM-DD
  dday: {
    label: string;
    targetDate: string;
  } | null;
  dailyQuote: string;
}

export interface DailyPlannerData {
  dailyInfo: DailyInfo;
  subjects: Subject[];
  todos: Todo[];
  timelineBlocks: TimelineBlock[];
}

// 타임라인 상수 (6:00 ~ 다음날 6:00, 24시간)
export const TIMELINE_START_HOUR = 6;
export const TIMELINE_END_HOUR = 30; // 다음날 6:00 (6 + 24)
export const TIMELINE_TOTAL_HOURS = 24;
export const MINUTES_PER_HOUR = 60;
export const TIMELINE_START_MINUTES = TIMELINE_START_HOUR * MINUTES_PER_HOUR; // 360
export const TIMELINE_END_MINUTES = TIMELINE_END_HOUR * MINUTES_PER_HOUR; // 1800

// 기본 색상 팔레트
export const SUBJECT_COLORS = [
  '#86EFAC', // Green 300
  '#6EE7B7', // Emerald 300
  '#5EEAD4', // Teal 300
  '#67E8F9', // Cyan 300
  '#7DD3FC', // Sky 300
  '#93C5FD', // Blue 300
  '#A5B4FC', // Indigo 300
  '#C4B5FD', // Violet 300
  '#F0ABFC', // Fuchsia 300
  '#FDA4AF', // Rose 300
];

// 유틸리티 함수
export function formatHourLabel(hour: number): string {
  const h = hour % 24;
  if (h === 0 || h === 12) return '12';
  return h > 12 ? String(h - 12) : String(h);
}

export function calculateStudyTime(blocks: TimelineBlock[]): number {
  return blocks
    .filter(block => block.type === 'done')
    .reduce((total, block) => total + (block.endTime - block.startTime), 0);
}

export function formatStudyTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}분`;
  if (mins === 0) return `${hours}시간`;
  return `${hours}시간 ${mins}분`;
}

export function calculateDday(targetDate: string): number {
  const target = new Date(targetDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatDday(days: number): string {
  if (days === 0) return 'D-Day';
  if (days > 0) return `D-${days}`;
  return `D+${Math.abs(days)}`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function formatDateKorean(dateString: string): string {
  const date = new Date(dateString);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = days[date.getDay()];
  return `${month}월 ${day}일 (${dayOfWeek})`;
}

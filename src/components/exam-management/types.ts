export interface Task {
  id: string;
  name: string;
  isCompleted: boolean;
}

export interface Subsection {
  id: string;
  name: string;
  tasks: Task[];
}

export interface Section {
  id: string;
  name: string;
  subsections: Subsection[];
}

export interface Chapter {
  id: string;
  name: string;
  sections: Section[];
}

export interface ExamSubject {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface Exam {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  subjects: ExamSubject[];
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
}

export function calculateDday(targetDate: string): number {
  const target = new Date(targetDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDday(days: number): string {
  if (days === 0) return 'D-Day';
  if (days > 0) return `D - ${days}`;
  return `D + ${Math.abs(days)}`;
}

export function calculateSubjectProgress(subject: ExamSubject): number {
  let total = 0;
  let completed = 0;
  for (const ch of subject.chapters) {
    for (const sec of ch.sections) {
      for (const sub of sec.subsections) {
        for (const task of sub.tasks) {
          total++;
          if (task.isCompleted) completed++;
        }
      }
    }
  }
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

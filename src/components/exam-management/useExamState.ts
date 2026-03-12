import { useState, useEffect, useCallback } from 'react';
import { Exam, ExamSubject, Chapter, Section, Subsection, Task, generateId } from './types';

const STORAGE_KEY = 'splee_exams';
const SELECTED_EXAM_KEY = 'splee_selectedExamId';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function useExamState() {
  const [exams, setExams] = useState<Exam[]>(() => loadFromStorage(STORAGE_KEY, []));
  const [selectedExamId, setSelectedExamId] = useState<string | null>(() =>
    loadFromStorage(SELECTED_EXAM_KEY, null)
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  useEffect(() => { saveToStorage(STORAGE_KEY, exams); }, [exams]);
  useEffect(() => { saveToStorage(SELECTED_EXAM_KEY, selectedExamId); }, [selectedExamId]);

  const selectedExam = exams.find(e => e.id === selectedExamId) || null;

  // Auto-select first subject
  useEffect(() => {
    if (selectedExam && selectedExam.subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(selectedExam.subjects[0].id);
    }
    if (selectedExam && !selectedExam.subjects.find(s => s.id === selectedSubjectId)) {
      setSelectedSubjectId(selectedExam.subjects[0]?.id || null);
    }
  }, [selectedExam, selectedSubjectId]);

  const selectedSubject = selectedExam?.subjects.find(s => s.id === selectedSubjectId) || null;

  // Exam CRUD
  const addExam = useCallback((name: string, date: string) => {
    const newExam: Exam = { id: generateId(), name, date, subjects: [] };
    setExams(prev => [...prev, newExam]);
    setSelectedExamId(newExam.id);
    return newExam;
  }, []);

  const updateExam = useCallback((id: string, updates: Partial<Pick<Exam, 'name' | 'date'>>) => {
    setExams(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const deleteExam = useCallback((id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
    if (selectedExamId === id) setSelectedExamId(null);
  }, [selectedExamId]);

  const selectExam = useCallback((id: string) => {
    setSelectedExamId(id);
    setSelectedSubjectId(null);
  }, []);

  // Subject CRUD
  const addSubject = useCallback((name: string) => {
    if (!selectedExamId) return;
    const newSubject: ExamSubject = { id: generateId(), name, chapters: [] };
    setExams(prev => prev.map(e =>
      e.id === selectedExamId ? { ...e, subjects: [...e.subjects, newSubject] } : e
    ));
    setSelectedSubjectId(newSubject.id);
  }, [selectedExamId]);

  const deleteSubject = useCallback((subjectId: string) => {
    if (!selectedExamId) return;
    setExams(prev => prev.map(e =>
      e.id === selectedExamId ? { ...e, subjects: e.subjects.filter(s => s.id !== subjectId) } : e
    ));
  }, [selectedExamId]);

  // Helper to update selected subject's chapters
  const updateSubjectChapters = useCallback((updater: (chapters: Chapter[]) => Chapter[]) => {
    if (!selectedExamId || !selectedSubjectId) return;
    setExams(prev => prev.map(e =>
      e.id === selectedExamId ? {
        ...e,
        subjects: e.subjects.map(s =>
          s.id === selectedSubjectId ? { ...s, chapters: updater(s.chapters) } : s
        ),
      } : e
    ));
  }, [selectedExamId, selectedSubjectId]);

  // Chapter CRUD
  const addChapter = useCallback((name: string) => {
    updateSubjectChapters(chs => [...chs, { id: generateId(), name, sections: [] }]);
  }, [updateSubjectChapters]);

  const updateChapter = useCallback((chapterId: string, name: string) => {
    updateSubjectChapters(chs => chs.map(ch => ch.id === chapterId ? { ...ch, name } : ch));
  }, [updateSubjectChapters]);

  const deleteChapter = useCallback((chapterId: string) => {
    updateSubjectChapters(chs => chs.filter(ch => ch.id !== chapterId));
  }, [updateSubjectChapters]);

  // Section CRUD
  const addSection = useCallback((chapterId: string, name: string) => {
    updateSubjectChapters(chs => chs.map(ch =>
      ch.id === chapterId ? { ...ch, sections: [...ch.sections, { id: generateId(), name, subsections: [] }] } : ch
    ));
  }, [updateSubjectChapters]);

  const updateSection = useCallback((chapterId: string, sectionId: string, name: string) => {
    updateSubjectChapters(chs => chs.map(ch =>
      ch.id === chapterId ? { ...ch, sections: ch.sections.map(s => s.id === sectionId ? { ...s, name } : s) } : ch
    ));
  }, [updateSubjectChapters]);

  const deleteSection = useCallback((chapterId: string, sectionId: string) => {
    updateSubjectChapters(chs => chs.map(ch =>
      ch.id === chapterId ? { ...ch, sections: ch.sections.filter(s => s.id !== sectionId) } : ch
    ));
  }, [updateSubjectChapters]);

  // Subsection CRUD
  const addSubsection = useCallback((chapterId: string, sectionId: string, name: string) => {
    updateSubjectChapters(chs => chs.map(ch =>
      ch.id === chapterId ? {
        ...ch, sections: ch.sections.map(s =>
          s.id === sectionId ? { ...s, subsections: [...s.subsections, { id: generateId(), name, tasks: [] }] } : s
        )
      } : ch
    ));
  }, [updateSubjectChapters]);

  const updateSubsection = useCallback((chapterId: string, sectionId: string, subsectionId: string, name: string) => {
    updateSubjectChapters(chs => chs.map(ch =>
      ch.id === chapterId ? {
        ...ch, sections: ch.sections.map(s =>
          s.id === sectionId ? { ...s, subsections: s.subsections.map(sub => sub.id === subsectionId ? { ...sub, name } : sub) } : s
        )
      } : ch
    ));
  }, [updateSubjectChapters]);

  const deleteSubsection = useCallback((chapterId: string, sectionId: string, subsectionId: string) => {
    updateSubjectChapters(chs => chs.map(ch =>
      ch.id === chapterId ? {
        ...ch, sections: ch.sections.map(s =>
          s.id === sectionId ? { ...s, subsections: s.subsections.filter(sub => sub.id !== subsectionId) } : s
        )
      } : ch
    ));
  }, [updateSubjectChapters]);

  // Task CRUD
  const addTask = useCallback((chapterId: string, sectionId: string, subsectionId: string, name: string) => {
    updateSubjectChapters(chs => chs.map(ch =>
      ch.id === chapterId ? {
        ...ch, sections: ch.sections.map(s =>
          s.id === sectionId ? {
            ...s, subsections: s.subsections.map(sub =>
              sub.id === subsectionId ? { ...sub, tasks: [...sub.tasks, { id: generateId(), name, isCompleted: false }] } : sub
            )
          } : s
        )
      } : ch
    ));
  }, [updateSubjectChapters]);

  const updateTask = useCallback((chapterId: string, sectionId: string, subsectionId: string, taskId: string, name: string) => {
    updateSubjectChapters(chs => chs.map(ch =>
      ch.id === chapterId ? {
        ...ch, sections: ch.sections.map(s =>
          s.id === sectionId ? {
            ...s, subsections: s.subsections.map(sub =>
              sub.id === subsectionId ? { ...sub, tasks: sub.tasks.map(t => t.id === taskId ? { ...t, name } : t) } : sub
            )
          } : s
        )
      } : ch
    ));
  }, [updateSubjectChapters]);

  const deleteTask = useCallback((chapterId: string, sectionId: string, subsectionId: string, taskId: string) => {
    updateSubjectChapters(chs => chs.map(ch =>
      ch.id === chapterId ? {
        ...ch, sections: ch.sections.map(s =>
          s.id === sectionId ? {
            ...s, subsections: s.subsections.map(sub =>
              sub.id === subsectionId ? { ...sub, tasks: sub.tasks.filter(t => t.id !== taskId) } : sub
            )
          } : s
        )
      } : ch
    ));
  }, [updateSubjectChapters]);

  const toggleTask = useCallback((chapterId: string, sectionId: string, subsectionId: string, taskId: string) => {
    updateSubjectChapters(chs => chs.map(ch =>
      ch.id === chapterId ? {
        ...ch, sections: ch.sections.map(s =>
          s.id === sectionId ? {
            ...s, subsections: s.subsections.map(sub =>
              sub.id === subsectionId ? { ...sub, tasks: sub.tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t) } : sub
            )
          } : s
        )
      } : ch
    ));
  }, [updateSubjectChapters]);

  return {
    exams, selectedExam, selectedSubject,
    selectedSubjectId, setSelectedSubjectId,
    addExam, updateExam, deleteExam, selectExam,
    addSubject, deleteSubject,
    addChapter, updateChapter, deleteChapter,
    addSection, updateSection, deleteSection,
    addSubsection, updateSubsection, deleteSubsection,
    addTask, updateTask, deleteTask, toggleTask,
  };
}

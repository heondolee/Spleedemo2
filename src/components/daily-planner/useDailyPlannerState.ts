import { useState, useEffect, useCallback } from 'react';
import {
  DailyPlannerData,
  Subject,
  Todo,
  TimelineBlock,
  DailyInfo,
  getDateString,
  generateId,
  SUBJECT_COLORS,
} from './types';

const STORAGE_KEY_PREFIX = 'splee_dailyPlanner_';
const SUBJECTS_STORAGE_KEY = 'splee_subjects';

function getDefaultData(dateString: string): DailyPlannerData {
  return {
    dailyInfo: {
      date: dateString,
      dday: null,
      dailyQuote: '',
    },
    subjects: [],
    todos: [],
    timelineBlocks: [],
  };
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
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

export function useDailyPlannerState(initialDate?: string) {
  const [currentDate, setCurrentDate] = useState(initialDate || getDateString());
  const [data, setData] = useState<DailyPlannerData>(() => {
    const storageKey = `${STORAGE_KEY_PREFIX}${currentDate}`;
    return loadFromStorage(storageKey, getDefaultData(currentDate));
  });

  // 날짜 변경 시 데이터 로드
  useEffect(() => {
    const storageKey = `${STORAGE_KEY_PREFIX}${currentDate}`;
    const loadedData = loadFromStorage(storageKey, getDefaultData(currentDate));

    // 전역 과목 목록 로드
    const globalSubjects = loadFromStorage<Subject[]>(SUBJECTS_STORAGE_KEY, []);
    if (globalSubjects.length > 0 && loadedData.subjects.length === 0) {
      loadedData.subjects = globalSubjects;
    }

    setData(loadedData);
  }, [currentDate]);

  // 데이터 변경 시 저장
  useEffect(() => {
    const storageKey = `${STORAGE_KEY_PREFIX}${currentDate}`;
    saveToStorage(storageKey, data);

    // 과목 목록은 전역으로도 저장
    if (data.subjects.length > 0) {
      saveToStorage(SUBJECTS_STORAGE_KEY, data.subjects);
    }
  }, [data, currentDate]);

  // 날짜 변경
  const changeDate = useCallback((newDate: string) => {
    setCurrentDate(newDate);
  }, []);

  // Daily Info 업데이트
  const updateDailyInfo = useCallback((updates: Partial<DailyInfo>) => {
    setData(prev => ({
      ...prev,
      dailyInfo: { ...prev.dailyInfo, ...updates },
    }));
  }, []);

  // 과목 관련 함수들
  const addSubject = useCallback((name: string) => {
    const usedColors = new Set(data.subjects.map(s => s.color));
    const availableColor = SUBJECT_COLORS.find(c => !usedColors.has(c)) || SUBJECT_COLORS[0];

    const newSubject: Subject = {
      id: generateId(),
      name,
      color: availableColor,
    };

    setData(prev => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }));

    return newSubject;
  }, [data.subjects]);

  const updateSubject = useCallback((id: string, updates: Partial<Subject>) => {
    setData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== id),
      todos: prev.todos.filter(t => t.subjectId !== id),
      timelineBlocks: prev.timelineBlocks.filter(b => b.subjectId !== id),
    }));
  }, []);

  // Todo 관련 함수들
  const addTodo = useCallback((subjectId: string, content: string) => {
    const newTodo: Todo = {
      id: generateId(),
      subjectId,
      content,
      isCompleted: false,
    };

    setData(prev => ({
      ...prev,
      todos: [...prev.todos, newTodo],
    }));

    return newTodo;
  }, []);

  const updateTodo = useCallback((id: string, updates: Partial<Todo>) => {
    setData(prev => ({
      ...prev,
      todos: prev.todos.map(t =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      todos: prev.todos.filter(t => t.id !== id),
      timelineBlocks: prev.timelineBlocks.filter(b => b.todoId !== id),
    }));
  }, []);

  const toggleTodoComplete = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      todos: prev.todos.map(t =>
        t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
      ),
    }));
  }, []);

  // Timeline Block 관련 함수들
  const addTimelineBlock = useCallback((block: Omit<TimelineBlock, 'id'>) => {
    const newBlock: TimelineBlock = {
      ...block,
      id: generateId(),
    };

    setData(prev => ({
      ...prev,
      timelineBlocks: [...prev.timelineBlocks, newBlock],
    }));

    return newBlock;
  }, []);

  const updateTimelineBlock = useCallback((id: string, updates: Partial<TimelineBlock>) => {
    setData(prev => ({
      ...prev,
      timelineBlocks: prev.timelineBlocks.map(b =>
        b.id === id ? { ...b, ...updates } : b
      ),
    }));
  }, []);

  const deleteTimelineBlock = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      timelineBlocks: prev.timelineBlocks.filter(b => b.id !== id),
    }));
  }, []);

  return {
    data,
    currentDate,
    changeDate,
    updateDailyInfo,
    // Subject
    addSubject,
    updateSubject,
    deleteSubject,
    // Todo
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodoComplete,
    // Timeline
    addTimelineBlock,
    updateTimelineBlock,
    deleteTimelineBlock,
  };
}

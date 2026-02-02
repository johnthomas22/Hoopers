import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Course, Equipment, EquipmentType } from '../types/course';
import { RING_PRESETS, SCALE } from '../utils/equipment';
import { saveCourse, loadCourses, deleteCourse as deleteFromStorage } from '../utils/storage';

const MAX_HISTORY = 50;

function createEmptyCourse(name: string): Course {
  const preset = RING_PRESETS.medium;
  return {
    id: uuidv4(),
    name,
    ringWidth: preset.width,
    ringHeight: preset.height,
    equipment: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function useCourseDesigner() {
  const [course, setCourse] = useState<Course>(() => createEmptyCourse('Untitled Course'));
  const [savedCourses, setSavedCourses] = useState<Course[]>(() => loadCourses());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCourseList, setShowCourseList] = useState(false);

  // Undo/redo history stacks (equipment snapshots only)
  const pastRef = useRef<Equipment[][]>([]);
  const futureRef = useRef<Equipment[][]>([]);

  // Wraps a course updater to snapshot equipment before the change
  const withHistory = useCallback((updater: (prev: Course) => Course) => {
    setCourse((prev) => {
      pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), prev.equipment];
      futureRef.current = [];
      return updater(prev);
    });
  }, []);

  const resetHistory = useCallback(() => {
    pastRef.current = [];
    futureRef.current = [];
  }, []);

  const undo = useCallback(() => {
    setCourse((prev) => {
      if (pastRef.current.length === 0) return prev;
      const previous = pastRef.current[pastRef.current.length - 1];
      pastRef.current = pastRef.current.slice(0, -1);
      futureRef.current = [...futureRef.current, prev.equipment];
      return { ...prev, equipment: previous };
    });
    setSelectedId(null);
  }, []);

  const redo = useCallback(() => {
    setCourse((prev) => {
      if (futureRef.current.length === 0) return prev;
      const next = futureRef.current[futureRef.current.length - 1];
      futureRef.current = futureRef.current.slice(0, -1);
      pastRef.current = [...pastRef.current, prev.equipment];
      return { ...prev, equipment: next };
    });
    setSelectedId(null);
  }, []);

  const canUndo = pastRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;

  const addEquipment = useCallback((type: EquipmentType) => {
    withHistory((prev) => {
      const maxOrder = prev.equipment.reduce(
        (max, e) => (e.orderNumber !== null && e.orderNumber > max ? e.orderNumber : max),
        0,
      );
      const newEquipment: Equipment = {
        id: uuidv4(),
        type,
        x: (prev.ringWidth * SCALE) / 2,
        y: (prev.ringHeight * SCALE) / 2,
        rotation: 0,
        orderNumber: type === 'start' || type === 'finish' ? null : maxOrder + 1,
      };
      return { ...prev, equipment: [...prev.equipment, newEquipment] };
    });
  }, [withHistory]);

  const updateEquipment = useCallback((id: string, updates: Partial<Equipment>) => {
    withHistory((prev) => ({
      ...prev,
      equipment: prev.equipment.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  }, [withHistory]);

  const removeEquipment = useCallback((id: string) => {
    withHistory((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((e) => e.id !== id),
    }));
    setSelectedId((prev) => (prev === id ? null : prev));
  }, [withHistory]);

  const rotateEquipment = useCallback((id: string, delta: number) => {
    withHistory((prev) => ({
      ...prev,
      equipment: prev.equipment.map((e) =>
        e.id === id ? { ...e, rotation: (e.rotation + delta) % 360 } : e,
      ),
    }));
  }, [withHistory]);

  const clearCourse = useCallback(() => {
    withHistory((prev) => ({ ...prev, equipment: [] }));
    setSelectedId(null);
  }, [withHistory]);

  const save = useCallback(() => {
    saveCourse(course);
    setSavedCourses(loadCourses());
  }, [course]);

  const loadCourse = useCallback((id: string) => {
    const courses = loadCourses();
    const found = courses.find((c) => c.id === id);
    if (found) {
      setCourse(found);
      setSelectedId(null);
      setShowCourseList(false);
      resetHistory();
    }
  }, [resetHistory]);

  const deleteCourse = useCallback((id: string) => {
    deleteFromStorage(id);
    setSavedCourses(loadCourses());
  }, []);

  const newCourse = useCallback((name: string) => {
    setCourse(createEmptyCourse(name));
    setSelectedId(null);
    setShowCourseList(false);
    resetHistory();
  }, [resetHistory]);

  const importCourse = useCallback((imported: Course) => {
    setCourse(imported);
    setSelectedId(null);
    resetHistory();
  }, [resetHistory]);

  const setRingSize = useCallback((width: number, height: number) => {
    setCourse((prev) => ({ ...prev, ringWidth: width, ringHeight: height }));
  }, []);

  const renameCourse = useCallback((name: string) => {
    setCourse((prev) => ({ ...prev, name }));
  }, []);

  const renumberEquipment = useCallback(() => {
    withHistory((prev) => {
      const numbered = prev.equipment
        .filter((e) => e.orderNumber !== null)
        .sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0));
      const unnumbered = prev.equipment.filter((e) => e.orderNumber === null);
      const renumbered = numbered.map((e, i) => ({ ...e, orderNumber: i + 1 }));
      return { ...prev, equipment: [...renumbered, ...unnumbered] };
    });
  }, [withHistory]);

  return {
    course,
    selectedId,
    setSelectedId,
    addEquipment,
    updateEquipment,
    removeEquipment,
    rotateEquipment,
    clearCourse,
    save,
    loadCourse,
    deleteCourse,
    newCourse,
    setRingSize,
    renameCourse,
    renumberEquipment,
    importCourse,
    savedCourses,
    showCourseList,
    setShowCourseList,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}

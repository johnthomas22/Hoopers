import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Course, Equipment, EquipmentType } from '../types/course';
import { RING_PRESETS, SCALE } from '../utils/equipment';
import { saveCourse, loadCourses, deleteCourse as deleteFromStorage } from '../utils/storage';

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

  const addEquipment = useCallback((type: EquipmentType) => {
    setCourse((prev) => {
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
  }, []);

  const updateEquipment = useCallback((id: string, updates: Partial<Equipment>) => {
    setCourse((prev) => ({
      ...prev,
      equipment: prev.equipment.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  }, []);

  const removeEquipment = useCallback((id: string) => {
    setCourse((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((e) => e.id !== id),
    }));
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const rotateEquipment = useCallback((id: string, delta: number) => {
    setCourse((prev) => ({
      ...prev,
      equipment: prev.equipment.map((e) =>
        e.id === id ? { ...e, rotation: (e.rotation + delta) % 360 } : e,
      ),
    }));
  }, []);

  const clearCourse = useCallback(() => {
    setCourse((prev) => ({ ...prev, equipment: [] }));
    setSelectedId(null);
  }, []);

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
    }
  }, []);

  const deleteCourse = useCallback((id: string) => {
    deleteFromStorage(id);
    setSavedCourses(loadCourses());
  }, []);

  const newCourse = useCallback((name: string) => {
    setCourse(createEmptyCourse(name));
    setSelectedId(null);
    setShowCourseList(false);
  }, []);

  const setRingSize = useCallback((width: number, height: number) => {
    setCourse((prev) => ({ ...prev, ringWidth: width, ringHeight: height }));
  }, []);

  const renameCourse = useCallback((name: string) => {
    setCourse((prev) => ({ ...prev, name }));
  }, []);

  const renumberEquipment = useCallback(() => {
    setCourse((prev) => {
      const numbered = prev.equipment
        .filter((e) => e.orderNumber !== null)
        .sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0));
      const unnumbered = prev.equipment.filter((e) => e.orderNumber === null);
      const renumbered = numbered.map((e, i) => ({ ...e, orderNumber: i + 1 }));
      return { ...prev, equipment: [...renumbered, ...unnumbered] };
    });
  }, []);

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
    savedCourses,
    showCourseList,
    setShowCourseList,
  };
}

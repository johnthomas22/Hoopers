import type { Course } from '../types/course';

const STORAGE_KEY = 'hoopers-courses';

export function loadCourses(): Course[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Course[];
  } catch {
    return [];
  }
}

export function saveCourses(courses: Course[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

export function saveCourse(course: Course): void {
  const courses = loadCourses();
  const idx = courses.findIndex((c) => c.id === course.id);
  if (idx >= 0) {
    courses[idx] = { ...course, updatedAt: new Date().toISOString() };
  } else {
    courses.push(course);
  }
  saveCourses(courses);
}

export function deleteCourse(id: string): void {
  const courses = loadCourses().filter((c) => c.id !== id);
  saveCourses(courses);
}

import type { Course, EquipmentType } from '../types/course';

const VALID_TYPES: EquipmentType[] = ['hoop', 'barrel', 'tunnel', 'start', 'finish'];

export function validateCourse(data: unknown): Course | null {
  if (typeof data !== 'object' || data === null) return null;
  const obj = data as Record<string, unknown>;

  if (
    typeof obj.id !== 'string' ||
    typeof obj.name !== 'string' ||
    typeof obj.ringWidth !== 'number' ||
    typeof obj.ringHeight !== 'number' ||
    !Array.isArray(obj.equipment)
  ) {
    return null;
  }

  const validEquipment = obj.equipment.every((e: unknown) => {
    if (typeof e !== 'object' || e === null) return false;
    const eq = e as Record<string, unknown>;
    return (
      typeof eq.id === 'string' &&
      VALID_TYPES.includes(eq.type as EquipmentType) &&
      typeof eq.x === 'number' &&
      typeof eq.y === 'number' &&
      typeof eq.rotation === 'number'
    );
  });

  if (!validEquipment) return null;

  return data as Course;
}

export function parseCourseFile(text: string): Course | null {
  try {
    const data: unknown = JSON.parse(text);
    return validateCourse(data);
  } catch {
    return null;
  }
}

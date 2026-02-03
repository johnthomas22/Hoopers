import { useRef, useState } from 'react';
import type { Course, EquipmentType } from '../types/course';

interface Props {
  onLoad: (course: Course) => void;
}

const VALID_TYPES: EquipmentType[] = ['hoop', 'barrel', 'tunnel', 'start', 'finish'];

function isValidCourse(data: unknown): data is Course {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.ringWidth === 'number' &&
    typeof obj.ringHeight === 'number' &&
    Array.isArray(obj.equipment) &&
    obj.equipment.every(
      (e: unknown) =>
        typeof e === 'object' &&
        e !== null &&
        typeof (e as Record<string, unknown>).id === 'string' &&
        VALID_TYPES.includes((e as Record<string, unknown>).type as EquipmentType) &&
        typeof (e as Record<string, unknown>).x === 'number' &&
        typeof (e as Record<string, unknown>).y === 'number' &&
        typeof (e as Record<string, unknown>).rotation === 'number',
    )
  );
}

export default function FileLoader({ onLoad }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (isValidCourse(data)) {
          onLoad(data);
        } else {
          setError('Invalid course file. Please export a course from Hoopers Ring Designer.');
        }
      } catch {
        setError('Could not read file. Make sure it is valid JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="h-dvh flex flex-col items-center justify-center bg-slate-900 text-white p-8">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-2xl font-bold">Hoopers Sim</h1>
        <p className="text-slate-400 text-sm">
          Load a course JSON file exported from Hoopers Ring Designer to see an animated simulation of a dog running the course.
        </p>

        <button
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          Load Course JSON
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
        />

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
}

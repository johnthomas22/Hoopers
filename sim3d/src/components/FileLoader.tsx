import { useCallback, useRef } from 'react';
import type { Course } from '../types/course';
import { parseCourseFile } from '../utils/courseLoader';

interface Props {
  onLoad: (course: Course) => void;
}

export default function FileLoader({ onLoad }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const course = parseCourseFile(reader.result as string);
        if (course) {
          onLoad(course);
        } else {
          alert('Invalid course file. Export a course from the Ring Designer.');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [onLoad],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const course = parseCourseFile(reader.result as string);
        if (course) {
          onLoad(course);
        } else {
          alert('Invalid course file.');
        }
      };
      reader.readAsText(file);
    },
    [onLoad],
  );

  return (
    <div className="h-dvh flex items-center justify-center bg-slate-900 p-4">
      <div
        className="max-w-md w-full bg-slate-800 rounded-2xl p-8 text-center border-2 border-dashed border-slate-600 hover:border-indigo-500 transition-colors cursor-pointer"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-4xl mb-4">🐕</div>
        <h1 className="text-2xl font-bold text-white mb-2">Hoopers 3D Simulator</h1>
        <p className="text-slate-400 mb-6">
          Load a course exported from the Ring Designer to start the interactive handler training simulator.
        </p>
        <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors">
          Load Course JSON
        </button>
        <p className="text-slate-500 text-sm mt-4">
          Or drag and drop a .json file here
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFile}
          className="hidden"
        />
      </div>
    </div>
  );
}

import { useState } from 'react';
import type { Course } from './types/course';
import FileLoader from './components/FileLoader';
import SimulatorView from './components/SimulatorView';

export default function App() {
  const [course, setCourse] = useState<Course | null>(null);

  if (!course) {
    return <FileLoader onLoad={setCourse} />;
  }

  return <SimulatorView course={course} onBack={() => setCourse(null)} />;
}

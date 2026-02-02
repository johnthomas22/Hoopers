import { useState } from 'react';
import type { Course } from './types/course';
import FileLoader from './components/FileLoader';
import SimCanvas from './components/SimCanvas';
import PlaybackBar from './components/PlaybackBar';
import { useSimulation } from './hooks/useSimulation';

export default function App() {
  const [course, setCourse] = useState<Course | null>(null);
  const simulation = useSimulation(course);

  if (!course) {
    return <FileLoader onLoad={setCourse} />;
  }

  return (
    <div className="h-dvh flex flex-col bg-slate-900 text-white select-none">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center justify-between">
        <h1 className="text-sm font-semibold truncate">{course.name}</h1>
        <button
          className="px-3 py-1 rounded text-xs bg-slate-700 hover:bg-slate-600 transition-colors"
          onClick={() => { setCourse(null); simulation.reset(); }}
        >
          Load Different Course
        </button>
      </div>

      {/* Canvas */}
      <SimCanvas
        course={course}
        dogPosition={simulation.dogPosition}
        dogHeading={simulation.dogHeading}
        handlerPosition={simulation.handlerPosition}
        pathPoints={simulation.pathPoints}
        progress={simulation.state.progress}
      />

      {/* Playback controls */}
      <PlaybackBar
        state={simulation.state}
        onPlayPause={simulation.togglePlay}
        onRestart={simulation.restart}
        onSeek={simulation.seek}
        onSpeedChange={simulation.setSpeed}
        onStepForward={simulation.stepForward}
        onStepBack={simulation.stepBack}
      />
    </div>
  );
}

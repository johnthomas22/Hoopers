import { useCallback, useEffect } from 'react';
import type { Course } from '../types/course';
import type { Signal } from '../types/simulation';
import { useSimulation3D } from '../hooks/useSimulation3D';
import Scene from './Scene';
import Dog3D from './Dog3D';
import Handler3D from './Handler3D';
import FollowCamera from './FollowCamera';
import SimulationRunner from './SimulationRunner';
import SignalPanel from './ui/SignalPanel';
import HUD from './ui/HUD';
import ResultsOverlay from './ui/ResultsOverlay';

interface Props {
  course: Course;
  onBack: () => void;
}

export default function SimulatorView({ course, onBack }: Props) {
  const sim = useSimulation3D(course);

  // Keyboard handler for signals
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!sim.state.running && !sim.state.finished) {
        // Space to start
        if (e.code === 'Space') {
          e.preventDefault();
          sim.start();
          return;
        }
      }

      let signal: Signal | null = null;
      switch (e.code) {
        case 'ArrowLeft':
          signal = 'left';
          break;
        case 'ArrowRight':
          signal = 'right';
          break;
        case 'ArrowUp':
          signal = 'go_on';
          break;
        case 'ArrowDown':
          signal = 'wait';
          break;
        case 'Space':
          e.preventDefault();
          signal = 'go';
          break;
      }
      if (signal) {
        sim.sendSignal(signal);
      }
    },
    [sim],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const isSimulating = sim.state.running || sim.state.finished;

  return (
    <div className="h-dvh flex flex-col bg-slate-900">
      {/* Top bar */}
      <div className="bg-slate-800/90 border-b border-slate-700 px-4 py-2 flex items-center gap-3 z-10">
        <button
          onClick={onBack}
          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded-lg transition-colors"
        >
          Back
        </button>
        <span className="text-white text-sm font-medium truncate">{course.name}</span>
        {!sim.state.running && !sim.state.finished && (
          <button
            onClick={sim.start}
            className="ml-auto px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Start Run
          </button>
        )}
        {sim.state.finished && (
          <button
            onClick={sim.reset}
            className="ml-auto px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Scene course={course} orbitControls={!isSimulating} onGroundClick={isSimulating ? sim.moveHandler : undefined}>
          {isSimulating && (
            <>
              <Dog3D
                position={sim.dogPosition}
                rotation={sim.dogRotation}
                speed={sim.state.dogSpeed}
              />
              <Handler3D
                position={sim.handlerPosition}
                rotation={sim.handlerRotation}
              />
              <FollowCamera
                handlerPosition={sim.handlerPosition}
                dogPosition={sim.dogPosition}
                handlerRotation={sim.handlerRotation}
                enabled={sim.state.running}
              />
              <SimulationRunner
                running={sim.state.running}
                onTick={sim.tick}
              />
            </>
          )}
        </Scene>

        {/* HUD overlay */}
        {sim.state.running && (
          <HUD
            elapsedTime={sim.state.elapsedTime}
            faults={sim.state.faults}
            dogState={sim.state.dogState}
            currentObstacle={sim.currentObstacleName}
            expectedSignal={sim.expectedSignal}
          />
        )}

        {/* Signal buttons for mobile */}
        {sim.state.running && (
          <SignalPanel onSignal={sim.sendSignal} />
        )}

        {/* Start prompt */}
        {!sim.state.running && !sim.state.finished && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-slate-800/80 rounded-xl px-8 py-6 text-center">
              <p className="text-white text-lg font-medium mb-2">Ready to run?</p>
              <p className="text-slate-400 text-sm">
                Press <kbd className="px-2 py-0.5 bg-slate-700 rounded text-white">Space</kbd> or tap Start Run
              </p>
            </div>
          </div>
        )}

        {/* Results overlay */}
        {sim.state.finished && (
          <ResultsOverlay
            elapsedTime={sim.state.elapsedTime}
            faults={sim.state.faults}
            onReset={sim.reset}
          />
        )}
      </div>
    </div>
  );
}

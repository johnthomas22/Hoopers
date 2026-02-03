import { useEffect, useCallback } from 'react';
import type { PlaybackState } from '../types/simulation';

interface Props {
  state: PlaybackState;
  onPlayPause: () => void;
  onRestart: () => void;
  onSeek: (progress: number) => void;
  onSpeedChange: (speed: number) => void;
  onStepForward: () => void;
  onStepBack: () => void;
}

const SPEEDS = [0.5, 1, 1.5, 2];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PlaybackBar({
  state,
  onPlayPause,
  onRestart,
  onSeek,
  onSpeedChange,
  onStepForward,
  onStepBack,
}: Props) {
  const currentTime = state.progress * state.duration;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          onPlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onStepBack();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onStepForward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          {
            const idx = SPEEDS.indexOf(state.speed);
            if (idx < SPEEDS.length - 1) onSpeedChange(SPEEDS[idx + 1]);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          {
            const idx = SPEEDS.indexOf(state.speed);
            if (idx > 0) onSpeedChange(SPEEDS[idx - 1]);
          }
          break;
      }
    },
    [onPlayPause, onStepBack, onStepForward, onSpeedChange, state.speed],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="bg-slate-800 border-t border-slate-700 px-4 py-3 flex items-center gap-3">
      {/* Transport controls */}
      <button
        className="p-1.5 rounded hover:bg-slate-700 transition-colors"
        onClick={onRestart}
        title="Restart"
      >
        <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
          <path d="M4 4h2v12H4V4zm4 6l8-6v12l-8-6z" />
        </svg>
      </button>

      <button
        className="p-1.5 rounded hover:bg-slate-700 transition-colors"
        onClick={onStepBack}
        title="Step Back"
      >
        <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
          <path d="M14 4l-8 6 8 6V4zM6 4H4v12h2V4z" />
        </svg>
      </button>

      <button
        className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors"
        onClick={onPlayPause}
        title={state.playing ? 'Pause' : 'Play'}
      >
        {state.playing ? (
          <svg viewBox="0 0 20 20" className="w-5 h-5 fill-current">
            <path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" className="w-5 h-5 fill-current">
            <path d="M6 4l10 6-10 6V4z" />
          </svg>
        )}
      </button>

      <button
        className="p-1.5 rounded hover:bg-slate-700 transition-colors"
        onClick={onStepForward}
        title="Step Forward"
      >
        <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
          <path d="M6 4l8 6-8 6V4zm8 0h2v12h-2V4z" />
        </svg>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-600" />

      {/* Speed controls */}
      {SPEEDS.map((s) => (
        <button
          key={s}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            state.speed === s
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          onClick={() => onSpeedChange(s)}
        >
          {s}x
        </button>
      ))}

      {/* Divider */}
      <div className="w-px h-6 bg-slate-600" />

      {/* Timeline slider */}
      <input
        type="range"
        min={0}
        max={1}
        step={0.001}
        value={state.progress}
        onChange={(e) => onSeek(parseFloat(e.target.value))}
        className="flex-1 h-1.5 accent-blue-500 cursor-pointer"
      />

      {/* Time display */}
      <span className="text-xs text-slate-400 font-mono w-20 text-right">
        {formatTime(currentTime)} / {formatTime(state.duration)}
      </span>
    </div>
  );
}

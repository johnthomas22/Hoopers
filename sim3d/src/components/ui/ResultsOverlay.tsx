interface Props {
  elapsedTime: number;
  faults: number;
  onReset: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hundredths = Math.floor((seconds % 1) * 100);
  return `${mins}:${secs.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
}

export default function ResultsOverlay({ elapsedTime, faults, onReset }: Props) {
  const isClean = faults === 0;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50">
      <div className="bg-slate-800 rounded-2xl p-8 text-center max-w-sm w-full mx-4">
        <div className="text-4xl mb-2">{isClean ? '🎉' : '🐕'}</div>
        <h2 className="text-2xl font-bold text-white mb-4">
          {isClean ? 'Clean Run!' : 'Run Complete'}
        </h2>

        <div className="space-y-3 mb-6">
          <div className="bg-slate-700 rounded-lg p-3">
            <div className="text-slate-400 text-xs uppercase">Time</div>
            <div className="text-white text-2xl font-mono font-bold">
              {formatTime(elapsedTime)}
            </div>
          </div>

          <div className={`rounded-lg p-3 ${isClean ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
            <div className="text-slate-400 text-xs uppercase">Faults</div>
            <div className={`text-2xl font-bold ${isClean ? 'text-green-400' : 'text-red-400'}`}>
              {faults}
            </div>
          </div>
        </div>

        <button
          onClick={onReset}
          className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

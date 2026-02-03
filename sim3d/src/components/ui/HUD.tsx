import type { DogBehaviorState, Signal } from '../../types/simulation';

interface Props {
  elapsedTime: number;
  faults: number;
  dogState: DogBehaviorState;
  currentObstacle: string;
  expectedSignal: Signal | null;
}

const STATE_LABELS: Record<DogBehaviorState, { label: string; color: string }> = {
  idle: { label: 'Idle', color: 'text-slate-400' },
  approaching: { label: 'Running', color: 'text-green-400' },
  committed: { label: 'Committed', color: 'text-blue-400' },
  hesitating: { label: 'Hesitating!', color: 'text-amber-400' },
  waiting: { label: 'Waiting', color: 'text-yellow-400' },
  taking_wrong: { label: 'Wrong!', color: 'text-red-400' },
  recovering: { label: 'Recovering', color: 'text-orange-400' },
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hundredths = Math.floor((seconds % 1) * 100);
  return `${mins}:${secs.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
}

export default function HUD({ elapsedTime, faults, dogState, currentObstacle, expectedSignal }: Props) {
  const stateInfo = STATE_LABELS[dogState];

  return (
    <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10 pointer-events-none">
      {/* Left: Timer and faults */}
      <div className="bg-slate-800/80 rounded-lg px-3 py-2">
        <div className="text-white text-xl font-mono font-bold">
          {formatTime(elapsedTime)}
        </div>
        <div className={`text-sm font-medium ${faults > 0 ? 'text-red-400' : 'text-green-400'}`}>
          {faults === 0 ? 'Clean run' : `${faults} fault${faults > 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Center: Dog state */}
      <div className="bg-slate-800/80 rounded-lg px-3 py-2 text-center">
        <div className={`text-sm font-bold ${stateInfo.color}`}>
          {stateInfo.label}
        </div>
        {currentObstacle && (
          <div className="text-slate-300 text-xs mt-0.5">
            Next: {currentObstacle}
          </div>
        )}
      </div>

      {/* Right: Expected signal hint */}
      <div className="bg-slate-800/80 rounded-lg px-3 py-2 text-right">
        {expectedSignal && (
          <>
            <div className="text-slate-400 text-xs">Signal needed:</div>
            <div className="text-white text-sm font-bold uppercase">
              {expectedSignal}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

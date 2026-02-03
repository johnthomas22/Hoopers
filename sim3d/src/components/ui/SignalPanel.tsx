import type { Signal } from '../../types/simulation';

interface Props {
  onSignal: (signal: Signal) => void;
}

export default function SignalPanel({ onSignal }: Props) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
      <button
        onPointerDown={() => onSignal('left')}
        className="w-14 h-14 bg-blue-600/80 hover:bg-blue-500 text-white font-bold rounded-xl text-lg active:scale-90 transition-transform touch-none"
      >
        L
      </button>
      <div className="flex flex-col gap-2">
        <button
          onPointerDown={() => onSignal('go_on')}
          className="w-14 h-10 bg-green-600/80 hover:bg-green-500 text-white font-bold rounded-xl text-xs active:scale-90 transition-transform touch-none"
        >
          GO ON
        </button>
        <button
          onPointerDown={() => onSignal('wait')}
          className="w-14 h-10 bg-amber-600/80 hover:bg-amber-500 text-white font-bold rounded-xl text-xs active:scale-90 transition-transform touch-none"
        >
          WAIT
        </button>
      </div>
      <button
        onPointerDown={() => onSignal('right')}
        className="w-14 h-14 bg-blue-600/80 hover:bg-blue-500 text-white font-bold rounded-xl text-lg active:scale-90 transition-transform touch-none"
      >
        R
      </button>
      <button
        onPointerDown={() => onSignal('go')}
        className="w-14 h-14 bg-indigo-600/80 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs active:scale-90 transition-transform touch-none"
      >
        GO!
      </button>
    </div>
  );
}

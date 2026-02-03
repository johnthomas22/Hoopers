import { useFrame } from '@react-three/fiber';

interface Props {
  running: boolean;
  onTick: (delta: number) => void;
}

export default function SimulationRunner({ running, onTick }: Props) {
  useFrame((_, delta) => {
    if (running) {
      // Clamp delta to avoid large jumps when tab is unfocused
      onTick(Math.min(delta, 0.1));
    }
  });

  return null;
}

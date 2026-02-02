import { Circle, Line, Group } from 'react-konva';
import type { Point } from '../types/simulation';

interface Props {
  position: Point;
  dogPosition: Point;
}

export default function HandlerSprite({ position, dogPosition }: Props) {
  const r = 6;

  return (
    <Group>
      {/* Line connecting handler to dog */}
      <Line
        points={[position.x, position.y, dogPosition.x, dogPosition.y]}
        stroke="#60A5FA"
        strokeWidth={1}
        dash={[4, 4]}
        opacity={0.5}
      />
      <Circle
        x={position.x}
        y={position.y}
        radius={r}
        fill="#3B82F6"
        stroke="#1D4ED8"
        strokeWidth={2}
      />
    </Group>
  );
}

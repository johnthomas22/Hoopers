import { Circle, Line, Group } from 'react-konva';
import type { Point } from '../types/simulation';

interface Props {
  position: Point;
  heading: number; // radians
}

export default function DogSprite({ position, heading }: Props) {
  const r = 8;
  const headingDeg = (heading * 180) / Math.PI;

  // Direction triangle points (pointing right at 0 degrees)
  const triSize = 6;
  const triPoints = [
    r + 2, 0,
    r + 2 - triSize, -triSize / 2,
    r + 2 - triSize, triSize / 2,
  ];

  return (
    <Group x={position.x} y={position.y} rotation={headingDeg}>
      <Circle
        x={0}
        y={0}
        radius={r}
        fill="#D97706"
        stroke="#92400E"
        strokeWidth={2}
      />
      <Line
        points={triPoints}
        closed
        fill="#92400E"
      />
    </Group>
  );
}

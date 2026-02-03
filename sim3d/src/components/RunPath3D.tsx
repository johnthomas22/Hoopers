import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import type { Course } from '../types/course';
import { SCALE } from '../utils/equipment';

interface Props {
  course: Course;
}

export default function RunPath3D({ course }: Props) {
  const points = useMemo(() => {
    const numbered = course.equipment
      .filter((e) => e.orderNumber !== null)
      .sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0));

    const startMarker = course.equipment.find((e) => e.type === 'start');
    const finishMarker = course.equipment.find((e) => e.type === 'finish');

    const allPoints: [number, number, number][] = [];

    if (startMarker) {
      allPoints.push([startMarker.x / SCALE, 0.03, startMarker.y / SCALE]);
    }
    for (const eq of numbered) {
      allPoints.push([eq.x / SCALE, 0.03, eq.y / SCALE]);
    }
    if (finishMarker) {
      allPoints.push([finishMarker.x / SCALE, 0.03, finishMarker.y / SCALE]);
    }

    return allPoints;
  }, [course.equipment]);

  if (points.length < 2) return null;

  return (
    <Line
      points={points}
      color="#F472B6"
      lineWidth={2}
      dashed
      dashSize={0.3}
      gapSize={0.15}
      opacity={0.7}
      transparent
    />
  );
}

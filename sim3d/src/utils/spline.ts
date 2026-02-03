import type { PathPoint } from '../types/simulation';

/**
 * Catmull-Rom spline interpolation between points.
 * Returns a smooth path through all given points.
 */
export function catmullRomSpline(
  points: PathPoint[],
  segmentsPerSpan: number = 20,
): PathPoint[] {
  if (points.length < 2) return [...points];
  if (points.length === 2) {
    return linearInterpolate(points[0], points[1], segmentsPerSpan);
  }

  const result: PathPoint[] = [];

  // Pad with phantom points at start and end
  const padded = [
    { x: 2 * points[0].x - points[1].x, y: 2 * points[0].y - points[1].y },
    ...points,
    {
      x: 2 * points[points.length - 1].x - points[points.length - 2].x,
      y: 2 * points[points.length - 1].y - points[points.length - 2].y,
    },
  ];

  for (let i = 1; i < padded.length - 2; i++) {
    const p0 = padded[i - 1];
    const p1 = padded[i];
    const p2 = padded[i + 1];
    const p3 = padded[i + 2];

    for (let j = 0; j < segmentsPerSpan; j++) {
      const t = j / segmentsPerSpan;
      result.push(catmullRomPoint(p0, p1, p2, p3, t));
    }
  }

  // Add the last point
  result.push(points[points.length - 1]);

  return result;
}

function catmullRomPoint(
  p0: PathPoint,
  p1: PathPoint,
  p2: PathPoint,
  p3: PathPoint,
  t: number,
): PathPoint {
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x:
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y:
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

function linearInterpolate(
  a: PathPoint,
  b: PathPoint,
  segments: number,
): PathPoint[] {
  const result: PathPoint[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    result.push({
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    });
  }
  return result;
}

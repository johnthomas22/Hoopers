import type { PathPoint } from '../types/simulation';

/** Cumulative arc-length distances for each point in the path */
export function computeArcLengths(path: PathPoint[]): number[] {
  const lengths: number[] = [0];
  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i - 1].x;
    const dy = path[i].y - path[i - 1].y;
    lengths.push(lengths[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }
  return lengths;
}

/** Total length of the path */
export function totalLength(arcLengths: number[]): number {
  return arcLengths[arcLengths.length - 1];
}

/** Sample position at a given distance along the path */
export function sampleAtDistance(
  path: PathPoint[],
  arcLengths: number[],
  distance: number,
): PathPoint {
  if (distance <= 0) return path[0];
  const total = arcLengths[arcLengths.length - 1];
  if (distance >= total) return path[path.length - 1];

  // Binary search for the segment
  let lo = 0;
  let hi = arcLengths.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (arcLengths[mid] <= distance) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const segLen = arcLengths[hi] - arcLengths[lo];
  const t = segLen > 0 ? (distance - arcLengths[lo]) / segLen : 0;

  return {
    x: path[lo].x + (path[hi].x - path[lo].x) * t,
    y: path[lo].y + (path[hi].y - path[lo].y) * t,
  };
}

/** Sample direction (unit vector) at a given distance along the path */
export function sampleDirectionAtDistance(
  path: PathPoint[],
  arcLengths: number[],
  distance: number,
): PathPoint {
  const epsilon = 0.1;
  const total = arcLengths[arcLengths.length - 1];
  const d0 = Math.max(0, distance - epsilon);
  const d1 = Math.min(total, distance + epsilon);

  const p0 = sampleAtDistance(path, arcLengths, d0);
  const p1 = sampleAtDistance(path, arcLengths, d1);

  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const len = Math.sqrt(dx * dx + dy * dy);

  if (len < 0.0001) return { x: 1, y: 0 };
  return { x: dx / len, y: dy / len };
}

/** Find the distance along the path closest to a given obstacle position */
export function findDistanceForPoint(
  path: PathPoint[],
  arcLengths: number[],
  point: PathPoint,
  searchStep: number = 0.5,
): number {
  const total = arcLengths[arcLengths.length - 1];
  let bestDist = 0;
  let bestSqDist = Infinity;

  for (let d = 0; d <= total; d += searchStep) {
    const p = sampleAtDistance(path, arcLengths, d);
    const dx = p.x - point.x;
    const dy = p.y - point.y;
    const sqDist = dx * dx + dy * dy;
    if (sqDist < bestSqDist) {
      bestSqDist = sqDist;
      bestDist = d;
    }
  }

  return bestDist;
}

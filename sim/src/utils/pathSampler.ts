import type { Point } from '../types/simulation';
import { sampleSpline } from './spline';

/**
 * Arc-length parameterized path sampler.
 * Builds a lookup table mapping cumulative distance to spline parameter,
 * then provides sampleAt(t) where t is 0-1 of total path length.
 */

interface ArcLengthEntry {
  distance: number; // cumulative distance from start
  param: number; // spline parameter (segment-based)
}

export interface PathSampler {
  /** Total path length in pixels */
  totalLength: number;
  /** Sample position and tangent at progress t (0-1) */
  sampleAt(t: number): { position: Point; tangent: Point };
  /** Get all control points */
  controlPoints: Point[];
}

/**
 * Build an arc-length parameterized sampler for the given control points.
 */
export function buildPathSampler(
  controlPoints: Point[],
  tension: number = 0.5,
  tableResolution: number = 500,
): PathSampler {
  if (controlPoints.length < 2) {
    const pos = controlPoints[0] ?? { x: 0, y: 0 };
    return {
      totalLength: 0,
      sampleAt: () => ({ position: pos, tangent: { x: 1, y: 0 } }),
      controlPoints,
    };
  }

  const maxParam = controlPoints.length - 1;
  const table: ArcLengthEntry[] = [];
  let cumulativeDist = 0;
  let prevPos = sampleSpline(controlPoints, tension, 0).position;

  table.push({ distance: 0, param: 0 });

  for (let i = 1; i <= tableResolution; i++) {
    const param = (i / tableResolution) * maxParam;
    const { position } = sampleSpline(controlPoints, tension, param);
    const dx = position.x - prevPos.x;
    const dy = position.y - prevPos.y;
    cumulativeDist += Math.sqrt(dx * dx + dy * dy);
    table.push({ distance: cumulativeDist, param });
    prevPos = position;
  }

  const totalLength = cumulativeDist;

  function distanceToParam(targetDist: number): number {
    if (targetDist <= 0) return 0;
    if (targetDist >= totalLength) return maxParam;

    // Binary search
    let lo = 0;
    let hi = table.length - 1;
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1;
      if (table[mid].distance < targetDist) {
        lo = mid;
      } else {
        hi = mid;
      }
    }

    // Linear interpolation between lo and hi
    const loEntry = table[lo];
    const hiEntry = table[hi];
    const segLen = hiEntry.distance - loEntry.distance;
    if (segLen < 1e-10) return loEntry.param;

    const frac = (targetDist - loEntry.distance) / segLen;
    return loEntry.param + frac * (hiEntry.param - loEntry.param);
  }

  return {
    totalLength,
    controlPoints,
    sampleAt(t: number) {
      const clampedT = Math.max(0, Math.min(1, t));
      const targetDist = clampedT * totalLength;
      const param = distanceToParam(targetDist);
      const { position, tangent } = sampleSpline(controlPoints, tension, param);

      // Normalize tangent
      const len = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y);
      if (len > 1e-10) {
        tangent.x /= len;
        tangent.y /= len;
      }

      return { position, tangent };
    },
  };
}

/**
 * Compute handler position offset from the dog path.
 * Offset perpendicular to dog direction, biased toward ring center.
 */
export function computeHandlerPosition(
  dogPos: Point,
  dogTangent: Point,
  ringWidth: number,
  ringHeight: number,
  offsetDistance: number,
  prevHandlerPos: Point | null,
  smoothing: number,
): Point {
  // Perpendicular directions (left and right of travel direction)
  const perpLeft = { x: -dogTangent.y, y: dogTangent.x };
  const perpRight = { x: dogTangent.y, y: -dogTangent.x };

  // Ring center in pixel coordinates
  const centerX = ringWidth / 2;
  const centerY = ringHeight / 2;

  // Choose the perpendicular direction that points more toward ring center
  const toCenterX = centerX - dogPos.x;
  const toCenterY = centerY - dogPos.y;

  const dotLeft = perpLeft.x * toCenterX + perpLeft.y * toCenterY;
  const dotRight = perpRight.x * toCenterX + perpRight.y * toCenterY;

  const perp = dotLeft > dotRight ? perpLeft : perpRight;

  // Raw handler position
  let hx = dogPos.x + perp.x * offsetDistance;
  let hy = dogPos.y + perp.y * offsetDistance;

  // Clamp to ring bounds (with padding)
  const pad = 10;
  hx = Math.max(pad, Math.min(ringWidth - pad, hx));
  hy = Math.max(pad, Math.min(ringHeight - pad, hy));

  // Apply exponential smoothing if we have a previous position
  if (prevHandlerPos) {
    hx = prevHandlerPos.x + smoothing * (hx - prevHandlerPos.x);
    hy = prevHandlerPos.y + smoothing * (hy - prevHandlerPos.y);
  }

  return { x: hx, y: hy };
}

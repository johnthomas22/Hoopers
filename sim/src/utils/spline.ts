import type { Point } from '../types/simulation';

/**
 * Cardinal spline (Catmull-Rom with configurable tension).
 * Given control points and tension (0.5 = Catmull-Rom, matching Konva's default),
 * generates dense sample points along the spline.
 */

/**
 * Compute tangents for each control point using Catmull-Rom formula:
 * m[i] = (1 - tension) / 2 * (P[i+1] - P[i-1])
 * At endpoints, uses the segment direction doubled.
 */
function computeTangents(points: Point[], tension: number): Point[] {
  const n = points.length;
  const tangents: Point[] = [];
  const t = (1 - tension) / 2;

  for (let i = 0; i < n; i++) {
    if (i === 0) {
      // First point: use forward difference
      tangents.push({
        x: t * (points[1].x - points[0].x) * 2,
        y: t * (points[1].y - points[0].y) * 2,
      });
    } else if (i === n - 1) {
      // Last point: use backward difference
      tangents.push({
        x: t * (points[n - 1].x - points[n - 2].x) * 2,
        y: t * (points[n - 1].y - points[n - 2].y) * 2,
      });
    } else {
      tangents.push({
        x: t * (points[i + 1].x - points[i - 1].x),
        y: t * (points[i + 1].y - points[i - 1].y),
      });
    }
  }

  return tangents;
}

/**
 * Evaluate cubic Hermite polynomial between two points.
 * Returns position at parameter t (0-1) on the segment.
 */
function hermite(
  p0: Point,
  p1: Point,
  m0: Point,
  m1: Point,
  t: number,
): Point {
  const t2 = t * t;
  const t3 = t2 * t;

  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;

  return {
    x: h00 * p0.x + h10 * m0.x + h01 * p1.x + h11 * m1.x,
    y: h00 * p0.y + h10 * m0.y + h01 * p1.y + h11 * m1.y,
  };
}

/**
 * Evaluate tangent (derivative) of cubic Hermite at parameter t.
 */
function hermiteTangent(
  p0: Point,
  p1: Point,
  m0: Point,
  m1: Point,
  t: number,
): Point {
  const t2 = t * t;

  const dh00 = 6 * t2 - 6 * t;
  const dh10 = 3 * t2 - 4 * t + 1;
  const dh01 = -6 * t2 + 6 * t;
  const dh11 = 3 * t2 - 2 * t;

  return {
    x: dh00 * p0.x + dh10 * m0.x + dh01 * p1.x + dh11 * m1.x,
    y: dh00 * p0.y + dh10 * m0.y + dh01 * p1.y + dh11 * m1.y,
  };
}

/**
 * Generate dense points along a cardinal spline through the given control points.
 * Returns flat array [x0, y0, x1, y1, ...] for use with Konva Line.
 */
export function generateSplinePoints(
  controlPoints: Point[],
  tension: number = 0.5,
  samplesPerSegment: number = 50,
): number[] {
  if (controlPoints.length < 2) {
    return controlPoints.flatMap((p) => [p.x, p.y]);
  }

  const tangents = computeTangents(controlPoints, tension);
  const result: number[] = [];

  for (let i = 0; i < controlPoints.length - 1; i++) {
    const steps = samplesPerSegment;
    for (let s = 0; s <= (i === controlPoints.length - 2 ? steps : steps - 1); s++) {
      const t = s / steps;
      const p = hermite(controlPoints[i], controlPoints[i + 1], tangents[i], tangents[i + 1], t);
      result.push(p.x, p.y);
    }
  }

  return result;
}

/**
 * Sample position and tangent at parameter t along the spline.
 * t is in [0, controlPoints.length - 1] range (segment-based).
 */
export function sampleSpline(
  controlPoints: Point[],
  tension: number,
  t: number,
): { position: Point; tangent: Point } {
  if (controlPoints.length < 2) {
    return {
      position: controlPoints[0] ?? { x: 0, y: 0 },
      tangent: { x: 1, y: 0 },
    };
  }

  const tangents = computeTangents(controlPoints, tension);
  const maxT = controlPoints.length - 1;
  const clampedT = Math.max(0, Math.min(maxT, t));

  const segIdx = Math.min(Math.floor(clampedT), controlPoints.length - 2);
  const localT = clampedT - segIdx;

  const position = hermite(
    controlPoints[segIdx],
    controlPoints[segIdx + 1],
    tangents[segIdx],
    tangents[segIdx + 1],
    localT,
  );

  const tangent = hermiteTangent(
    controlPoints[segIdx],
    controlPoints[segIdx + 1],
    tangents[segIdx],
    tangents[segIdx + 1],
    localT,
  );

  return { position, tangent };
}

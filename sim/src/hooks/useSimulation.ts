import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { Course } from '../types/course';
import type { Point, PlaybackState } from '../types/simulation';
import { SCALE } from '../utils/equipment';
import { generateSplinePoints } from '../utils/spline';
import { buildPathSampler, computeHandlerPosition } from '../utils/pathSampler';

const DOG_SPEED = 3.5; // meters per second
const HANDLER_OFFSET = 3 * SCALE; // 3 meters in pixels
const HANDLER_SMOOTHING = 0.12;
const STEP_SIZE = 0.02; // 2% per step

/**
 * Extract ordered control points from course:
 * Start -> numbered obstacles (by orderNumber) -> Finish
 */
function getControlPoints(course: Course): Point[] {
  const points: Point[] = [];

  const startMarker = course.equipment.find((e) => e.type === 'start');
  if (startMarker) points.push({ x: startMarker.x, y: startMarker.y });

  const numbered = course.equipment
    .filter((e) => e.orderNumber !== null)
    .sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0));
  for (const e of numbered) {
    points.push({ x: e.x, y: e.y });
  }

  const finishMarker = course.equipment.find((e) => e.type === 'finish');
  if (finishMarker) points.push({ x: finishMarker.x, y: finishMarker.y });

  return points;
}

export interface SimulationReturn {
  state: PlaybackState;
  dogPosition: Point;
  dogHeading: number;
  handlerPosition: Point;
  pathPoints: number[];
  togglePlay: () => void;
  restart: () => void;
  seek: (progress: number) => void;
  setSpeed: (speed: number) => void;
  stepForward: () => void;
  stepBack: () => void;
  reset: () => void;
}

export function useSimulation(course: Course | null): SimulationReturn {
  const [state, setState] = useState<PlaybackState>({
    playing: false,
    progress: 0,
    speed: 1,
    duration: 0,
  });

  const handlerPosRef = useRef<Point | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Build path sampler when course changes
  const { sampler, pathPoints } = useMemo(() => {
    if (!course) {
      return {
        sampler: null,
        pathPoints: [] as number[],
      };
    }

    const cp = getControlPoints(course);
    const s = cp.length >= 2 ? buildPathSampler(cp, 0.5) : null;
    const pp = cp.length >= 2 ? generateSplinePoints(cp, 0.5, 50) : [];

    return { sampler: s, pathPoints: pp };
  }, [course]);

  // Calculate duration from path length and dog speed
  useEffect(() => {
    if (sampler) {
      const lengthMeters = sampler.totalLength / SCALE;
      const duration = lengthMeters / DOG_SPEED;
      setState((prev) => ({ ...prev, duration, progress: 0, playing: false }));
      handlerPosRef.current = null;
    }
  }, [sampler]);

  // Compute dog position and heading from current progress
  const getDogState = useCallback(
    (progress: number) => {
      if (!sampler) {
        return {
          position: { x: 0, y: 0 },
          heading: 0,
        };
      }

      const { position, tangent } = sampler.sampleAt(progress);
      const heading = Math.atan2(tangent.y, tangent.x);

      return { position, heading };
    },
    [sampler],
  );

  // Compute handler position
  const getHandlerPosition = useCallback(
    (dogPos: Point, dogTangent: { x: number; y: number }) => {
      if (!course) return { x: 0, y: 0 };

      const ringW = course.ringWidth * SCALE;
      const ringH = course.ringHeight * SCALE;

      const pos = computeHandlerPosition(
        dogPos,
        dogTangent,
        ringW,
        ringH,
        HANDLER_OFFSET,
        handlerPosRef.current,
        HANDLER_SMOOTHING,
      );

      handlerPosRef.current = pos;
      return pos;
    },
    [course],
  );

  // Current positions
  const dogState = getDogState(state.progress);
  const handlerTangent = sampler
    ? sampler.sampleAt(state.progress).tangent
    : { x: 1, y: 0 };
  // Normalize tangent for handler calc
  const tLen = Math.sqrt(handlerTangent.x ** 2 + handlerTangent.y ** 2);
  const normalizedTangent =
    tLen > 1e-10
      ? { x: handlerTangent.x / tLen, y: handlerTangent.y / tLen }
      : { x: 1, y: 0 };
  const handlerPosition = getHandlerPosition(dogState.position, normalizedTangent);

  // Animation loop
  useEffect(() => {
    if (!state.playing || !sampler) return;

    lastTimeRef.current = performance.now();

    const animate = (time: number) => {
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      setState((prev) => {
        const increment = (dt * prev.speed) / prev.duration;
        const newProgress = Math.min(1, prev.progress + increment);

        if (newProgress >= 1) {
          return { ...prev, progress: 1, playing: false };
        }
        return { ...prev, progress: newProgress };
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [state.playing, sampler]);

  // Reset handler position when seeking
  const seek = useCallback((progress: number) => {
    handlerPosRef.current = null;
    setState((prev) => ({ ...prev, progress: Math.max(0, Math.min(1, progress)) }));
  }, []);

  const togglePlay = useCallback(() => {
    setState((prev) => {
      // If at end, restart
      if (prev.progress >= 1) {
        handlerPosRef.current = null;
        return { ...prev, playing: true, progress: 0 };
      }
      return { ...prev, playing: !prev.playing };
    });
  }, []);

  const restart = useCallback(() => {
    handlerPosRef.current = null;
    setState((prev) => ({ ...prev, progress: 0, playing: false }));
  }, []);

  const setSpeed = useCallback((speed: number) => {
    setState((prev) => ({ ...prev, speed }));
  }, []);

  const stepForward = useCallback(() => {
    setState((prev) => ({
      ...prev,
      playing: false,
      progress: Math.min(1, prev.progress + STEP_SIZE),
    }));
  }, []);

  const stepBack = useCallback(() => {
    handlerPosRef.current = null;
    setState((prev) => ({
      ...prev,
      playing: false,
      progress: Math.max(0, prev.progress - STEP_SIZE),
    }));
  }, []);

  const reset = useCallback(() => {
    handlerPosRef.current = null;
    setState({
      playing: false,
      progress: 0,
      speed: 1,
      duration: 0,
    });
  }, []);

  return {
    state,
    dogPosition: dogState.position,
    dogHeading: dogState.heading,
    handlerPosition,
    pathPoints,
    togglePlay,
    restart,
    seek,
    setSpeed,
    stepForward,
    stepBack,
    reset,
  };
}

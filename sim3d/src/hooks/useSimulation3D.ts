import { useState, useCallback, useMemo, useRef } from 'react';
import type { Course } from '../types/course';
import type { SimulationState, PathPoint, DecisionPoint, Signal } from '../types/simulation';
import { SCALE } from '../utils/equipment';
import { catmullRomSpline } from '../utils/spline';
import {
  computeArcLengths,
  totalLength,
  sampleAtDistance,
  sampleDirectionAtDistance,
  findDistanceForPoint,
} from '../utils/pathSampler';

const DOG_SPEED = 4.0; // meters per second at full speed
const HESITATE_SPEED = 2.0;
const HANDLER_SPEED = 2.0; // meters per second walking speed
const SIGNAL_WINDOW_BEFORE = 4.0; // meters before obstacle
const SIGNAL_WINDOW_CLOSE = 1.0; // meters before obstacle (committed)

function buildOrderedPath(course: Course): PathPoint[] {
  const numbered = course.equipment
    .filter((e) => e.orderNumber !== null)
    .sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0));

  const startMarker = course.equipment.find((e) => e.type === 'start');
  const finishMarker = course.equipment.find((e) => e.type === 'finish');

  const points: PathPoint[] = [];
  if (startMarker) points.push({ x: startMarker.x / SCALE, y: startMarker.y / SCALE });
  for (const eq of numbered) {
    points.push({ x: eq.x / SCALE, y: eq.y / SCALE });
  }
  if (finishMarker) points.push({ x: finishMarker.x / SCALE, y: finishMarker.y / SCALE });

  return points;
}

function computeDecisionPoints(
  waypoints: PathPoint[],
  path: PathPoint[],
  arcLengths: number[],
): DecisionPoint[] {
  const decisions: DecisionPoint[] = [];

  // Skip first waypoint (start). Decision at each numbered obstacle.
  for (let i = 1; i < waypoints.length - 1; i++) {
    const prev = waypoints[i - 1];
    const curr = waypoints[i];
    const next = waypoints[i + 1];

    // Incoming direction (prev -> curr) and outgoing direction (curr -> next)
    const incoming = { x: curr.x - prev.x, y: curr.y - prev.y };
    const outgoing = { x: next.x - curr.x, y: next.y - curr.y };

    // Cross product to determine turn direction (from dog's perspective)
    const cross = incoming.x * outgoing.y - incoming.y * outgoing.x;

    // Dot product for angle between directions
    const dot = incoming.x * outgoing.x + incoming.y * outgoing.y;
    const magIn = Math.sqrt(incoming.x ** 2 + incoming.y ** 2);
    const magOut = Math.sqrt(outgoing.x ** 2 + outgoing.y ** 2);
    const angle = magIn > 0 && magOut > 0
      ? Math.acos(Math.max(-1, Math.min(1, dot / (magIn * magOut))))
      : 0;

    const angleDeg = (angle * 180) / Math.PI;

    let correctSignal: Signal;
    if (angleDeg < 30) {
      correctSignal = 'go_on';
    } else if (cross > 0) {
      // In 2D sim coords (y down), positive cross = clockwise = right turn
      correctSignal = 'right';
    } else {
      correctSignal = 'left';
    }

    const obstacleDistance = findDistanceForPoint(path, arcLengths, curr);

    decisions.push({
      obstacleIndex: i,
      correctSignal,
      windowStart: Math.max(0, obstacleDistance - SIGNAL_WINDOW_BEFORE),
      windowEnd: Math.max(0, obstacleDistance - SIGNAL_WINDOW_CLOSE),
      obstacleDistance,
    });
  }

  return decisions;
}

const INITIAL_STATE: SimulationState = {
  dogDistance: 0,
  dogSpeed: 0,
  dogState: 'idle',
  handlerPos: { x: 0, y: 0 },
  handlerTarget: { x: 0, y: 0 },
  nextDecisionIndex: 0,
  running: false,
  finished: false,
  elapsedTime: 0,
  faults: 0,
  currentSignal: null,
  currentObstacleIndex: 0,
};

export function useSimulation3D(course: Course) {
  const [state, setState] = useState<SimulationState>(INITIAL_STATE);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Build spline path from course waypoints
  const { path, arcLengths, pathLength, waypoints, decisionPoints } = useMemo(() => {
    const wp = buildOrderedPath(course);
    const splinePath = catmullRomSpline(wp, 30);
    const al = computeArcLengths(splinePath);
    const dp = computeDecisionPoints(wp, splinePath, al);
    return {
      waypoints: wp,
      path: splinePath,
      arcLengths: al,
      pathLength: totalLength(al),
      decisionPoints: dp,
    };
  }, [course]);

  const start = useCallback(() => {
    const startPos = waypoints[0] ?? { x: 0, y: 0 };
    setState({
      ...INITIAL_STATE,
      running: true,
      dogState: 'approaching',
      dogSpeed: DOG_SPEED,
      handlerPos: startPos,
      handlerTarget: startPos,
    });
  }, [waypoints]);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const sendSignal = useCallback((signal: Signal) => {
    setState((prev) => {
      if (!prev.running || prev.finished) return prev;

      if (signal === 'go' && prev.dogState === 'waiting') {
        return {
          ...prev,
          dogState: 'approaching',
          dogSpeed: DOG_SPEED,
          currentSignal: signal,
        };
      }

      if (signal === 'wait') {
        return {
          ...prev,
          dogState: 'waiting',
          dogSpeed: 0,
          currentSignal: signal,
        };
      }

      // Directional signal
      return { ...prev, currentSignal: signal };
    });
  }, []);

  const moveHandler = useCallback((x: number, z: number) => {
    setState((prev) => ({
      ...prev,
      handlerTarget: { x, y: z },
    }));
  }, []);

  const tick = useCallback(
    (delta: number) => {
      setState((prev) => {
        if (!prev.running || prev.finished) return prev;

        const newElapsed = prev.elapsedTime + delta;
        let newDogDistance = prev.dogDistance;
        let newDogSpeed = prev.dogSpeed;
        let newDogState = prev.dogState;
        let newFaults = prev.faults;
        let newNextDecisionIndex = prev.nextDecisionIndex;
        let newCurrentSignal = prev.currentSignal;
        let newCurrentObstacleIndex = prev.currentObstacleIndex;

        // Handle waiting state
        if (newDogState === 'waiting') {
          newDogSpeed = Math.max(0, newDogSpeed - delta * 5);
          newDogDistance += newDogSpeed * delta;
        } else if (newDogState === 'hesitating') {
          newDogSpeed = HESITATE_SPEED;
          newDogDistance += newDogSpeed * delta;
        } else if (newDogState === 'recovering') {
          newDogSpeed = HESITATE_SPEED;
          newDogDistance += newDogSpeed * delta;
          // After passing the obstacle, recover to approaching
          const currentDP = decisionPoints[newNextDecisionIndex - 1];
          if (currentDP && newDogDistance > currentDP.obstacleDistance + 1) {
            newDogState = 'approaching';
            newDogSpeed = DOG_SPEED;
          }
        } else {
          // approaching or committed
          newDogSpeed = DOG_SPEED;
          newDogDistance += newDogSpeed * delta;
        }

        // Check decision points
        if (newNextDecisionIndex < decisionPoints.length) {
          const dp = decisionPoints[newNextDecisionIndex];

          // Entered signal window
          if (newDogDistance >= dp.windowStart && newDogDistance < dp.windowEnd) {
            if (newCurrentSignal) {
              // Signal received - check correctness
              if (
                newCurrentSignal === dp.correctSignal ||
                newCurrentSignal === 'go_on'
              ) {
                newDogState = 'approaching';
                newDogSpeed = DOG_SPEED;
              } else {
                newDogState = 'recovering';
                newFaults += 1;
              }
              newNextDecisionIndex += 1;
              newCurrentObstacleIndex = dp.obstacleIndex;
              newCurrentSignal = null;
            } else if (newDogState !== 'hesitating' && newDogState !== 'waiting') {
              newDogState = 'hesitating';
            }
          }

          // Past window without signal
          if (newDogDistance >= dp.windowEnd && newNextDecisionIndex === prev.nextDecisionIndex) {
            if (newDogState === 'hesitating') {
              // No signal given - commit but count as fault
              newDogState = 'recovering';
              newFaults += 1;
            } else if (newDogState === 'approaching') {
              // Signal was correct, committed
              newDogState = 'committed';
            }
            newNextDecisionIndex += 1;
            newCurrentObstacleIndex = dp.obstacleIndex;
            newCurrentSignal = null;
          }
        }

        // Past committed zone, back to approaching
        if (newDogState === 'committed') {
          const passedDP = decisionPoints[newNextDecisionIndex - 1];
          if (passedDP && newDogDistance > passedDP.obstacleDistance + 0.5) {
            newDogState = 'approaching';
          }
        }

        // Check if finished
        let finished = false;
        if (newDogDistance >= pathLength) {
          newDogDistance = pathLength;
          finished = true;
          newDogSpeed = 0;
        }

        // Walk handler toward target at HANDLER_SPEED
        const dx = prev.handlerTarget.x - prev.handlerPos.x;
        const dy = prev.handlerTarget.y - prev.handlerPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let handlerPos: PathPoint;
        if (dist < 0.05) {
          handlerPos = prev.handlerTarget;
        } else {
          const step = Math.min(HANDLER_SPEED * delta, dist);
          handlerPos = {
            x: prev.handlerPos.x + (dx / dist) * step,
            y: prev.handlerPos.y + (dy / dist) * step,
          };
        }

        return {
          dogDistance: newDogDistance,
          dogSpeed: newDogSpeed,
          dogState: newDogState,
          handlerPos,
          handlerTarget: prev.handlerTarget,
          nextDecisionIndex: newNextDecisionIndex,
          running: !finished,
          finished,
          elapsedTime: newElapsed,
          faults: newFaults,
          currentSignal: newCurrentSignal,
          currentObstacleIndex: newCurrentObstacleIndex,
        };
      });
    },
    [decisionPoints, pathLength],
  );

  // Derived positions for rendering
  const dogPos2D = sampleAtDistance(path, arcLengths, state.dogDistance);
  const dogDir2D = sampleDirectionAtDistance(path, arcLengths, state.dogDistance);
  const dogRotation = Math.atan2(-dogDir2D.x, -dogDir2D.y);

  // Handler faces toward the dog
  const hToDogX = dogPos2D.x - state.handlerPos.x;
  const hToDogY = dogPos2D.y - state.handlerPos.y;
  const handlerRotation = Math.atan2(-hToDogX, -hToDogY);

  // Get current and next obstacle info
  const currentObstacleName = useMemo(() => {
    if (state.nextDecisionIndex < decisionPoints.length) {
      const dp = decisionPoints[state.nextDecisionIndex];
      const eq = course.equipment
        .filter((e) => e.orderNumber !== null)
        .sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0))[dp.obstacleIndex - 1];
      return eq ? `#${eq.orderNumber} ${eq.type}` : '';
    }
    return state.finished ? 'Finished!' : '';
  }, [state.nextDecisionIndex, state.finished, decisionPoints, course.equipment]);

  const expectedSignal = useMemo(() => {
    if (state.nextDecisionIndex < decisionPoints.length) {
      return decisionPoints[state.nextDecisionIndex].correctSignal;
    }
    return null;
  }, [state.nextDecisionIndex, decisionPoints]);

  return {
    state,
    dogPosition: [dogPos2D.x, 0, dogPos2D.y] as [number, number, number],
    dogRotation,
    handlerPosition: [state.handlerPos.x, 0, state.handlerPos.y] as [number, number, number],
    handlerRotation,
    currentObstacleName,
    expectedSignal,
    decisionPoints,
    waypoints,
    start,
    reset,
    sendSignal,
    moveHandler,
    tick,
  };
}

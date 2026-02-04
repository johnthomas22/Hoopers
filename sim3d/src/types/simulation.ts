export type Signal = 'left' | 'right' | 'go_on' | 'wait' | 'go';

export type DogBehaviorState =
  | 'idle'
  | 'approaching'
  | 'committed'
  | 'hesitating'
  | 'waiting'
  | 'taking_wrong'
  | 'recovering';

export interface DecisionPoint {
  /** Index of the obstacle in the ordered path */
  obstacleIndex: number;
  /** The correct signal for this transition */
  correctSignal: Signal;
  /** Distance along the spline where the signal window opens (~4m before obstacle) */
  windowStart: number;
  /** Distance along the spline where the signal window closes (~1m before obstacle) */
  windowEnd: number;
  /** Distance along the spline of the obstacle itself */
  obstacleDistance: number;
}

export interface PathPoint {
  x: number;
  y: number;
}

export interface SimulationState {
  /** Current distance along the spline (meters) */
  dogDistance: number;
  /** Dog speed in meters/second */
  dogSpeed: number;
  /** Current dog behavior state */
  dogState: DogBehaviorState;
  /** Handler position in 2D sim coords */
  handlerPos: PathPoint;
  /** Target position the handler is walking toward */
  handlerTarget: PathPoint;
  /** Index of the next decision point */
  nextDecisionIndex: number;
  /** Whether the run has started */
  running: boolean;
  /** Whether the run is complete */
  finished: boolean;
  /** Elapsed time in seconds */
  elapsedTime: number;
  /** Number of faults */
  faults: number;
  /** Signal received for current decision point */
  currentSignal: Signal | null;
  /** Index of current target obstacle in ordered path */
  currentObstacleIndex: number;
}

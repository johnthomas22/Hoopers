export interface Point {
  x: number;
  y: number;
}

export interface SplinePoint {
  x: number;
  y: number;
  tx: number; // tangent x (normalized)
  ty: number; // tangent y (normalized)
}

export interface PlaybackState {
  playing: boolean;
  progress: number; // 0-1
  speed: number; // multiplier (0.5, 1, 1.5, 2)
  duration: number; // total animation duration in seconds
}

export interface SimulationConfig {
  dogSpeed: number; // meters per second
  handlerOffsetDistance: number; // meters offset from dog path
  handlerSmoothing: number; // exponential smoothing factor
}

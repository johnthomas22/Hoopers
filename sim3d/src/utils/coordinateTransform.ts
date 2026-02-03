import { SCALE } from './equipment';

/** Convert 2D sim coordinates (pixels) to 3D world coordinates (meters) */
export function simTo3D(simX: number, simY: number): [x: number, y: number, z: number] {
  return [simX / SCALE, 0, simY / SCALE];
}

/** Convert 2D sim coordinates to 3D world x,z only */
export function simToWorld(simX: number, simY: number): { x: number; z: number } {
  return { x: simX / SCALE, z: simY / SCALE };
}

/** Convert 2D sim rotation (degrees) to 3D world y-rotation (radians) */
export function simRotationToWorld(degrees: number): number {
  return -(degrees * Math.PI) / 180;
}

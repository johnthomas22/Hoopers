import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  handlerPosition: [number, number, number];
  dogPosition: [number, number, number];
  handlerRotation: number;
  enabled: boolean;
}

const CAMERA_BEHIND = 3.0;
const CAMERA_HEIGHT = 2.0;
const LOOK_AHEAD = 8.0; // meters ahead of handler to look
const SMOOTH_FACTOR = 3.0;

export default function FollowCamera({
  handlerPosition,
  dogPosition,
  handlerRotation,
  enabled,
}: Props) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const initialized = useRef(false);

  useFrame((_, delta) => {
    if (!enabled) {
      initialized.current = false;
      return;
    }

    const handler = new THREE.Vector3(...handlerPosition);
    const dog = new THREE.Vector3(...dogPosition);

    // Handler forward direction in Three.js: (-sin(rot), 0, -cos(rot))
    const forwardX = -Math.sin(handlerRotation);
    const forwardZ = -Math.cos(handlerRotation);

    // Camera behind the handler
    const desiredPos = new THREE.Vector3(
      handler.x - forwardX * CAMERA_BEHIND,
      CAMERA_HEIGHT,
      handler.z - forwardZ * CAMERA_BEHIND,
    );

    // Look forward along the course ahead of the handler
    const desiredLook = new THREE.Vector3(
      handler.x + forwardX * LOOK_AHEAD,
      0,
      handler.z + forwardZ * LOOK_AHEAD,
    );

    // Snap to position on first frame, then smooth after
    if (!initialized.current) {
      targetPos.current.copy(desiredPos);
      targetLook.current.copy(desiredLook);
      initialized.current = true;
    } else {
      const t = 1 - Math.exp(-SMOOTH_FACTOR * delta);
      targetPos.current.lerp(desiredPos, t);
      targetLook.current.lerp(desiredLook, t);
    }

    camera.position.copy(targetPos.current);
    camera.lookAt(targetLook.current);
  });

  return null;
}

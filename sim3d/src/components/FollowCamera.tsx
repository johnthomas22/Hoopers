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
const CAMERA_HEIGHT = 4.0;
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

  useFrame((_, delta) => {
    if (!enabled) return;

    const handler = new THREE.Vector3(...handlerPosition);
    const dog = new THREE.Vector3(...dogPosition);

    // Camera positioned behind handler
    const behindOffset = new THREE.Vector3(
      -Math.sin(handlerRotation) * CAMERA_BEHIND,
      CAMERA_HEIGHT,
      -Math.cos(handlerRotation) * CAMERA_BEHIND,
    );

    const desiredPos = handler.clone().add(behindOffset);

    // Look at weighted average between dog and next obstacle area
    const desiredLook = dog.clone().lerp(handler, 0.2);
    desiredLook.y = 0.5;

    // Smooth interpolation
    const t = 1 - Math.exp(-SMOOTH_FACTOR * delta);
    targetPos.current.lerp(desiredPos, t);
    targetLook.current.lerp(desiredLook, t);

    camera.position.copy(targetPos.current);
    camera.lookAt(targetLook.current);
  });

  return null;
}

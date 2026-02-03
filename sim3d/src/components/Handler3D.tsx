import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  position: [number, number, number];
  rotation: number;
}

export default function Handler3D({ position, rotation }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    groupRef.current.position.lerp(
      new THREE.Vector3(position[0], position[1], position[2]),
      1 - Math.pow(0.001, delta),
    );

    const targetQuat = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      rotation,
    );
    groupRef.current.quaternion.slerp(targetQuat, 1 - Math.pow(0.01, delta));
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
      {/* Body */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.2, 0.15, 0.9, 8]} />
        <meshStandardMaterial color="#3B82F6" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#FBBF24" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.08, 0.25, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.5, 8]} />
        <meshStandardMaterial color="#1E3A5F" />
      </mesh>
      <mesh position={[0.08, 0.25, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.5, 8]} />
        <meshStandardMaterial color="#1E3A5F" />
      </mesh>
    </group>
  );
}

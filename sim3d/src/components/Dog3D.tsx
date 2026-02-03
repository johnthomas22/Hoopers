import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  position: [number, number, number];
  rotation: number;
  speed: number;
}

export default function Dog3D({ position, rotation, speed }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const bobRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Smooth position interpolation
    groupRef.current.position.lerp(
      new THREE.Vector3(position[0], position[1], position[2]),
      1 - Math.pow(0.001, delta),
    );

    // Smooth rotation
    const targetQuat = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      rotation,
    );
    groupRef.current.quaternion.slerp(targetQuat, 1 - Math.pow(0.01, delta));

    // Trotting bob animation
    if (speed > 0.1) {
      bobRef.current += delta * speed * 8;
      const bob = Math.abs(Math.sin(bobRef.current)) * 0.05;
      groupRef.current.position.y = position[1] + bob;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
      {/* Body */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.25, 0.25, 0.5]} />
        <meshStandardMaterial color="#D97706" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.45, -0.3]}>
        <boxGeometry args={[0.18, 0.18, 0.2]} />
        <meshStandardMaterial color="#B45309" />
      </mesh>
      {/* Snout */}
      <mesh position={[0, 0.4, -0.42]}>
        <boxGeometry args={[0.1, 0.08, 0.08]} />
        <meshStandardMaterial color="#92400E" />
      </mesh>
      {/* Ears */}
      <mesh position={[-0.1, 0.55, -0.25]}>
        <boxGeometry args={[0.06, 0.1, 0.06]} />
        <meshStandardMaterial color="#92400E" />
      </mesh>
      <mesh position={[0.1, 0.55, -0.25]}>
        <boxGeometry args={[0.06, 0.1, 0.06]} />
        <meshStandardMaterial color="#92400E" />
      </mesh>
      {/* Tail */}
      <mesh position={[0, 0.45, 0.3]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.04, 0.04, 0.2]} />
        <meshStandardMaterial color="#D97706" />
      </mesh>
      {/* Front legs */}
      <mesh position={[-0.08, 0.12, -0.15]}>
        <boxGeometry args={[0.06, 0.24, 0.06]} />
        <meshStandardMaterial color="#D97706" />
      </mesh>
      <mesh position={[0.08, 0.12, -0.15]}>
        <boxGeometry args={[0.06, 0.24, 0.06]} />
        <meshStandardMaterial color="#D97706" />
      </mesh>
      {/* Back legs */}
      <mesh position={[-0.08, 0.12, 0.15]}>
        <boxGeometry args={[0.06, 0.24, 0.06]} />
        <meshStandardMaterial color="#D97706" />
      </mesh>
      <mesh position={[0.08, 0.12, 0.15]}>
        <boxGeometry args={[0.06, 0.24, 0.06]} />
        <meshStandardMaterial color="#D97706" />
      </mesh>
    </group>
  );
}

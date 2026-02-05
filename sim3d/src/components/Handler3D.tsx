import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Signal } from '../types/simulation';

interface Props {
  position: [number, number, number];
  rotation: number;
  signal: Signal | null;
}

const ARM_REST_Z = 0.3; // slight outward tilt at rest
const ARM_RAISED_Z = 1.4; // arm raised up
const ARM_LERP_SPEED = 8.0;

export default function Handler3D({ position, rotation, signal }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);

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

    // Animate arms based on signal
    const t = 1 - Math.exp(-ARM_LERP_SPEED * delta);

    let leftTargetZ = ARM_REST_Z;
    let rightTargetZ = -ARM_REST_Z;

    if (signal === 'left') {
      leftTargetZ = ARM_RAISED_Z;
    } else if (signal === 'right') {
      rightTargetZ = -ARM_RAISED_Z;
    } else if (signal === 'go_on') {
      // Both arms raised slightly forward
      leftTargetZ = ARM_RAISED_Z * 0.7;
      rightTargetZ = -ARM_RAISED_Z * 0.7;
    }

    if (leftArmRef.current) {
      leftArmRef.current.rotation.z += (leftTargetZ - leftArmRef.current.rotation.z) * t;
      // Shift position up as arm raises
      const leftRaise = (leftArmRef.current.rotation.z - ARM_REST_Z) / (ARM_RAISED_Z - ARM_REST_Z);
      leftArmRef.current.position.y = 1.1 + leftRaise * 0.2;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.z += (rightTargetZ - rightArmRef.current.rotation.z) * t;
      const rightRaise = (-rightArmRef.current.rotation.z - ARM_REST_Z) / (ARM_RAISED_Z - ARM_REST_Z);
      rightArmRef.current.position.y = 1.1 + rightRaise * 0.2;
    }
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
      {/* Left arm */}
      <mesh ref={leftArmRef} position={[-0.28, 1.1, 0]} rotation={[0, 0, ARM_REST_Z]}>
        <cylinderGeometry args={[0.05, 0.05, 0.55, 8]} />
        <meshStandardMaterial color="#1E3A5F" />
      </mesh>
      {/* Right arm */}
      <mesh ref={rightArmRef} position={[0.28, 1.1, 0]} rotation={[0, 0, -ARM_REST_Z]}>
        <cylinderGeometry args={[0.05, 0.05, 0.55, 8]} />
        <meshStandardMaterial color="#1E3A5F" />
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

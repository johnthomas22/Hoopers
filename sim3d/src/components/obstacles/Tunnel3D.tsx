import { useMemo } from 'react';
import * as THREE from 'three';

interface Props {
  position: [number, number, number];
  rotation: number;
}

const TUNNEL_RADIUS = 0.35;
const TUNNEL_HALF_LENGTH = 1.5;
const CURVE_OFFSET = 0.8; // lateral bend amount in meters

export default function Tunnel3D({ position, rotation }: Props) {
  const { tubeGeometry, entryPos, entryRotY, exitPos, exitRotY } = useMemo(() => {
    // Curve points in local space (tunnel aligned along X axis)
    const entry = new THREE.Vector3(-TUNNEL_HALF_LENGTH, TUNNEL_RADIUS, 0);
    const control = new THREE.Vector3(0, TUNNEL_RADIUS, -CURVE_OFFSET);
    const exit = new THREE.Vector3(TUNNEL_HALF_LENGTH, TUNNEL_RADIUS, 0);

    const curve = new THREE.QuadraticBezierCurve3(entry, control, exit);
    const geometry = new THREE.TubeGeometry(curve, 32, TUNNEL_RADIUS, 12, false);

    // Entry tangent: direction from entry toward control
    const entryTangent = new THREE.Vector3().subVectors(control, entry).normalize();
    const eRotY = Math.atan2(entryTangent.x, entryTangent.z);

    // Exit tangent: direction from control toward exit
    const exitTangent = new THREE.Vector3().subVectors(exit, control).normalize();
    const xRotY = Math.atan2(exitTangent.x, exitTangent.z);

    return {
      tubeGeometry: geometry,
      entryPos: [entry.x, entry.y, entry.z] as [number, number, number],
      entryRotY: eRotY,
      exitPos: [exit.x, exit.y, exit.z] as [number, number, number],
      exitRotY: xRotY,
    };
  }, []);

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Curved tunnel body */}
      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial color="#10B981" transparent opacity={0.5} side={2} />
      </mesh>
      {/* Opening ring - entry */}
      <mesh position={entryPos} rotation={[0, entryRotY, 0]}>
        <torusGeometry args={[TUNNEL_RADIUS, 0.03, 8, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Opening ring - exit */}
      <mesh position={exitPos} rotation={[0, exitRotY, 0]}>
        <torusGeometry args={[TUNNEL_RADIUS, 0.03, 8, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

import { useMemo } from 'react';
import * as THREE from 'three';

interface Props {
  position: [number, number, number];
  rotation: number;
}

const POLE_RADIUS = 0.04;
const POLE_HEIGHT = 1.2;
const HOOP_WIDTH = 1.0; // 1 meter between poles
const ARCH_RADIUS = HOOP_WIDTH / 2;

export default function Hoop3D({ position, rotation }: Props) {
  const archGeometry = useMemo(() => {
    const curve = new THREE.EllipseCurve(
      0, 0,
      ARCH_RADIUS, ARCH_RADIUS * 0.6,
      0, Math.PI,
      false,
      0,
    );
    const points2D = curve.getPoints(32);
    const points3D = points2D.map((p) => new THREE.Vector3(p.x, p.y, 0));
    return new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points3D),
      32,
      POLE_RADIUS,
      8,
      false,
    );
  }, []);

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Left pole */}
      <mesh position={[-HOOP_WIDTH / 2, POLE_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[POLE_RADIUS, POLE_RADIUS, POLE_HEIGHT, 8]} />
        <meshStandardMaterial color="#3B82F6" />
      </mesh>
      {/* Right pole */}
      <mesh position={[HOOP_WIDTH / 2, POLE_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[POLE_RADIUS, POLE_RADIUS, POLE_HEIGHT, 8]} />
        <meshStandardMaterial color="#3B82F6" />
      </mesh>
      {/* Arch */}
      <mesh geometry={archGeometry} position={[0, POLE_HEIGHT, 0]}>
        <meshStandardMaterial color="#3B82F6" />
      </mesh>
    </group>
  );
}

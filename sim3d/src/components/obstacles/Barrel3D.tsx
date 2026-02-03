interface Props {
  position: [number, number, number];
  rotation: number;
}

const BARREL_RADIUS = 0.3;
const BARREL_HEIGHT = 0.6;

export default function Barrel3D({ position, rotation }: Props) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, BARREL_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[BARREL_RADIUS, BARREL_RADIUS * 1.1, BARREL_HEIGHT, 16]} />
        <meshStandardMaterial color="#F59E0B" />
      </mesh>
      {/* Top ring */}
      <mesh position={[0, BARREL_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[BARREL_RADIUS, 0.02, 8, 16]} />
        <meshStandardMaterial color="#D97706" />
      </mesh>
      {/* Bottom ring */}
      <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[BARREL_RADIUS * 1.1, 0.02, 8, 16]} />
        <meshStandardMaterial color="#D97706" />
      </mesh>
    </group>
  );
}

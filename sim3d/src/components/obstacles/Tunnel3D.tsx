interface Props {
  position: [number, number, number];
  rotation: number;
}

const TUNNEL_RADIUS = 0.35;
const TUNNEL_LENGTH = 3.0;

export default function Tunnel3D({ position, rotation }: Props) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Main tunnel body */}
      <mesh position={[0, TUNNEL_RADIUS, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[TUNNEL_RADIUS, TUNNEL_RADIUS, TUNNEL_LENGTH, 16, 1, true]} />
        <meshStandardMaterial color="#10B981" transparent opacity={0.5} side={2} />
      </mesh>
      {/* Opening ring - left */}
      <mesh position={[-TUNNEL_LENGTH / 2, TUNNEL_RADIUS, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[TUNNEL_RADIUS, 0.03, 8, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Opening ring - right */}
      <mesh position={[TUNNEL_LENGTH / 2, TUNNEL_RADIUS, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[TUNNEL_RADIUS, 0.03, 8, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

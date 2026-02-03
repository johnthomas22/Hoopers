import { Text } from '@react-three/drei';

interface Props {
  position: [number, number, number];
  rotation: number;
}

export default function StartMarker3D({ position, rotation }: Props) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Ground circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.8, 32]} />
        <meshStandardMaterial color="#22C55E" transparent opacity={0.6} />
      </mesh>
      {/* Arrow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <coneGeometry args={[0.4, 0.8, 3]} />
        <meshStandardMaterial color="#16A34A" />
      </mesh>
      {/* Label */}
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.4}
        color="#22C55E"
        anchorX="center"
        anchorY="middle"
      >
        START
      </Text>
    </group>
  );
}

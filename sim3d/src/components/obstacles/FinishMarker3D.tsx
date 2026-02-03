import { Text } from '@react-three/drei';

interface Props {
  position: [number, number, number];
  rotation: number;
}

export default function FinishMarker3D({ position, rotation }: Props) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Ground square */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[1.4, 1.4]} />
        <meshStandardMaterial color="#EF4444" transparent opacity={0.6} />
      </mesh>
      {/* Checkered inner */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[1.0, 1.0]} />
        <meshStandardMaterial color="#DC2626" />
      </mesh>
      {/* Label */}
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.4}
        color="#EF4444"
        anchorX="center"
        anchorY="middle"
      >
        FINISH
      </Text>
    </group>
  );
}

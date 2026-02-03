import { Line } from '@react-three/drei';

interface Props {
  ringWidth: number;
  ringHeight: number;
}

export default function Ground({ ringWidth, ringHeight }: Props) {
  const boundaryPoints: [number, number, number][] = [
    [0, 0.02, 0],
    [ringWidth, 0.02, 0],
    [ringWidth, 0.02, ringHeight],
    [0, 0.02, ringHeight],
    [0, 0.02, 0],
  ];

  return (
    <>
      {/* Large ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ringWidth / 2, -0.01, ringHeight / 2]}>
        <planeGeometry args={[ringWidth + 20, ringHeight + 20]} />
        <meshStandardMaterial color="#1a5c1a" />
      </mesh>

      {/* Ring area (slightly brighter green) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ringWidth / 2, 0, ringHeight / 2]}>
        <planeGeometry args={[ringWidth, ringHeight]} />
        <meshStandardMaterial color="#1a6b1a" />
      </mesh>

      {/* Ring boundary line */}
      <Line points={boundaryPoints} color="#4ADE80" lineWidth={2} />

      {/* Grid lines on the ring */}
      {Array.from({ length: Math.floor(ringWidth) + 1 }, (_, i) => (
        <mesh
          key={`gv${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[i, 0.005, ringHeight / 2]}
        >
          <planeGeometry args={[0.02, ringHeight]} />
          <meshStandardMaterial color="#2d5a2d" transparent opacity={0.5} />
        </mesh>
      ))}
      {Array.from({ length: Math.floor(ringHeight) + 1 }, (_, i) => (
        <mesh
          key={`gh${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[ringWidth / 2, 0.005, i]}
        >
          <planeGeometry args={[ringWidth, 0.02]} />
          <meshStandardMaterial color="#2d5a2d" transparent opacity={0.5} />
        </mesh>
      ))}
    </>
  );
}

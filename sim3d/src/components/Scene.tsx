import { Canvas } from '@react-three/fiber';
import { Sky, OrbitControls } from '@react-three/drei';
import type { Course } from '../types/course';
import Ground from './Ground';
import Obstacle3D from './Obstacle3D';
import RunPath3D from './RunPath3D';

interface Props {
  course: Course;
  orbitControls?: boolean;
  onGroundClick?: (x: number, z: number) => void;
  children?: React.ReactNode;
}

export default function Scene({ course, orbitControls = true, onGroundClick, children }: Props) {
  return (
    <Canvas
      camera={{
        position: [course.ringWidth / 2, 20, course.ringHeight + 10],
        fov: 60,
        near: 0.1,
        far: 200,
      }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[20, 30, 10]}
        intensity={1.2}
      />
      <hemisphereLight
        color="#87CEEB"
        groundColor="#1a5c1a"
        intensity={0.3}
      />

      {/* Sky */}
      <Sky
        distance={450000}
        sunPosition={[100, 50, 100]}
        inclination={0.5}
        azimuth={0.25}
      />

      {/* Ground and ring */}
      <Ground ringWidth={course.ringWidth} ringHeight={course.ringHeight} onGroundClick={onGroundClick} />

      {/* Obstacles */}
      {course.equipment.map((eq) => (
        <Obstacle3D key={eq.id} equipment={eq} />
      ))}

      {/* Run path */}
      <RunPath3D course={course} />

      {/* Orbit controls for static/preview mode */}
      {orbitControls && (
        <OrbitControls
          target={[course.ringWidth / 2, 0, course.ringHeight / 2]}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={5}
          maxDistance={60}
        />
      )}

      {children}
    </Canvas>
  );
}

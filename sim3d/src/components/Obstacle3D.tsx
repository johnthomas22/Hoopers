import type { Equipment } from '../types/course';
import { simToWorld, simRotationToWorld } from '../utils/coordinateTransform';
import Hoop3D from './obstacles/Hoop3D';
import Barrel3D from './obstacles/Barrel3D';
import Tunnel3D from './obstacles/Tunnel3D';
import StartMarker3D from './obstacles/StartMarker3D';
import FinishMarker3D from './obstacles/FinishMarker3D';

interface Props {
  equipment: Equipment;
}

export default function Obstacle3D({ equipment }: Props) {
  const { x, z } = simToWorld(equipment.x, equipment.y);
  const rotation = simRotationToWorld(equipment.rotation);
  const position: [number, number, number] = [x, 0, z];

  switch (equipment.type) {
    case 'hoop':
      return <Hoop3D position={position} rotation={rotation} />;
    case 'barrel':
      return <Barrel3D position={position} rotation={rotation} />;
    case 'tunnel':
      return <Tunnel3D position={position} rotation={rotation} />;
    case 'start':
      return <StartMarker3D position={position} rotation={rotation} />;
    case 'finish':
      return <FinishMarker3D position={position} rotation={rotation} />;
  }
}

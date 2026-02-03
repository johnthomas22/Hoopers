import { Group, Rect, Circle, Text, Arc, Line } from 'react-konva';
import type { Equipment } from '../types/course';
import { EQUIPMENT_DEFINITIONS } from '../utils/equipment';

interface Props {
  item: Equipment;
}

export default function StaticEquipment({ item }: Props) {
  const def = EQUIPMENT_DEFINITIONS[item.type];

  const renderShape = () => {
    switch (item.type) {
      case 'hoop':
        return (
          <>
            <Rect
              x={-def.width / 2}
              y={-def.height / 2}
              width={4}
              height={def.height}
              fill={def.color}
              cornerRadius={2}
            />
            <Rect
              x={def.width / 2 - 4}
              y={-def.height / 2}
              width={4}
              height={def.height}
              fill={def.color}
              cornerRadius={2}
            />
            <Arc
              x={0}
              y={-def.height / 2}
              innerRadius={def.width / 2 - 4}
              outerRadius={def.width / 2}
              angle={180}
              rotation={180}
              fill={def.color}
            />
          </>
        );

      case 'barrel':
        return (
          <Circle
            x={0}
            y={0}
            radius={def.width / 2}
            fill={def.color}
            opacity={0.8}
            stroke={def.color}
            strokeWidth={2}
          />
        );

      case 'tunnel':
        return (
          <>
            <Rect
              x={-def.width / 2}
              y={-def.height / 2}
              width={def.width}
              height={def.height}
              fill={def.color}
              opacity={0.6}
              cornerRadius={def.height / 2}
              stroke={def.color}
              strokeWidth={2}
            />
            <Line
              points={[-def.width / 2 + 4, -def.height / 2 + 2, -def.width / 2 + 4, def.height / 2 - 2]}
              stroke="#fff"
              strokeWidth={2}
            />
            <Line
              points={[def.width / 2 - 4, -def.height / 2 + 2, def.width / 2 - 4, def.height / 2 - 2]}
              stroke="#fff"
              strokeWidth={2}
            />
          </>
        );

      case 'start':
        return (
          <>
            <Line
              points={[-14, -14, 14, 0, -14, 14]}
              closed
              fill={def.color}
              opacity={0.8}
              stroke={def.color}
              strokeWidth={2}
            />
            <Text
              text="S"
              x={-6}
              y={-7}
              fontSize={14}
              fontStyle="bold"
              fill="#fff"
            />
          </>
        );

      case 'finish':
        return (
          <>
            <Rect
              x={-14}
              y={-14}
              width={28}
              height={28}
              fill={def.color}
              opacity={0.8}
              stroke={def.color}
              strokeWidth={2}
              cornerRadius={4}
            />
            <Text
              text="F"
              x={-6}
              y={-7}
              fontSize={14}
              fontStyle="bold"
              fill="#fff"
            />
          </>
        );
    }
  };

  return (
    <Group
      x={item.x}
      y={item.y}
      rotation={item.rotation}
    >
      {renderShape()}
      {item.orderNumber !== null && (
        <>
          <Circle x={0} y={-24} radius={10} fill="#1E293B" />
          <Text
            text={String(item.orderNumber)}
            x={item.orderNumber >= 10 ? -7 : -4}
            y={-31}
            fontSize={12}
            fontStyle="bold"
            fill="#fff"
          />
        </>
      )}
    </Group>
  );
}

import { useRef, useEffect } from 'react';
import { Group, Rect, Circle, Text, Arc, Line } from 'react-konva';
import type Konva from 'konva';
import type { Equipment } from '../types/course';
import { EQUIPMENT_DEFINITIONS } from '../utils/equipment';

interface Props {
  item: Equipment;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
}

export default function EquipmentShape({ item, isSelected, onSelect, onDragEnd }: Props) {
  const groupRef = useRef<Konva.Group>(null);
  const def = EQUIPMENT_DEFINITIONS[item.type];

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.to({
        x: item.x,
        y: item.y,
        duration: 0,
      });
    }
  }, [item.x, item.y]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onDragEnd(e.target.x(), e.target.y());
  };

  const renderShape = () => {
    switch (item.type) {
      case 'hoop':
        return (
          <>
            {/* Hoop uprights */}
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
            {/* Hoop arc (top bar) */}
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
            {/* Tunnel opening indicators */}
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
      ref={groupRef}
      x={item.x}
      y={item.y}
      rotation={item.rotation}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={handleDragEnd}
    >
      {renderShape()}
      {/* Order number label */}
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
      {/* Selection indicator */}
      {isSelected && (
        <Circle
          x={0}
          y={0}
          radius={Math.max(def.width, def.height) / 2 + 8}
          stroke="#6366F1"
          strokeWidth={2}
          dash={[4, 4]}
          listening={false}
        />
      )}
    </Group>
  );
}

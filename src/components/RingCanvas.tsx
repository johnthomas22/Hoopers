import { useRef, useState, useCallback, useEffect } from 'react';
import { Stage, Layer, Rect, Line, Text } from 'react-konva';
import type Konva from 'konva';
import type { Course, Equipment } from '../types/course';
import { SCALE } from '../utils/equipment';
import EquipmentShape from './EquipmentShape';

interface Props {
  course: Course;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateEquipment: (id: string, updates: Partial<Equipment>) => void;
}

export default function RingCanvas({ course, selectedId, onSelect, onUpdateEquipment }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1);

  const ringW = course.ringWidth * SCALE;
  const ringH = course.ringHeight * SCALE;

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });

        const scaleX = (rect.width - 40) / ringW;
        const scaleY = (rect.height - 40) / ringH;
        const fitScale = Math.min(scaleX, scaleY, 1.5);
        setStageScale(fitScale);
        setStagePos({
          x: (rect.width - ringW * fitScale) / 2,
          y: (rect.height - ringH * fitScale) / 2,
        });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [ringW, ringH]);

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = stageScale;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const scaleBy = 1.08;
      const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      const clampedScale = Math.max(0.3, Math.min(3, newScale));

      const mousePointTo = {
        x: (pointer.x - stagePos.x) / oldScale,
        y: (pointer.y - stagePos.y) / oldScale,
      };

      setStageScale(clampedScale);
      setStagePos({
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      });
    },
    [stageScale, stagePos],
  );

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target === e.target.getStage() || e.target.name() === 'ring-bg') {
      onSelect(null);
    }
  };

  // Draw grid lines
  const gridLines: { points: number[]; key: string }[] = [];
  for (let x = 0; x <= ringW; x += SCALE) {
    gridLines.push({ points: [x, 0, x, ringH], key: `v${x}` });
  }
  for (let y = 0; y <= ringH; y += SCALE) {
    gridLines.push({ points: [0, y, ringW, y], key: `h${y}` });
  }

  // Run path: connect numbered equipment in order
  const numbered = course.equipment
    .filter((e) => e.orderNumber !== null)
    .sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0));
  const pathPoints = numbered.flatMap((e) => [e.x, e.y]);

  // Include start/finish markers in path
  const startMarker = course.equipment.find((e) => e.type === 'start');
  const finishMarker = course.equipment.find((e) => e.type === 'finish');
  const fullPathPoints: number[] = [];
  if (startMarker) fullPathPoints.push(startMarker.x, startMarker.y);
  fullPathPoints.push(...pathPoints);
  if (finishMarker) fullPathPoints.push(finishMarker.x, finishMarker.y);

  return (
    <div ref={containerRef} className="flex-1 bg-slate-900 overflow-hidden touch-none">
      {dimensions.width > 0 && (
        <Stage
          ref={stageRef}
          width={dimensions.width}
          height={dimensions.height}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePos.x}
          y={stagePos.y}
          draggable
          onWheel={handleWheel}
          onClick={handleStageClick}
          onTap={handleStageClick}
          onDragEnd={(e) => {
            if (e.target === stageRef.current) {
              setStagePos({ x: e.target.x(), y: e.target.y() });
            }
          }}
        >
          <Layer>
            {/* Ring background */}
            <Rect
              name="ring-bg"
              x={0}
              y={0}
              width={ringW}
              height={ringH}
              fill="#1a3a1a"
              stroke="#4ADE80"
              strokeWidth={3}
              cornerRadius={4}
            />

            {/* Grid */}
            {gridLines.map(({ points, key }) => (
              <Line
                key={key}
                points={points}
                stroke="#2d5a2d"
                strokeWidth={0.5}
                listening={false}
              />
            ))}

            {/* Meter labels on edges */}
            {Array.from({ length: course.ringWidth + 1 }, (_, i) => (
              <Text
                key={`lx${i}`}
                x={i * SCALE - 4}
                y={ringH + 6}
                text={`${i}`}
                fontSize={9}
                fill="#4ADE80"
                listening={false}
              />
            ))}
            {Array.from({ length: course.ringHeight + 1 }, (_, i) => (
              <Text
                key={`ly${i}`}
                x={-16}
                y={i * SCALE - 4}
                text={`${i}`}
                fontSize={9}
                fill="#4ADE80"
                listening={false}
              />
            ))}

            {/* Run path */}
            {fullPathPoints.length >= 4 && (
              <Line
                points={fullPathPoints}
                stroke="#F472B6"
                strokeWidth={3}
                dash={[8, 4]}
                tension={0.6}
                opacity={0.7}
                listening={false}
              />
            )}

            {/* Equipment */}
            {course.equipment.map((item) => (
              <EquipmentShape
                key={item.id}
                item={item}
                isSelected={item.id === selectedId}
                onSelect={() => onSelect(item.id)}
                onDragEnd={(x, y) => onUpdateEquipment(item.id, { x, y })}
              />
            ))}
          </Layer>
        </Stage>
      )}
    </div>
  );
}

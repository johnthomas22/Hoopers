import { useRef, useState, useCallback, useEffect } from 'react';
import { Stage, Layer, Rect, Line, Text } from 'react-konva';
import type Konva from 'konva';
import type { Course } from '../types/course';
import type { Point } from '../types/simulation';
import { SCALE } from '../utils/equipment';
import StaticEquipment from './StaticEquipment';
import DogSprite from './DogSprite';
import HandlerSprite from './HandlerSprite';

interface Props {
  course: Course;
  dogPosition: Point;
  dogHeading: number;
  handlerPosition: Point;
  pathPoints: number[];
  progress: number;
}

export default function SimCanvas({
  course,
  dogPosition,
  dogHeading,
  handlerPosition,
  pathPoints,
  progress,
}: Props) {
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

  // Pinch-to-zoom support
  const lastPinchRef = useRef<{ dist: number } | null>(null);

  const handleTouchMove = useCallback((e: Konva.KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    if (touches.length !== 2) {
      lastPinchRef.current = null;
      return;
    }

    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    stage.stopDrag();

    const [t1, t2] = [touches[0], touches[1]];
    const dist = Math.sqrt((t2.clientX - t1.clientX) ** 2 + (t2.clientY - t1.clientY) ** 2);
    const centerX = (t1.clientX + t2.clientX) / 2;
    const centerY = (t1.clientY + t2.clientY) / 2;

    if (lastPinchRef.current) {
      const scaleFactor = dist / lastPinchRef.current.dist;
      const oldScale = stage.scaleX();
      const newScale = Math.max(0.3, Math.min(3, oldScale * scaleFactor));

      const rect = stage.container().getBoundingClientRect();
      const pointTo = {
        x: (centerX - rect.left - stage.x()) / oldScale,
        y: (centerY - rect.top - stage.y()) / oldScale,
      };

      const newPos = {
        x: centerX - rect.left - pointTo.x * newScale,
        y: centerY - rect.top - pointTo.y * newScale,
      };

      stage.scaleX(newScale);
      stage.scaleY(newScale);
      stage.position(newPos);
      stage.batchDraw();

      setStageScale(newScale);
      setStagePos(newPos);
    }

    lastPinchRef.current = { dist };
  }, []);

  const handleTouchEnd = useCallback(() => {
    lastPinchRef.current = null;
  }, []);

  // Grid lines
  const gridLines: { points: number[]; key: string }[] = [];
  for (let x = 0; x <= ringW; x += SCALE) {
    gridLines.push({ points: [x, 0, x, ringH], key: `v${x}` });
  }
  for (let y = 0; y <= ringH; y += SCALE) {
    gridLines.push({ points: [0, y, ringW, y], key: `h${y}` });
  }

  // Build the portion of path already traversed
  const traversedPath = getTraversedPath(pathPoints, progress);

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
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDragEnd={(e) => {
            if (e.target === stageRef.current) {
              setStagePos({ x: e.target.x(), y: e.target.y() });
            }
          }}
        >
          <Layer>
            {/* Ring background */}
            <Rect
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

            {/* Meter labels */}
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

            {/* Full path (faint) */}
            {pathPoints.length >= 4 && (
              <Line
                points={pathPoints}
                stroke="#F472B6"
                strokeWidth={2}
                dash={[6, 4]}
                opacity={0.3}
                listening={false}
              />
            )}

            {/* Traversed path (bright) */}
            {traversedPath.length >= 4 && (
              <Line
                points={traversedPath}
                stroke="#F472B6"
                strokeWidth={3}
                opacity={0.8}
                listening={false}
              />
            )}

            {/* Equipment */}
            {course.equipment.map((item) => (
              <StaticEquipment key={item.id} item={item} />
            ))}

            {/* Handler */}
            <HandlerSprite position={handlerPosition} dogPosition={dogPosition} />

            {/* Dog */}
            <DogSprite position={dogPosition} heading={dogHeading} />
          </Layer>
        </Stage>
      )}
    </div>
  );
}

/**
 * Given the full dense path points array and a progress (0-1),
 * return the subset of points up to that progress.
 */
function getTraversedPath(pathPoints: number[], progress: number): number[] {
  if (pathPoints.length < 4) return [];
  const pointCount = pathPoints.length / 2;
  const endIdx = Math.floor(progress * (pointCount - 1));
  // Include one extra pair for the current interpolated position
  const sliceEnd = Math.min((endIdx + 2) * 2, pathPoints.length);
  return pathPoints.slice(0, sliceEnd);
}

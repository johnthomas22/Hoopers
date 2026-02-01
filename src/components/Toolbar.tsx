import { useState } from 'react';
import type { Course, Equipment } from '../types/course';
import { RING_PRESETS, EQUIPMENT_DEFINITIONS } from '../utils/equipment';

interface Props {
  course: Course;
  selectedId: string | null;
  onSave: () => void;
  onClear: () => void;
  onRotate: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onShowCourseList: () => void;
  onNew: (name: string) => void;
  onSetRingSize: (w: number, h: number) => void;
  onRename: (name: string) => void;
  onRenumber: () => void;
  onUpdateEquipment: (id: string, updates: Partial<Equipment>) => void;
}

export default function Toolbar({
  course,
  selectedId,
  onSave,
  onClear,
  onRotate,
  onRemove,
  onShowCourseList,
  onNew,
  onSetRingSize,
  onRename,
  onRenumber,
  onUpdateEquipment,
}: Props) {
  const [showSettings, setShowSettings] = useState(false);
  const selected = selectedId ? course.equipment.find((e) => e.id === selectedId) : null;

  return (
    <div className="bg-slate-800 border-b border-slate-700 p-3 space-y-2">
      {/* Top row: course name + actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="text"
          value={course.name}
          onChange={(e) => onRename(e.target.value)}
          className="bg-slate-700 text-white text-sm font-semibold px-2 py-1 rounded border border-slate-600 flex-1 min-w-[140px]"
        />
        <button onClick={onSave} className="btn-toolbar bg-indigo-600 hover:bg-indigo-500">
          Save
        </button>
        <button onClick={onShowCourseList} className="btn-toolbar bg-slate-600 hover:bg-slate-500">
          Open
        </button>
        <button onClick={() => onNew('Untitled Course')} className="btn-toolbar bg-slate-600 hover:bg-slate-500">
          New
        </button>
        <button onClick={() => setShowSettings(!showSettings)} className="btn-toolbar bg-slate-600 hover:bg-slate-500">
          ⚙️
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="bg-slate-700 rounded-lg p-3 space-y-2">
          <div className="text-xs text-slate-400 font-medium uppercase">Ring Size</div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(RING_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => onSetRingSize(preset.width, preset.height)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  course.ringWidth === preset.width && course.ringHeight === preset.height
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onRenumber} className="btn-toolbar bg-amber-600 hover:bg-amber-500 text-xs">
              Renumber
            </button>
            <button onClick={onClear} className="btn-toolbar bg-red-600 hover:bg-red-500 text-xs">
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Selection controls */}
      {selected && (
        <div className="flex items-center gap-2 flex-wrap bg-slate-700/50 rounded-lg px-3 py-2">
          <span className="text-xs text-slate-400">
            {EQUIPMENT_DEFINITIONS[selected.type].label}
            {selected.orderNumber !== null && ` #${selected.orderNumber}`}
          </span>
          <button
            onClick={() => onRotate(selected.id, -15)}
            className="btn-toolbar bg-slate-600 hover:bg-slate-500 text-xs"
          >
            ↶ 15°
          </button>
          <button
            onClick={() => onRotate(selected.id, 15)}
            className="btn-toolbar bg-slate-600 hover:bg-slate-500 text-xs"
          >
            ↷ 15°
          </button>
          {selected.orderNumber !== null && (
            <input
              type="number"
              min={1}
              value={selected.orderNumber}
              onChange={(e) =>
                onUpdateEquipment(selected.id, { orderNumber: parseInt(e.target.value) || 1 })
              }
              className="w-14 bg-slate-600 text-white text-xs px-2 py-1 rounded border border-slate-500"
            />
          )}
          <button
            onClick={() => onRemove(selected.id)}
            className="btn-toolbar bg-red-600 hover:bg-red-500 text-xs ml-auto"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

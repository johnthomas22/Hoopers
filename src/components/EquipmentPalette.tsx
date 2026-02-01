import type { EquipmentType } from '../types/course';
import { EQUIPMENT_DEFINITIONS } from '../utils/equipment';

interface Props {
  onAdd: (type: EquipmentType) => void;
}

const PALETTE_ITEMS: EquipmentType[] = ['hoop', 'barrel', 'tunnel', 'start', 'finish'];

export default function EquipmentPalette({ onAdd }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {PALETTE_ITEMS.map((type) => {
        const def = EQUIPMENT_DEFINITIONS[type];
        return (
          <button
            key={type}
            onClick={() => onAdd(type)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors active:scale-95"
            style={{ backgroundColor: def.color }}
          >
            <span className="text-base">
              {type === 'hoop' && '⭕'}
              {type === 'barrel' && '🛢️'}
              {type === 'tunnel' && '🟢'}
              {type === 'start' && '▶️'}
              {type === 'finish' && '🏁'}
            </span>
            {def.label}
          </button>
        );
      })}
    </div>
  );
}

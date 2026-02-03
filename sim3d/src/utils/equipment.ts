import type { EquipmentDefinition, EquipmentType } from '../types/course';

export const EQUIPMENT_DEFINITIONS: Record<EquipmentType, EquipmentDefinition> = {
  hoop: {
    type: 'hoop',
    label: 'Hoop',
    color: '#3B82F6',
    width: 40,
    height: 10,
  },
  barrel: {
    type: 'barrel',
    label: 'Barrel',
    color: '#F59E0B',
    width: 30,
    height: 30,
  },
  tunnel: {
    type: 'tunnel',
    label: 'Tunnel',
    color: '#10B981',
    width: 60,
    height: 24,
  },
  start: {
    type: 'start',
    label: 'Start',
    color: '#22C55E',
    width: 36,
    height: 36,
  },
  finish: {
    type: 'finish',
    label: 'Finish',
    color: '#EF4444',
    width: 36,
    height: 36,
  },
};

export const SCALE = 20; // 1 meter = 20 pixels

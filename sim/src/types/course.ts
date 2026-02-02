export type EquipmentType = 'hoop' | 'barrel' | 'tunnel' | 'start' | 'finish';

export interface Equipment {
  id: string;
  type: EquipmentType;
  x: number;
  y: number;
  rotation: number;
  orderNumber: number | null;
}

export interface Course {
  id: string;
  name: string;
  ringWidth: number;
  ringHeight: number;
  equipment: Equipment[];
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentDefinition {
  type: EquipmentType;
  label: string;
  color: string;
  width: number;
  height: number;
}

import type { ComponentType } from './componentTypes';
import type { ComponentConfig } from './componentConfig';

export interface WorkflowComponent {
  id: string;
  title: string;
  type: ComponentType;
  color: string;
  icon: string;
  position: { x: number; y: number };
  config: ComponentConfig;
}

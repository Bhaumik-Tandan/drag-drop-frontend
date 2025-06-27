import { ComponentType } from '../types/components/componentTypes';
import type { WorkflowComponent } from '../types/components/workflowComponent';


export const COMPONENT_TYPES = {
  INPUT: 'input',
  OUTPUT: 'output',
  ACTION: 'action'
} as const;

const COMPONENT_TEMPLATES: Record<ComponentType, Omit<WorkflowComponent, 'id' | 'position'>> = {
  [COMPONENT_TYPES.INPUT]: {
    title: 'Input Node',
    type: COMPONENT_TYPES.INPUT,
    color: '#10b981',
    icon: '📥',
    config: { inputType: 'text', placeholder: 'Enter value' }
  },
  [COMPONENT_TYPES.OUTPUT]: {
    title: 'Output Node',
    type: COMPONENT_TYPES.OUTPUT,
    color: '#3b82f6',
    icon: '📤',
    config: { outputFormat: 'json' }
  },
  [COMPONENT_TYPES.ACTION]: {
    title: 'Action Node',
    type: COMPONENT_TYPES.ACTION,
    color: '#f59e0b',
    icon: '⚡',
    config: { actionType: 'transform', delay: 0 }
  }
};

export default COMPONENT_TEMPLATES;

// Component types
export const COMPONENT_TYPES = {
  INPUT: 'input',
  OUTPUT: 'output',
  ACTION: 'action'
} as const;

export type ComponentType = typeof COMPONENT_TYPES[keyof typeof COMPONENT_TYPES];

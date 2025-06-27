// Component types
declare const COMPONENT_TYPES: {
  readonly INPUT: 'input';
  readonly OUTPUT: 'output';
  readonly ACTION: 'action';
};
export type ComponentType = typeof COMPONENT_TYPES[keyof typeof COMPONENT_TYPES];

// Component types
declare const COMPONENT_TYPES: {
  readonly INPUT: 'input';
  readonly OUTPUT: 'output';
  readonly ACTION: 'action';
};
export type ComponentType = typeof COMPONENT_TYPES[keyof typeof COMPONENT_TYPES];

// Interfaces for config
export interface InputConfig {
  inputType: string;
  placeholder: string;
}
export interface OutputConfig {
  outputFormat: string;
}
export interface ActionConfig {
  actionType: string;
  delay: number;
}
export type ComponentConfig = InputConfig | OutputConfig | ActionConfig;

// Component interface
export interface WorkflowComponent {
  id: string;
  title: string;
  type: ComponentType;
  color: string;
  icon: string;
  position: { x: number; y: number };
  config: ComponentConfig;
}

// Connection interface
export interface Connection {
  id: string;
  from: string;
  fromType: string;
  to: string;
  toType: string;
}

// Dragged component
export interface DraggedComponent extends Omit<WorkflowComponent, 'id' | 'position'> {
  isFromSidebar: boolean;
  id?: string;
  position?: { x: number; y: number };
}

// Connection start
export interface ConnectionStart {
  componentId: string;
  connectionType: string;
}

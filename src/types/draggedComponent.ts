import type { WorkflowComponent } from './components/workflowComponent';

export interface DraggedComponent extends Omit<WorkflowComponent, 'id' | 'position'> {
  isFromSidebar: boolean;
  id?: string;
  position?: { x: number; y: number };
}

// Utility function to get the connection point for a workflow component
// Used to determine where to draw connection lines on the component
import type { WorkflowComponent } from './types/components/workflowComponent';

export const getConnectionPoint = (component: WorkflowComponent, type: string) => {
  const baseX = component.position.x;
  const baseY = component.position.y;
  const width = 180;
  const height = 100;

  switch (type) {
    case 'input':
      return { x: baseX, y: baseY + height / 2 };
    case 'output':
      return { x: baseX + width, y: baseY + height / 2 };
    case 'top':
      return { x: baseX + width / 2, y: baseY };
    case 'bottom':
      return { x: baseX + width / 2, y: baseY + height };
    default:
      return { x: baseX + width / 2, y: baseY + height / 2 };
  }
};

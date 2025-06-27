import React from 'react';
import type { WorkflowComponent, Connection } from '../types/workflowTypes';

interface ConnectionSVGProps {
  components: WorkflowComponent[];
  connections: Connection[];
  tempConnection: { from: { x: number; y: number }; to: { x: number; y: number } } | null;
  getConnectionPoint: (component: WorkflowComponent, type: string) => { x: number; y: number };
}

const ConnectionSVG: React.FC<ConnectionSVGProps> = ({ components, connections, tempConnection, getConnectionPoint }) => (
  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
    {connections.map(connection => {
      const fromComponent = components.find(c => c.id === connection.from);
      const toComponent = components.find(c => c.id === connection.to);
      if (!fromComponent || !toComponent) return null;
      const fromPos = getConnectionPoint(fromComponent, connection.fromType);
      const toPos = getConnectionPoint(toComponent, connection.toType);
      return (
        <line
          key={connection.id}
          x1={fromPos.x}
          y1={fromPos.y}
          x2={toPos.x}
          y2={toPos.y}
          stroke="#3b82f6"
          strokeWidth="3"
          markerEnd="url(#arrowhead)"
        />
      );
    })}
    {tempConnection && (
      <line
        x1={tempConnection.from.x}
        y1={tempConnection.from.y}
        x2={tempConnection.to.x}
        y2={tempConnection.to.y}
        stroke="#94a3b8"
        strokeWidth="2"
        strokeDasharray="5,5"
      />
    )}
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
      </marker>
    </defs>
  </svg>
);

export default ConnectionSVG;

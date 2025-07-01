import React, { RefObject } from 'react';
import type { WorkflowComponent, Connection, ConnectionStart } from '../types/workflowTypes';
import ComponentCard from './ComponentCard';
import ConnectionSVG from './ConnectionSVG';

interface CanvasProps {
  components: WorkflowComponent[];
  connections: Connection[];
  connectionStart: ConnectionStart | null;
  hoveredComponent: string | null;
  tempConnection: { from: { x: number; y: number }; to: { x: number; y: number } } | null;
  canvasRef: RefObject<HTMLDivElement | null>;
  handleCanvasDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, component: WorkflowComponent, isFromSidebar: boolean) => void;
  handleDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  setHoveredComponent: (id: string | null) => void;
  handleConnectionPointClick: (componentId: string, connectionType: string, event: React.MouseEvent<HTMLDivElement>) => void;
  openConfigModal: (component: WorkflowComponent) => void;
  removeComponent: (id: string) => void;
  removeConnection: (connectionId: string) => void;
  getConnectionPoint: (component: WorkflowComponent, type: string) => { x: number; y: number };
}

const Canvas: React.FC<CanvasProps> = ({
  components,
  connections,
  connectionStart,
  hoveredComponent,
  tempConnection,
  canvasRef,
  handleCanvasDrop,
  handleMouseMove,
  handleDragStart,
  handleDragEnd,
  setHoveredComponent,
  handleConnectionPointClick,
  openConfigModal,
  removeComponent,
  removeConnection,
  getConnectionPoint
}) => (
  <div
    ref={canvasRef}
    style={{ position: 'relative', height: '100%', border: '2px dashed #d1d5db', borderRadius: '8px', backgroundColor: '#fafbfc', overflow: 'hidden' }}
    onDragOver={e => e.preventDefault()}
    onDrop={handleCanvasDrop}
    onMouseMove={handleMouseMove}
  >
    <ConnectionSVG
      components={components}
      connections={connections}
      tempConnection={tempConnection}
      getConnectionPoint={getConnectionPoint}
      removeConnection={removeConnection}
    />
    {components.map(component => (
      <ComponentCard
        key={component.id}
        component={component}
        connectionStart={connectionStart}
        hoveredComponent={hoveredComponent}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onMouseEnter={() => setHoveredComponent(component.id)}
        onMouseLeave={() => setHoveredComponent(null)}
        onConnectionPointClick={handleConnectionPointClick}
        openConfigModal={openConfigModal}
        removeComponent={removeComponent}
      />
    ))}
    {components.length === 0 && (
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: '#9ca3af' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎯</div>
        <div style={{ fontSize: '18px', fontWeight: '500' }}>
          Drag components here to build your workflow
        </div>
      </div>
    )}
  </div>
);

export default Canvas;

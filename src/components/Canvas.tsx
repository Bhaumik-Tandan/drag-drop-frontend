import React, { RefObject, useState, useCallback } from 'react';
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
  updateComponentPosition: (id: string, position: { x: number; y: number }) => void;
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
  getConnectionPoint,
  updateComponentPosition
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only start canvas dragging if clicking on the canvas background (not on components)
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
      e.currentTarget.style.cursor = 'grabbing';
    }
  }, [canvasOffset]);

  const handleMouseMoveCanvas = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const newOffset = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      setCanvasOffset(newOffset);
      
      // Update all component positions to move with the canvas
      components.forEach(component => {
        const newPosition = {
          x: component.position.x + (newOffset.x - canvasOffset.x),
          y: component.position.y + (newOffset.y - canvasOffset.y)
        };
        updateComponentPosition(component.id, newPosition);
      });
    }
    
    // Call the original handleMouseMove for connection functionality
    handleMouseMove(e);
  }, [isDragging, dragStart, canvasOffset, components, updateComponentPosition, handleMouseMove]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grab';
      }
    }
  }, [isDragging, canvasRef]);

  return (
    <div
      ref={canvasRef}
      style={{ 
        position: 'relative', 
        height: '100%', 
        border: '2px dashed #d1d5db', 
        borderRadius: '8px', 
        backgroundColor: '#fafbfc', 
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
      onDragOver={e => e.preventDefault()}
      onDrop={handleCanvasDrop}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMoveCanvas}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
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
};

export default Canvas;

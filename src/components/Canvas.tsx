import React, { RefObject, useState, useCallback, useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [scale, setScale] = useState(1);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
      // Adjust scale for mobile
      if (isMobileDevice) {
        setScale(0.8);
      } else {
        setScale(1);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Touch event handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
      setIsDragging(true);
      setDragStart({ x: touch.clientX - canvasOffset.x, y: touch.clientY - canvasOffset.y });
    }
  }, [canvasOffset]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isDragging && touchStart) {
      const touch = e.touches[0];
      const newOffset = {
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
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
    
    // Handle connection functionality for touch
    if (connectionStart && canvasRef.current) {
      const touch = e.touches[0];
      const rect = canvasRef.current.getBoundingClientRect();
      const touchPos = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };

      const startComponent = components.find(c => c.id === connectionStart.componentId);
      if (startComponent) {
        const startPos = getConnectionPoint(startComponent, connectionStart.connectionType);
        // Update temp connection for touch
        const tempConnectionEvent = {
          from: startPos,
          to: touchPos
        };
        // We need to trigger the temp connection update
        // This would need to be handled in the parent component
      }
    }
  }, [isDragging, touchStart, dragStart, canvasOffset, components, updateComponentPosition, connectionStart, canvasRef, getConnectionPoint]);

  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setTouchStart(null);
    }
  }, [isDragging]);

  // Mouse event handlers (desktop)
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return; // Disable mouse events on mobile
    
    // Only start canvas dragging if clicking on the canvas background (not on components)
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
      e.currentTarget.style.cursor = 'grabbing';
    }
  }, [canvasOffset, isMobile]);

  const handleMouseMoveCanvas = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return; // Disable mouse events on mobile
    
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
  }, [isDragging, dragStart, canvasOffset, components, updateComponentPosition, handleMouseMove, isMobile]);

  const handleMouseUp = useCallback(() => {
    if (isMobile) return; // Disable mouse events on mobile
    
    if (isDragging) {
      setIsDragging(false);
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grab';
      }
    }
  }, [isDragging, canvasRef, isMobile]);

  // Responsive styles
  const canvasStyles = {
    position: 'relative' as const,
    height: '100%',
    minHeight: isMobile ? '400px' : '600px',
    border: '2px dashed #d1d5db',
    borderRadius: '8px',
    backgroundColor: '#fafbfc',
    overflow: 'hidden',
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none' as const,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    width: isMobile ? '100%' : 'auto',
    touchAction: 'none' as const, // Prevent default touch behaviors
  };

  const emptyStateStyles = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center' as const,
    color: '#9ca3af',
    padding: isMobile ? '20px' : '0',
  };

  const emptyStateIconStyles = {
    fontSize: isMobile ? '32px' : '48px',
    marginBottom: isMobile ? '8px' : '12px',
  };

  const emptyStateTextStyles = {
    fontSize: isMobile ? '14px' : '18px',
    fontWeight: '500' as const,
    lineHeight: '1.4',
  };

  return (
    <div
      ref={canvasRef}
      style={canvasStyles}
      className={`canvas-container ${isMobile ? 'mobile-scroll' : ''}`}
      onDragOver={e => e.preventDefault()}
      onDrop={handleCanvasDrop}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMoveCanvas}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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
          isMobile={isMobile}
        />
      ))}
      {components.length === 0 && (
        <div style={emptyStateStyles}>
          <div style={emptyStateIconStyles}>🎯</div>
          <div style={emptyStateTextStyles}>
            {isMobile ? (
              <>
                Tap and drag components here<br />
                to build your workflow
              </>
            ) : (
              'Drag components here to build your workflow'
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;

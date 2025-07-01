import React from 'react';
import type { WorkflowComponent, ComponentConfig, ConnectionStart } from '../types/workflowTypes';

interface ComponentCardProps {
  component: WorkflowComponent;
  connectionStart: ConnectionStart | null;
  hoveredComponent: string | null;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, component: WorkflowComponent, isFromSidebar: boolean) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onConnectionPointClick: (componentId: string, connectionType: string, event: React.MouseEvent<HTMLDivElement>) => void;
  openConfigModal: (component: WorkflowComponent) => void;
  removeComponent: (id: string) => void;
  isMobile?: boolean;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  component,
  connectionStart,
  hoveredComponent,
  onDragStart,
  onDragEnd,
  onMouseEnter,
  onMouseLeave,
  onConnectionPointClick,
  openConfigModal,
  removeComponent,
  isMobile = false
}) => {
  // Responsive sizing
  const cardWidth = isMobile ? '140px' : '180px';
  const cardMinHeight = isMobile ? '80px' : '100px';
  const cardPadding = isMobile ? '12px' : '16px';
  const fontSize = isMobile ? '12px' : '14px';
  const titleFontSize = isMobile ? '12px' : '14px';
  const configFontSize = isMobile ? '10px' : '12px';
  const connectionPointSize = isMobile ? '12px' : '16px';
  const connectionPointOffset = isMobile ? '-6px' : '-8px';

  const cardStyles = {
    position: 'absolute' as const,
    left: component.position.x,
    top: component.position.y,
    width: cardWidth,
    minHeight: cardMinHeight,
    backgroundColor: 'white',
    border: connectionStart?.componentId === component.id ? '3px solid #3b82f6' : '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: cardPadding,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    cursor: 'grab',
    zIndex: 2,
    transition: 'all 0.2s',
    fontSize: fontSize,
    touchAction: 'none' as const, // Prevent default touch behaviors
  };

  const connectionPointStyles = (type: string) => ({
    position: 'absolute' as const,
    width: connectionPointSize,
    height: connectionPointSize,
    backgroundColor: connectionStart?.componentId === component.id && connectionStart?.connectionType === type ? '#3b82f6' : 
      type === 'input' ? '#10b981' : 
      type === 'output' ? '#f59e0b' : 
      type === 'top' ? '#8b5cf6' : '#ef4444',
    borderRadius: '50%',
    border: '2px solid white',
    cursor: 'pointer',
    zIndex: 10,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    // Make connection points larger on mobile for better touch targets
    minWidth: isMobile ? '20px' : connectionPointSize,
    minHeight: isMobile ? '20px' : connectionPointSize,
  });

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: isMobile ? '8px' : '12px',
  };

  const typeBadgeStyles = {
    fontSize: isMobile ? '9px' : '11px',
    fontWeight: '600' as const,
    color: 'white',
    backgroundColor: component.color,
    padding: isMobile ? '1px 4px' : '2px 6px',
    borderRadius: '4px',
    textTransform: 'uppercase' as const,
  };

  const buttonStyles = {
    padding: isMobile ? '6px' : '4px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: isMobile ? '16px' : '14px',
    minWidth: isMobile ? '28px' : 'auto',
    minHeight: isMobile ? '28px' : 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const titleStyles = {
    fontSize: titleFontSize,
    fontWeight: '600' as const,
    marginBottom: isMobile ? '6px' : '8px',
    color: '#374151',
    lineHeight: '1.3',
  };

  const configStyles = {
    fontSize: configFontSize,
    color: '#6b7280',
    lineHeight: '1.3',
  };

  return (
    <div
      draggable
      className="draggable"
      onDragStart={e => onDragStart(e, component, false)}
      onDragEnd={onDragEnd}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={cardStyles}
    >
      {/* Connection Points */}
      {(hoveredComponent === component.id || connectionStart?.componentId === component.id) && (
        <>
          {/* Left connection point (input) */}
          <div
            onClick={e => onConnectionPointClick(component.id, 'input', e)}
            style={{
              ...connectionPointStyles('input'),
              left: connectionPointOffset,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
            title="Input connection"
          />
          {/* Right connection point (output) */}
          <div
            onClick={e => onConnectionPointClick(component.id, 'output', e)}
            style={{
              ...connectionPointStyles('output'),
              right: connectionPointOffset,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
            title="Output connection"
          />
          {/* Top connection point */}
          <div
            onClick={e => onConnectionPointClick(component.id, 'top', e)}
            style={{
              ...connectionPointStyles('top'),
              left: '50%',
              top: connectionPointOffset,
              transform: 'translateX(-50%)',
            }}
            title="Top connection"
          />
          {/* Bottom connection point */}
          <div
            onClick={e => onConnectionPointClick(component.id, 'bottom', e)}
            style={{
              ...connectionPointStyles('bottom'),
              left: '50%',
              bottom: connectionPointOffset,
              transform: 'translateX(-50%)',
            }}
            title="Bottom connection"
          />
        </>
      )}
      <div style={headerStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '8px' }}>
          <span style={{ fontSize: isMobile ? '14px' : '16px' }}>{component.icon}</span>
          <span style={typeBadgeStyles}>{component.type}</span>
        </div>
        <div style={{ display: 'flex', gap: isMobile ? '6px' : '4px' }}>
          <button
            onClick={e => {
              e.stopPropagation();
              openConfigModal(component);
            }}
            style={buttonStyles}
            title="Configure"
          >
            ⚙️
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              removeComponent(component.id);
            }}
            style={buttonStyles}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
      <div style={titleStyles}>{component.title}</div>
      <div style={configStyles}>
        {Object.entries(component.config).map(([key, value]) => (
          <div key={key} style={{ marginBottom: isMobile ? '1px' : '2px' }}>
            <strong>{key}:</strong> {value}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComponentCard;

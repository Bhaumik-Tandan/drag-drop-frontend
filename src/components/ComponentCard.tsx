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
  removeComponent
}) => (
  <div
    draggable
    onDragStart={e => onDragStart(e, component, false)}
    onDragEnd={onDragEnd}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    style={{
      position: 'absolute',
      left: component.position.x,
      top: component.position.y,
      width: '180px',
      minHeight: '100px',
      backgroundColor: 'white',
      border: connectionStart?.componentId === component.id ? '3px solid #3b82f6' : '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      cursor: 'grab',
      zIndex: 2,
      transition: 'all 0.2s'
    }}
  >
    {/* Connection Points */}
    {(hoveredComponent === component.id || connectionStart?.componentId === component.id) && (
      <>
        {/* Left connection point (input) */}
        <div
          onClick={e => onConnectionPointClick(component.id, 'input', e)}
          style={{ position: 'absolute', left: '-8px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', backgroundColor: connectionStart?.componentId === component.id && connectionStart?.connectionType === 'input' ? '#3b82f6' : '#10b981', borderRadius: '50%', border: '2px solid white', cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
          title="Input connection"
        />
        {/* Right connection point (output) */}
        <div
          onClick={e => onConnectionPointClick(component.id, 'output', e)}
          style={{ position: 'absolute', right: '-8px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', backgroundColor: connectionStart?.componentId === component.id && connectionStart?.connectionType === 'output' ? '#3b82f6' : '#f59e0b', borderRadius: '50%', border: '2px solid white', cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
          title="Output connection"
        />
        {/* Top connection point */}
        <div
          onClick={e => onConnectionPointClick(component.id, 'top', e)}
          style={{ position: 'absolute', left: '50%', top: '-8px', transform: 'translateX(-50%)', width: '16px', height: '16px', backgroundColor: connectionStart?.componentId === component.id && connectionStart?.connectionType === 'top' ? '#3b82f6' : '#8b5cf6', borderRadius: '50%', border: '2px solid white', cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
          title="Top connection"
        />
        {/* Bottom connection point */}
        <div
          onClick={e => onConnectionPointClick(component.id, 'bottom', e)}
          style={{ position: 'absolute', left: '50%', bottom: '-8px', transform: 'translateX(-50%)', width: '16px', height: '16px', backgroundColor: connectionStart?.componentId === component.id && connectionStart?.connectionType === 'bottom' ? '#3b82f6' : '#ef4444', borderRadius: '50%', border: '2px solid white', cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
          title="Bottom connection"
        />
      </>
    )}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px' }}>{component.icon}</span>
        <span style={{ fontSize: '11px', fontWeight: '600', color: 'white', backgroundColor: component.color, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>{component.type}</span>
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          onClick={e => {
            e.stopPropagation();
            openConfigModal(component);
          }}
          style={{ padding: '4px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: '4px', fontSize: '14px' }}
          title="Configure"
        >
          ⚙️
        </button>
        <button
          onClick={e => {
            e.stopPropagation();
            removeComponent(component.id);
          }}
          style={{ padding: '4px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: '4px', fontSize: '14px' }}
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>{component.title}</div>
    <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.3' }}>
      {Object.entries(component.config).map(([key, value]) => (
        <div key={key} style={{ marginBottom: '2px' }}>
          <strong>{key}:</strong> {value}
        </div>
      ))}
    </div>
  </div>
);

export default ComponentCard;

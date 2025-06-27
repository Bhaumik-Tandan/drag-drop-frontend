import { useCallback, useRef, useState } from 'react';
import type {
  ComponentType,
  InputConfig,
  OutputConfig,
  ActionConfig,
  ComponentConfig,
  WorkflowComponent,
  Connection,
  DraggedComponent,
  ConnectionStart
} from './types/workflowTypes';

import  COMPONENT_TEMPLATES  from './components/componentTemplates';
import RenderConfigFields from './components/RenderConfigFields';



const WorkflowDashboard = () => {
  const [components, setComponents] = useState<WorkflowComponent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<WorkflowComponent | null>(null);
  const [configModalActive, setConfigModalActive] = useState(false);
  const [draggedComponent, setDraggedComponent] = useState<DraggedComponent | null>(null);
  const [connectionStart, setConnectionStart] = useState<ConnectionStart | null>(null);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [tempConnection, setTempConnection] = useState<{ from: { x: number; y: number }; to: { x: number; y: number } } | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);


  // Remove component
  const removeComponent = useCallback((id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
    setConnections(prev => prev.filter(conn => conn.from !== id && conn.to !== id));
  }, []);

  // Update component position
  const updateComponentPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setComponents(prev => prev.map(comp => (comp.id === id ? { ...comp, position } : comp)));
  }, []);

  // Update component config
  const updateComponentConfig = useCallback((id: string, config: Partial<ComponentConfig>) => {
    setComponents(prev =>
      prev.map(comp => (comp.id === id ? { ...comp, config: { ...comp.config, ...config } } : comp))
    );
  }, []);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, component: Omit<WorkflowComponent, 'id' | 'position'>, isFromSidebar = false) => {
    setDraggedComponent({ ...component, isFromSidebar });
    e.dataTransfer.effectAllowed = 'move';

    // If dragging from canvas, hide the original component
    if (!isFromSidebar) {
      (e.target as HTMLDivElement).style.opacity = '0.5';
    }
  };

  // Handle drop on canvas
  const handleCanvasDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedComponent) return;
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: e.clientX - rect.left - 75, // Offset for component center
      y: e.clientY - rect.top - 40
    };

    if (draggedComponent.isFromSidebar) {
      // Create new component from sidebar template
      const newComponent: WorkflowComponent = {
        id: generateId(),
        title: draggedComponent.title,
        type: draggedComponent.type,
        color: draggedComponent.color,
        icon: draggedComponent.icon,
        position,
        config: { ...draggedComponent.config }
      };
      setComponents(prev => [...prev, newComponent]);
    } else if (draggedComponent.id) {
      // Move existing component
      updateComponentPosition(draggedComponent.id, position);
    }

    setDraggedComponent(null);
  };

  // Handle drag end
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    // Restore opacity for canvas components
    (e.target as HTMLDivElement).style.opacity = '1';
    setDraggedComponent(null);
  };

  // Handle connection creation
  const handleConnectionPointClick = (componentId: string, connectionType: string, event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();

    if (!connectionStart) {
      // Start connection
      setConnectionStart({ componentId, connectionType });
    } else if (connectionStart.componentId !== componentId) {
      // Complete connection
      const newConnection: Connection = {
        id: generateId(),
        from: connectionStart.componentId,
        fromType: connectionStart.connectionType,
        to: componentId,
        toType: connectionType
      };
      setConnections(prev => [...prev, newConnection]);
      setConnectionStart(null);
      setTempConnection(null);
    } else {
      // Cancel connection (clicked same component)
      setConnectionStart(null);
      setTempConnection(null);
    }
  };

  // Handle mouse move for temporary connection line
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (connectionStart && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      const startComponent = components.find(c => c.id === connectionStart.componentId);
      if (startComponent) {
        const startPos = getConnectionPoint(startComponent, connectionStart.connectionType);
        setTempConnection({
          from: startPos,
          to: mousePos
        });
      }
    }
  };

  // Get connection point position
  const getConnectionPoint = (component: WorkflowComponent, type: string) => {
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

  // Open configuration modal
  const openConfigModal = (component: WorkflowComponent) => {
    setSelectedComponent({ ...component });
    setConfigModalActive(true);
  };

  // Save configuration
  const saveConfiguration = () => {
    if (selectedComponent) {
      updateComponentConfig(selectedComponent.id, selectedComponent.config);
    }
    setConfigModalActive(false);
    setSelectedComponent(null);
  };

  // Handle config input changes
  const handleConfigChange = (field: string, value: any) => {
    setSelectedComponent(prev => prev ? ({
      ...prev,
      config: { ...prev.config, [field]: value }
    }) : null);
  };

  const handleTitleChange = (value: string) => {
    setSelectedComponent(prev => prev ? ({ ...prev, title: value }) : null);
  };

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#f9fafb',
        minHeight: '100vh',
        padding: '20px'
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '24px',
            color: '#111827'
          }}
        >
          Workflow Dashboard
        </h1>

        <div style={{ display: 'flex', gap: '20px', height: '700px' }}>
          {/* Sidebar */}
          <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Components Panel */}
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}
            >
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  color: '#374151'
                }}
              >
                Components
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(COMPONENT_TEMPLATES).map(([key, template]) => (
                  <div
                    key={key}
                    draggable
                    onDragStart={e => handleDragStart(e, template, true)}
                    onDragEnd={handleDragEnd}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      cursor: 'grab',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                      width: '100%'
                    }}
                    onMouseEnter={e => {
                      (e.target as HTMLDivElement).style.backgroundColor = '#f9fafb';
                      (e.target as HTMLDivElement).style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                      (e.target as HTMLDivElement).style.backgroundColor = 'white';
                      (e.target as HTMLDivElement).style.transform = 'translateY(0)';
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{template.icon}</span>
                    <span>{template.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools Panel */}
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}
            >
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  color: '#374151'
                }}
              >
                Instructions
              </h3>
              <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                <p style={{ marginBottom: '8px' }}>• Drag components from above to the canvas</p>
                <p style={{ marginBottom: '8px' }}>• Hover over components to see connection points</p>
                <p style={{ marginBottom: '8px' }}>• Click connection points to link components</p>
                <p>• Use gear icon to configure components</p>
              </div>
            </div>
          </div>

          {/* Main Canvas */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                height: '100%'
              }}
            >
              <div
                ref={canvasRef}
                style={{
                  position: 'relative',
                  height: '100%',
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: '#fafbfc',
                  overflow: 'hidden'
                }}
                onDragOver={e => e.preventDefault()}
                onDrop={handleCanvasDrop}
                onMouseMove={handleMouseMove}
              >
                {/* Render connections */}
                <svg
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                >
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

                  {/* Temporary connection line */}
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

                {/* Render components */}
                {components.map(component => (
                  <div
                    key={component.id}
                    draggable
                    onDragStart={e => handleDragStart(e, component, false)}
                    onDragEnd={handleDragEnd}
                    onMouseEnter={() => setHoveredComponent(component.id)}
                    onMouseLeave={() => setHoveredComponent(null)}
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
                          onClick={e => handleConnectionPointClick(component.id, 'input', e)}
                          style={{
                            position: 'absolute',
                            left: '-8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '16px',
                            height: '16px',
                            backgroundColor:
                              connectionStart?.componentId === component.id &&
                              connectionStart?.connectionType === 'input'
                                ? '#3b82f6'
                                : '#10b981',
                            borderRadius: '50%',
                            border: '2px solid white',
                            cursor: 'pointer',
                            zIndex: 10,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                          title="Input connection"
                        />

                        {/* Right connection point (output) */}
                        <div
                          onClick={e => handleConnectionPointClick(component.id, 'output', e)}
                          style={{
                            position: 'absolute',
                            right: '-8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '16px',
                            height: '16px',
                            backgroundColor:
                              connectionStart?.componentId === component.id &&
                              connectionStart?.connectionType === 'output'
                                ? '#3b82f6'
                                : '#f59e0b',
                            borderRadius: '50%',
                            border: '2px solid white',
                            cursor: 'pointer',
                            zIndex: 10,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                          title="Output connection"
                        />

                        {/* Top connection point */}
                        <div
                          onClick={e => handleConnectionPointClick(component.id, 'top', e)}
                          style={{
                            position: 'absolute',
                            left: '50%',
                            top: '-8px',
                            transform: 'translateX(-50%)',
                            width: '16px',
                            height: '16px',
                            backgroundColor:
                              connectionStart?.componentId === component.id && connectionStart?.connectionType === 'top'
                                ? '#3b82f6'
                                : '#8b5cf6',
                            borderRadius: '50%',
                            border: '2px solid white',
                            cursor: 'pointer',
                            zIndex: 10,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                          title="Top connection"
                        />

                        {/* Bottom connection point */}
                        <div
                          onClick={e => handleConnectionPointClick(component.id, 'bottom', e)}
                          style={{
                            position: 'absolute',
                            left: '50%',
                            bottom: '-8px',
                            transform: 'translateX(-50%)',
                            width: '16px',
                            height: '16px',
                            backgroundColor:
                              connectionStart?.componentId === component.id &&
                              connectionStart?.connectionType === 'bottom'
                                ? '#3b82f6'
                                : '#ef4444',
                            borderRadius: '50%',
                            border: '2px solid white',
                            cursor: 'pointer',
                            zIndex: 10,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                          title="Bottom connection"
                        />
                      </>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>{component.icon}</span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: 'white',
                            backgroundColor: component.color,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            textTransform: 'uppercase'
                          }}
                        >
                          {component.type}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            openConfigModal(component);
                          }}
                          style={{
                            padding: '4px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                          title="Configure"
                        >
                          ⚙️
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            removeComponent(component.id);
                          }}
                          style={{
                            padding: '4px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '8px',
                        color: '#374151'
                      }}
                    >
                      {component.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.3' }}>
                      {Object.entries(component.config).map(([key, value]) => (
                        <div key={key} style={{ marginBottom: '2px' }}>
                          <strong>{key}:</strong> {value}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {components.length === 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      color: '#9ca3af'
                    }}
                  >
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎯</div>
                    <div style={{ fontSize: '18px', fontWeight: '500' }}>
                      Drag components here to build your workflow
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Modal */}
        {configModalActive && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                width: '480px',
                maxWidth: '90vw',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
            >
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  marginBottom: '20px',
                  color: '#111827'
                }}
              >
                Configure {selectedComponent?.title}
              </h2>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Component Title</label>
                <input
                  type="text"
                  value={selectedComponent?.title || ''}
                  onChange={e => handleTitleChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <RenderConfigFields selectedComponent={selectedComponent} handleConfigChange={handleConfigChange} />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  marginTop: '24px'
                }}
              >
                <button
                  onClick={() => {
                    setConfigModalActive(false);
                    setSelectedComponent(null);
                  }}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveConfiguration}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowDashboard;

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ComponentConfig,
  WorkflowComponent,
  Connection,
  DraggedComponent,
  ConnectionStart
} from '../types/workflowTypes';

import COMPONENT_TEMPLATES from './componentTemplates';
import { getConnectionPoint } from '../utils';
import Sidebar from './Sidebar';
import Canvas from './Canvas';
import ConfigModal from './ConfigModal';
import JSONWORFLOW from '../../workflowData.json';

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

  useEffect(() => {
    if (JSONWORFLOW && JSONWORFLOW.components && JSONWORFLOW.connections) {
      setComponents(JSONWORFLOW.components as WorkflowComponent[]);
      setConnections(JSONWORFLOW.connections);
    } else {
      // Initialize with default components if no data is provided
      const initialComponents: WorkflowComponent[] = Object.values(COMPONENT_TEMPLATES).map((template: any) => ({
        ...template,
        id: generateId(),
        position: { x: 0, y: 0 }
      }));
      setComponents(initialComponents);
    }
  }, []);


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

  // Function to download workflow data as JSON
  const downloadWorkflowData = () => {
    const data = JSON.stringify({ components, connections }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflowData.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        <button
          onClick={downloadWorkflowData}
          style={{
            marginBottom: '16px',
            padding: '8px 16px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Save Workflow
        </button>
        <div style={{ display: 'flex', gap: '20px', height: '700px' }}>
          {/* Sidebar */}
          <Sidebar
            COMPONENT_TEMPLATES={COMPONENT_TEMPLATES}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
          />
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
              <Canvas
                components={components}
                connections={connections}
                connectionStart={connectionStart}
                hoveredComponent={hoveredComponent}
                tempConnection={tempConnection}
                canvasRef={canvasRef}
                handleCanvasDrop={handleCanvasDrop}
                handleMouseMove={handleMouseMove}
                handleDragStart={handleDragStart}
                handleDragEnd={handleDragEnd}
                setHoveredComponent={setHoveredComponent}
                handleConnectionPointClick={handleConnectionPointClick}
                openConfigModal={openConfigModal}
                removeComponent={removeComponent}
                getConnectionPoint={getConnectionPoint}
              />
            </div>
          </div>
        </div>
        {/* Configuration Modal */}
        <ConfigModal
          selectedComponent={selectedComponent}
          configModalActive={configModalActive}
          handleTitleChange={handleTitleChange}
          handleConfigChange={handleConfigChange}
          saveConfiguration={saveConfiguration}
          closeModal={() => {
            setConfigModalActive(false);
            setSelectedComponent(null);
          }}
        />
      </div>
    </div>
  );
};

export default WorkflowDashboard;

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const WorkflowDashboard = ({ selectedWorkflow }: { selectedWorkflow?: any }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [components, setComponents] = useState<WorkflowComponent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<WorkflowComponent | null>(null);
  const [configModalActive, setConfigModalActive] = useState(false);
  const [draggedComponent, setDraggedComponent] = useState<DraggedComponent | null>(null);
  const [connectionStart, setConnectionStart] = useState<ConnectionStart | null>(null);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [tempConnection, setTempConnection] = useState<{ from: { x: number; y: number }; to: { x: number; y: number } } | null>(null);
  const [workflowName, setWorkflowName] = useState(selectedWorkflow?.name || '');
  const [showNameModal, setShowNameModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Load workflow if id or selectedWorkflow changes
  useEffect(() => {
    const fetchWorkflow = async () => {
      if (id) {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/workflows/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setComponents(data.components || []);
          setConnections(data.connections || []);
          setWorkflowName(data.name || '');
        }
        setLoading(false);
      } else if (selectedWorkflow) {
        setComponents(selectedWorkflow.components || []);
        setConnections(selectedWorkflow.connections || []);
        setWorkflowName(selectedWorkflow.name || '');
      }
    };
    fetchWorkflow();
    // eslint-disable-next-line
  }, [id, selectedWorkflow]);

  // Remove component
  const removeComponent = useCallback((id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
    setConnections(prev => prev.filter(conn => conn.from !== id && conn.to !== id));
  }, []);

  // Remove connection
  const removeConnection = useCallback((connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
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
      // Update the title as well
      setComponents(prev => prev.map(comp =>
        comp.id === selectedComponent.id ? { ...comp, title: selectedComponent.title } : comp
      ));
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

  // Save workflow to backend
  const saveWorkflowToBackend = async (name?: string) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const workflowNameToSend = name || workflowName;
    const body = JSON.stringify({ name: workflowNameToSend, components, connections });
    const method = id ? 'PUT' : 'POST';
    const url = id
      ? `${import.meta.env.VITE_API_URL}/workflows/${id}`
      : `${import.meta.env.VITE_API_URL}/workflows`;
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body,
    });
    setLoading(false);
    if (res.ok) {
      if (!id) {
        const data = await res.json();
        navigate(`/workflow/${data.id}`);
      }
      alert('Workflow saved!');
    } else {
      alert('Failed to save workflow');
    }
  };

  // Inline name update
  const handleNameBlur = async () => {
    setEditingName(false);
    if (id) {
      setLoading(true);
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL}/workflows/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: workflowName }),
      });
      setLoading(false);
    }
  };

  // Delete workflow
  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this workflow?')) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch(`${import.meta.env.VITE_API_URL}/workflows/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setLoading(false);
    if (res.ok) {
      alert('Workflow deleted');
      navigate('/workflows');
    } else {
      alert('Failed to delete workflow');
    }
  };

  const handleSaveClick = () => {
    if (id) {
      saveWorkflowToBackend();
    } else {
      setShowNameModal(true);
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowNameModal(false);
    saveWorkflowToBackend(workflowName);
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
      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
        {loading && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(255,255,255,0.6)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ padding: 32, background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', fontSize: 20, fontWeight: 600 }}>
              Loading...
            </div>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          {editingName ? (
            <input
              ref={nameInputRef}
              value={workflowName}
              onChange={e => setWorkflowName(e.target.value)}
              onBlur={handleNameBlur}
              autoFocus
              style={{ fontSize: 28, fontWeight: 700, border: '1px solid #e5e7eb', borderRadius: 6, padding: 6, minWidth: 200 }}
            />
          ) : (
            <h1
              style={{ fontSize: '32px', fontWeight: '700', color: '#111827', margin: 0, cursor: 'pointer' }}
              onClick={() => setEditingName(true)}
              title="Click to edit name"
            >
              {workflowName || 'Workflow Dashboard'}
            </h1>
          )}
          {id && (
            <button
              onClick={handleDelete}
              style={{ marginLeft: 12, padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
            >
              Delete
            </button>
          )}
        </div>
        <button
          onClick={handleSaveClick}
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
        {showNameModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
          }}>
            <form onSubmit={handleNameSubmit} style={{ background: 'white', padding: 32, borderRadius: 12, minWidth: 320, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Workflow Name</h3>
              <input
                type="text"
                value={workflowName}
                onChange={e => setWorkflowName(e.target.value)}
                required
                style={{ width: '100%', padding: 8, marginBottom: 16, borderRadius: 6, border: '1px solid #e5e7eb' }}
                placeholder="Enter workflow name"
              />
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowNameModal(false)} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#e5e7eb', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#2563eb', color: 'white', fontWeight: 600 }}>Save</button>
              </div>
            </form>
          </div>
        )}
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
                removeConnection={removeConnection}
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

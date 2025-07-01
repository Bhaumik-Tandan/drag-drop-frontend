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
import { Modal } from '@shopify/polaris';

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
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
      if (!isMobileDevice) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Handle config change
  const handleConfigChange = (field: string, value: any) => {
    if (selectedComponent) {
      setSelectedComponent({
        ...selectedComponent,
        config: { ...selectedComponent.config, [field]: value }
      });
    }
  };

  // Handle title change
  const handleTitleChange = (value: string) => {
    if (selectedComponent) {
      setSelectedComponent({ ...selectedComponent, title: value });
    }
  };

  // Download workflow data
  const downloadWorkflowData = () => {
    const data = {
      name: workflowName,
      components,
      connections
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName || 'workflow'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Save workflow to backend
  const saveWorkflowToBackend = async (name?: string) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const workflowData = {
      name: name || workflowName,
      components,
      connections
    };

    const url = id ? `${import.meta.env.VITE_API_URL}/workflows/${id}` : `${import.meta.env.VITE_API_URL}/workflows`;
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(workflowData),
    });

    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      if (!id) {
        navigate(`/workflow/${data.id}`);
      }
      setNotification('Workflow saved successfully');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2200);
      setTimeout(() => setNotification(null), 2500);
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
    setShowDeleteModal(false);
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch(`${import.meta.env.VITE_API_URL}/workflows/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setLoading(false);
    if (res.ok) {
      setNotification('Workflow deleted');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2200);
      setTimeout(() => setNotification(null), 2500);
      navigate('/workflows');
    } else {
      setNotification('Failed to delete workflow');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2200);
      setTimeout(() => setNotification(null), 2500);
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

  // Responsive styles
  const containerStyles = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
    padding: isMobile ? '10px' : '20px',
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '8px' : '16px',
    marginBottom: isMobile ? '16px' : '24px',
    flexWrap: isMobile ? 'wrap' : 'nowrap',
  };

  const titleStyles = {
    fontSize: isMobile ? '24px' : '32px',
    fontWeight: '700' as const,
    color: '#111827',
    margin: 0,
    cursor: 'pointer',
    flex: isMobile ? '1 1 100%' : '0 0 auto',
  };

  const buttonStyles = {
    padding: isMobile ? '6px 12px' : '8px 16px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600' as const,
    fontSize: isMobile ? '12px' : '14px',
  };

  const deleteButtonStyles = {
    ...buttonStyles,
    background: '#ef4444',
    marginLeft: isMobile ? '8px' : '12px',
  };

  const sidebarToggleStyles = {
    ...buttonStyles,
    background: '#6b7280',
    marginBottom: isMobile ? '12px' : '0',
    display: isMobile ? 'block' : 'none',
    width: '100%',
  };

  const mainLayoutStyles: React.CSSProperties = {
    display: 'flex',
    gap: isMobile ? '12px' : '20px',
    height: isMobile ? '500px' : '700px',
    flexDirection: isMobile ? 'column' : 'row',
  };

  const sidebarContainerStyles = {
    width: isMobile ? '100%' : '300px',
    display: isMobile ? (sidebarOpen ? 'block' : 'none') : 'flex',
    flexDirection: 'column' as const,
    gap: isMobile ? '12px' : '16px',
  };

  const canvasContainerStyles = {
    flex: 1,
    minHeight: isMobile ? '400px' : 'auto',
  };

  const canvasWrapperStyles = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: isMobile ? '12px' : '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    height: '100%',
  };

  return (
    <div style={containerStyles}>
      {/* Improved Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: 28,
          right: 28,
          minWidth: 220,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(34,197,94,0.97)', // green-500 with opacity
          color: 'white',
          padding: '10px 20px',
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,0.13)',
          fontWeight: 500,
          fontSize: 15,
          opacity: showNotification ? 1 : 0,
          transition: 'opacity 0.4s',
          zIndex: 4000,
        }}>
          <span style={{fontSize: 20, display: 'flex', alignItems: 'center'}}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="#fff" fillOpacity="0.18"/><path d="M6 10.5L9 13.5L14 8.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <span>{notification}</span>
        </div>
      )}
      <div style={{ width: '100%', position: 'relative' }}>
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
        
        <div style={headerStyles}>
          {editingName ? (
            <input
              ref={nameInputRef}
              value={workflowName}
              onChange={e => setWorkflowName(e.target.value)}
              onBlur={handleNameBlur}
              autoFocus
              style={{ 
                fontSize: isMobile ? 20 : 28, 
                fontWeight: 700, 
                border: '1px solid #e5e7eb', 
                borderRadius: 6, 
                padding: 6, 
                minWidth: isMobile ? 150 : 200,
                flex: isMobile ? '1 1 100%' : '0 0 auto',
              }}
            />
          ) : (
            <h1
              style={titleStyles}
              onClick={() => setEditingName(true)}
              title="Click to edit name"
            >
              {workflowName || 'Workflow Dashboard'}
            </h1>
          )}
          
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={sidebarToggleStyles}
            >
              {sidebarOpen ? 'Hide Components' : 'Show Components'}
            </button>
          )}
          
          {id && (
            <button
              onClick={() => setShowDeleteModal(true)}
              style={deleteButtonStyles}
            >
              Delete
            </button>
          )}
          
          <button
            onClick={handleSaveClick}
            style={buttonStyles}
          >
            Save Workflow
          </button>
        </div>

        {showNameModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
          }}>
            <form onSubmit={handleNameSubmit} style={{ 
              background: 'white', 
              padding: isMobile ? 20 : 32, 
              borderRadius: 12, 
              minWidth: isMobile ? 280 : 320, 
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              margin: isMobile ? '20px' : '0',
            }}>
              <h3 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 700, marginBottom: 16 }}>Workflow Name</h3>
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

        {/* Delete Confirmation Modal */}
        <Modal
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Workflow"
          primaryAction={{
            content: loading ? 'Deleting...' : 'Delete',
            destructive: true,
            onAction: handleDelete,
            loading: loading,
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: () => setShowDeleteModal(false),
            },
          ]}
        >
          <Modal.Section>
            <p>
              Are you sure you want to delete "{workflowName || 'this workflow'}"? This action cannot be undone.
            </p>
          </Modal.Section>
        </Modal>

        <div style={mainLayoutStyles}>
          {/* Sidebar */}
          <div style={sidebarContainerStyles}>
            <Sidebar
              COMPONENT_TEMPLATES={COMPONENT_TEMPLATES}
              handleDragStart={handleDragStart}
              handleDragEnd={handleDragEnd}
              isMobile={isMobile}
            />
          </div>
          
          {/* Main Canvas */}
          <div style={canvasContainerStyles}>
            <div style={canvasWrapperStyles}>
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
                updateComponentPosition={updateComponentPosition}
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
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};

export default WorkflowDashboard;

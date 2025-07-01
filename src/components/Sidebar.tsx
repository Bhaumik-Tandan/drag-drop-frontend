import React from 'react';

interface SidebarProps {
  COMPONENT_TEMPLATES: any;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, template: any, isFromSidebar: boolean) => void;
  handleDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ COMPONENT_TEMPLATES, handleDragStart, handleDragEnd, isMobile = false }) => {
  const containerStyles = {
    width: isMobile ? '100%' : '300px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: isMobile ? '12px' : '16px',
  };

  const panelStyles = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: isMobile ? '16px' : '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
  };

  const titleStyles = {
    fontSize: isMobile ? '16px' : '18px',
    fontWeight: '600' as const,
    marginBottom: isMobile ? '12px' : '16px',
    color: '#374151',
  };

  const componentItemStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '8px' : '12px',
    padding: isMobile ? '10px 12px' : '12px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'grab',
    fontSize: isMobile ? '12px' : '14px',
    fontWeight: '500' as const,
    transition: 'all 0.2s',
    textAlign: 'left' as const,
    width: '100%',
    touchAction: 'none' as const, // Prevent default touch behaviors
  };

  const instructionsStyles = {
    fontSize: isMobile ? '12px' : '14px',
    color: '#6b7280',
    lineHeight: '1.5',
  };

  return (
    <div style={containerStyles}>
      {/* Components Panel */}
      <div style={panelStyles}>
        <h3 style={titleStyles}>Components</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '8px' }}>
          {Object.entries(COMPONENT_TEMPLATES).map(([key, template]: any) => (
            <div
              key={key}
              draggable
              className="draggable"
              onDragStart={e => handleDragStart(e, template, true)}
              onDragEnd={handleDragEnd}
              style={componentItemStyles}
              onMouseEnter={e => {
                (e.target as HTMLDivElement).style.backgroundColor = '#f9fafb';
                (e.target as HTMLDivElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                (e.target as HTMLDivElement).style.backgroundColor = 'white';
                (e.target as HTMLDivElement).style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: isMobile ? '14px' : '16px' }}>{template.icon}</span>
              <span>{template.title}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Tools Panel */}
      <div style={panelStyles}>
        <h3 style={titleStyles}>Instructions</h3>
        <div style={instructionsStyles}>
          <p style={{ marginBottom: isMobile ? '6px' : '8px' }}>
            {isMobile ? '• Tap and drag components to the canvas' : '• Drag components from above to the canvas'}
          </p>
          <p style={{ marginBottom: isMobile ? '6px' : '8px' }}>
            {isMobile ? '• Tap components to see connection points' : '• Hover over components to see connection points'}
          </p>
          <p style={{ marginBottom: isMobile ? '6px' : '8px' }}>
            {isMobile ? '• Tap connection points to link components' : '• Click connection points to link components'}
          </p>
          <p>• Use gear icon to configure components</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

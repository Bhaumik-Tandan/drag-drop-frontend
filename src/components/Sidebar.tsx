import React from 'react';

interface SidebarProps {
  COMPONENT_TEMPLATES: any;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, template: any, isFromSidebar: boolean) => void;
  handleDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ COMPONENT_TEMPLATES, handleDragStart, handleDragEnd }) => (
  <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
    {/* Components Panel */}
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>Components</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Object.entries(COMPONENT_TEMPLATES).map(([key, template]: any) => (
          <div
            key={key}
            draggable
            onDragStart={e => handleDragStart(e, template, true)}
            onDragEnd={handleDragEnd}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white', cursor: 'grab', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s', textAlign: 'left', width: '100%' }}
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
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>Instructions</h3>
      <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
        <p style={{ marginBottom: '8px' }}>• Drag components from above to the canvas</p>
        <p style={{ marginBottom: '8px' }}>• Hover over components to see connection points</p>
        <p style={{ marginBottom: '8px' }}>• Click connection points to link components</p>
        <p>• Use gear icon to configure components</p>
      </div>
    </div>
  </div>
);

export default Sidebar;

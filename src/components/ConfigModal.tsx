import React from 'react';
import RenderConfigFields from './RenderConfigFields';
import type { WorkflowComponent } from '../types/workflowTypes';

interface ConfigModalProps {
  selectedComponent: WorkflowComponent | null;
  configModalActive: boolean;
  handleTitleChange: (value: string) => void;
  handleConfigChange: (field: string, value: any) => void;
  saveConfiguration: () => void;
  closeModal: () => void;
}

const ConfigModal: React.FC<ConfigModalProps> = ({
  selectedComponent,
  configModalActive,
  handleTitleChange,
  handleConfigChange,
  saveConfiguration,
  closeModal
}) => {
  if (!configModalActive || !selectedComponent) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '480px', maxWidth: '90vw', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#111827' }}>
          Configure {selectedComponent?.title}
        </h2>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Component Title</label>
          <input
            type="text"
            value={selectedComponent?.title || ''}
            onChange={e => handleTitleChange(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
          />
        </div>
        <RenderConfigFields selectedComponent={selectedComponent} handleConfigChange={handleConfigChange} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={closeModal}
            style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
          >
            Cancel
          </button>
          <button
            onClick={saveConfiguration}
            style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', backgroundColor: '#3b82f6', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;

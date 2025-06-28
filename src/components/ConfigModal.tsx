import React from 'react';
import { Modal, TextField, Button } from '@shopify/polaris';
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
    <Modal
      open={configModalActive}
      onClose={closeModal}
      title={`Configure ${selectedComponent?.title}`}
      primaryAction={{
        content: 'Save',
        onAction: saveConfiguration,
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: closeModal,
        },
      ]}
    >
      <Modal.Section>
        <div style={{ marginBottom: 'var(--p-space-4)' }}>
          <TextField
            label="Component Title"
            value={selectedComponent?.title || ''}
            onChange={handleTitleChange}
            autoComplete="off"
          />
        </div>
        <RenderConfigFields selectedComponent={selectedComponent} handleConfigChange={handleConfigChange} />
      </Modal.Section>
    </Modal>
  );
};

export default ConfigModal;

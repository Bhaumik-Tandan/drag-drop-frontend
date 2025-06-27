import React from 'react';
import { WorkflowComponent } from '../types/components/workflowComponent';
import { COMPONENT_TYPES } from '../components/componentTemplates';
import { InputConfig } from '../types/components/componentConfig';
import { OutputConfig } from '../types/components/componentConfig';
import { ActionConfig } from '../types/components/componentConfig';

export interface RenderConfigFieldsProps {
  selectedComponent: WorkflowComponent | null;
  handleConfigChange: (field: string, value: any) => void;
}

const RenderConfigFields = ({ selectedComponent, handleConfigChange }: RenderConfigFieldsProps) => {
  if (!selectedComponent) return null;
  const { type, config } = selectedComponent;
  switch (type) {
    case COMPONENT_TYPES.INPUT: {
      const inputConfig = config as InputConfig;
      return (
        <>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Input Type</label>
            <select
              value={inputConfig.inputType}
              onChange={e => handleConfigChange('inputType', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="file">File</option>
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Placeholder</label>
            <input
              type="text"
              value={inputConfig.placeholder}
              onChange={e => handleConfigChange('placeholder', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
        </>
      );
    }
    case COMPONENT_TYPES.OUTPUT: {
      const outputConfig = config as OutputConfig;
      return (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Output Format</label>
          <select
            value={outputConfig.outputFormat}
            onChange={e => handleConfigChange('outputFormat', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="text">Text</option>
          </select>
        </div>
      );
    }
    case COMPONENT_TYPES.ACTION: {
      const actionConfig = config as ActionConfig;
      return (
        <>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Action Type</label>
            <select
              value={actionConfig.actionType}
              onChange={e => handleConfigChange('actionType', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="transform">Transform</option>
              <option value="filter">Filter</option>
              <option value="aggregate">Aggregate</option>
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Delay (ms)</label>
            <input
              type="number"
              value={actionConfig.delay}
              onChange={e => handleConfigChange('delay', parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
        </>
      );
    }
    default:
      return null;
  }
};

export default RenderConfigFields;

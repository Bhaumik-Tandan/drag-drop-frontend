import React from 'react';
import ReactDOM from 'react-dom/client';

import WorkflowDashboard from './components/WorkflowDashboard';
import JSONWORFLOW from '../workflowData.json';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement as HTMLElement).render(
    <React.StrictMode>
      <WorkflowDashboard initialData={JSONWORFLOW} />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}

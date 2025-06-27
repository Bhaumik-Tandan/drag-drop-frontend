import React from 'react';
import ReactDOM from 'react-dom/client';

import WorkflowDashboard from './WorkflowDashboard';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement as HTMLElement).render(
    <React.StrictMode>
      <WorkflowDashboard />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import WorkflowDashboard from './components/WorkflowDashboard';
import Login from './components/Login';
import Register from './components/Register';
import WorkflowList from './components/WorkflowList';

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/workflows"
          element={
            <RequireAuth>
              <WorkflowList onSelect={(wf) => {
                setSelectedWorkflow(wf);
                window.location.href = `/workflow/${wf.id}`;
              }} />
            </RequireAuth>
          }
        />
        <Route
          path="/workflow/:id"
          element={
            <RequireAuth>
              <WorkflowDashboard selectedWorkflow={selectedWorkflow} />
            </RequireAuth>
          }
        />
        <Route
          path="/workflow"
          element={
            <RequireAuth>
              <WorkflowDashboard />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to={isLoggedIn ? '/workflows' : '/login'} replace />} />
      </Routes>
    </Router>
  );
};

export default App;

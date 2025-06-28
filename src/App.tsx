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

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  return (
    <Router>
      {isLoggedIn && (
        <div style={{ position: 'fixed', top: 20, right: 30, zIndex: 1000 }}>
          <button
            onClick={handleLogout}
            style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      )}
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

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, Button, Frame, Page, TopBar, Navigation } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
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
  const [userMenuActive, setUserMenuActive] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserEmail('');
    window.location.href = '/login';
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    setIsLoggedIn(!!token);
    setUserEmail(email || '');
  }, []);

  const i18n = {
    Polaris: {
      Common: {
        checkbox: 'checkbox',
      },
    },
  };

  const userMenuActions = [
    {
      items: [
        {
          content: 'Workflows',
          onAction: () => window.location.href = '/workflows',
        },
        {
          content: 'New Workflow',
          onAction: () => window.location.href = '/workflow',
        },
      ],
    },
    {
      items: [
        {
          content: 'Logout',
          onAction: handleLogout,
          destructive: true,
        },
      ],
    },
  ];

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      userMenu={
        <TopBar.UserMenu
          actions={userMenuActions}
          name={userEmail || 'User'}
          detail="Workflow Builder"
          initials={userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
          open={userMenuActive}
          onToggle={() => setUserMenuActive(!userMenuActive)}
        />
      }
    />
  );

 

  return (
    <AppProvider i18n={i18n}>
      <Router>
        {isLoggedIn ? (
          <Frame
            topBar={topBarMarkup}
          >
            <Routes>
              <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/workflows"
                element={
                  <RequireAuth>
                    <Page
                      title="Workflows"
                      primaryAction={{
                        content: 'New Workflow',
                        onAction: () => window.location.href = '/workflow',
                      }}
                    >
                      <WorkflowList onSelect={(wf) => {
                        setSelectedWorkflow(wf);
                        window.location.href = `/workflow/${wf.id}`;
                      }} />
                    </Page>
                  </RequireAuth>
                }
              />
              <Route
                path="/workflow/:id"
                element={
                  <RequireAuth>
                    <Page
                      title={selectedWorkflow?.name || 'Workflow'}
                      backAction={{
                        content: 'Workflows',
                        onAction: () => window.location.href = '/workflows',
                      }}
                  
                    >
                      <WorkflowDashboard selectedWorkflow={selectedWorkflow} />
                    </Page>
                  </RequireAuth>
                }
              />
              <Route
                path="/workflow"
                element={
                  <RequireAuth>
                    <Page
                      title="New Workflow"
                      backAction={{
                        content: 'Workflows',
                        onAction: () => window.location.href = '/workflows',
                      }}
                    >
                      <WorkflowDashboard />
                    </Page>
                  </RequireAuth>
                }
              />
              <Route path="*" element={<Navigate to={isLoggedIn ? '/workflows' : '/login'} replace />} />
            </Routes>
          </Frame>
        ) : (
          <Routes>
            <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </Router>
    </AppProvider>
  );
};

export default App;

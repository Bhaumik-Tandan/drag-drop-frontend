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
  const [isMobile, setIsMobile] = useState(false);

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

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
      contextControl={
        <button
          onClick={() => window.location.href = '/'}
          style={{
            color: '#fff',
            background: 'transparent',
            border: 'none',
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: isMobile ? '6px 16px' : '8px 20px',
            borderRadius: '24px',
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s',
            outline: 'none',
            minHeight: isMobile ? '36px' : 'auto',
          }}
          onMouseOver={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)')}
          onMouseOut={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
        >
          <span>Home</span>
        </button>
      }
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
                      fullWidth
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
                      fullWidth
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

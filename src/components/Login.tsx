import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, FormLayout, TextField, Button, Banner, Page } from '@shopify/polaris';
import { login as loginApi } from '../utils/apiHelper';

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLoginInputChange = (value: string, id: string) => {
    setLoginForm({ ...loginForm, [id]: value });
  };

  const handleLoginSubmit = async () => {
    setLoginError(null);
    try {
      const data = await loginApi(loginForm.email, loginForm.password);
      localStorage.setItem('token', data.access_token || data.token || '');
      onLogin();
      navigate('/workflow', { replace: true });
    } catch (err: any) {
      setLoginError('Invalid email or password');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'var(--p-surface)'
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <Card>
          <div style={{ padding: 'var(--p-space-8)' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--p-space-6)' }}>
              <h1 style={{ 
                fontSize: 'var(--p-font-size-7)', 
                fontWeight: 'var(--p-font-weight-bold)',
                margin: 0,
                color: 'var(--p-text)'
              }}>
                Welcome Back
              </h1>
              <p style={{ 
                color: 'var(--p-text-subdued)', 
                marginTop: 'var(--p-space-2)',
                marginBottom: 0
              }}>
                Sign in to your account
              </p>
            </div>

            {loginError && (
              <Banner tone="critical" onDismiss={() => setLoginError(null)}>
                {loginError}
              </Banner>
            )}

            <FormLayout>
              <TextField
                label="Email"
                type="email"
                value={loginForm.email}
                onChange={handleLoginInputChange}
                id="email"
                autoComplete="email"
              />
              <TextField
                label="Password"
                type="password"
                value={loginForm.password}
                onChange={handleLoginInputChange}
                id="password"
                autoComplete="current-password"
              />
              <Button
                variant="primary"
                fullWidth
                onClick={handleLoginSubmit}
                disabled={!loginForm.email || !loginForm.password}
              >
                Sign In
              </Button>
            </FormLayout>

            <div style={{ 
              marginTop: 'var(--p-space-6)', 
              textAlign: 'center',
              paddingTop: 'var(--p-space-4)',
              borderTop: '1px solid var(--p-border-subdued)'
            }}>
              <p style={{ 
                color: 'var(--p-text-subdued)', 
                margin: 0,
                fontSize: 'var(--p-font-size-3)'
              }}>
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  style={{ 
                    color: 'var(--p-action-primary)', 
                    textDecoration: 'none',
                    fontWeight: 'var(--p-font-weight-semibold)'
                  }}
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
